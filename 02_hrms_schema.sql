-- ==========================================
-- EMPAY HRMS: EXTENDED MODULES SCHEMA
-- Attendance, Leaves, Payroll, Payslips
-- ==========================================

-- ==========================================
-- 1. ATTENDANCE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    work_hours NUMERIC(5,2) DEFAULT 0,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'half-day', 'absent', 'on-leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- ==========================================
-- 2. LEAVES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('paid', 'sick', 'unpaid', 'casual')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- ==========================================
-- 3. LEAVE BALANCES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
    paid_total INTEGER DEFAULT 12,
    paid_used INTEGER DEFAULT 0,
    sick_total INTEGER DEFAULT 6,
    sick_used INTEGER DEFAULT 0,
    casual_total INTEGER DEFAULT 6,
    casual_used INTEGER DEFAULT 0,
    UNIQUE(employee_id, year)
);

-- ==========================================
-- 4. SALARY STRUCTURES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
    hra_percent NUMERIC(5,2) DEFAULT 40.00,
    da_percent NUMERIC(5,2) DEFAULT 10.00,
    pf_percent NUMERIC(5,2) DEFAULT 12.00,
    professional_tax NUMERIC(8,2) DEFAULT 200.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. PAYROLL TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    working_days INTEGER DEFAULT 0,
    days_present INTEGER DEFAULT 0,
    days_absent INTEGER DEFAULT 0,
    leaves_taken INTEGER DEFAULT 0,
    basic NUMERIC(12,2) DEFAULT 0,
    hra NUMERIC(12,2) DEFAULT 0,
    da NUMERIC(12,2) DEFAULT 0,
    gross_salary NUMERIC(12,2) DEFAULT 0,
    pf_deduction NUMERIC(12,2) DEFAULT 0,
    professional_tax NUMERIC(12,2) DEFAULT 0,
    other_deductions NUMERIC(12,2) DEFAULT 0,
    total_deductions NUMERIC(12,2) DEFAULT 0,
    net_salary NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);

-- ==========================================
-- 6. PAYSLIPS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID REFERENCES public.payroll(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    payslip_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES: ATTENDANCE
-- ==========================================

-- Employees can view their own attendance
CREATE POLICY "Employees can view own attendance"
ON public.attendance FOR SELECT
USING (employee_id = auth.uid());

-- HR/Admin can view all attendance in their company
CREATE POLICY "HR/Admin can view company attendance"
ON public.attendance FOR SELECT
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_manage_users = true OR r.can_view_all_attendance = true)
    )
);

-- Employees can insert their own attendance
CREATE POLICY "Employees can insert own attendance"
ON public.attendance FOR INSERT
WITH CHECK (employee_id = auth.uid() AND company_id = public.get_auth_company_id());

-- Employees can update their own attendance (for checkout)
CREATE POLICY "Employees can update own attendance"
ON public.attendance FOR UPDATE
USING (employee_id = auth.uid());

-- ==========================================
-- RLS POLICIES: LEAVES
-- ==========================================

-- Employees can view their own leaves
CREATE POLICY "Employees can view own leaves"
ON public.leaves FOR SELECT
USING (employee_id = auth.uid());

-- HR/Admin/Payroll can view all leaves in their company
CREATE POLICY "HR/Admin/Payroll can view company leaves"
ON public.leaves FOR SELECT
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_manage_leaves = true OR r.can_process_payroll = true OR r.can_manage_users = true)
    )
);

-- Employees can insert their own leaves
CREATE POLICY "Employees can insert own leaves"
ON public.leaves FOR INSERT
WITH CHECK (employee_id = auth.uid() AND company_id = public.get_auth_company_id());

-- HR/Admin/Payroll can update leaves (approve/reject)
CREATE POLICY "HR/Admin/Payroll can update leaves"
ON public.leaves FOR UPDATE
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_manage_leaves = true OR r.can_process_payroll = true OR r.can_manage_users = true)
    )
);

-- ==========================================
-- RLS POLICIES: LEAVE BALANCES
-- ==========================================

-- Employees can view their own balances
CREATE POLICY "Employees can view own leave balances"
ON public.leave_balances FOR SELECT
USING (employee_id = auth.uid());

-- HR/Admin can view all balances
CREATE POLICY "HR/Admin can view company leave balances"
ON public.leave_balances FOR SELECT
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_manage_leaves = true OR r.can_manage_users = true)
    )
);

-- HR/Admin can manage balances
CREATE POLICY "HR/Admin can manage leave balances"
ON public.leave_balances FOR ALL
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_manage_leaves = true OR r.can_manage_users = true)
    )
);

-- ==========================================
-- RLS POLICIES: SALARY STRUCTURES
-- ==========================================

-- Payroll/Admin can view and manage salary structures
CREATE POLICY "Payroll/Admin can manage salary structures"
ON public.salary_structures FOR ALL
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_process_payroll = true OR r.can_manage_users = true)
    )
);

-- ==========================================
-- RLS POLICIES: PAYROLL
-- ==========================================

-- Employees can view their own payroll
CREATE POLICY "Employees can view own payroll"
ON public.payroll FOR SELECT
USING (employee_id = auth.uid());

-- Payroll/Admin can view and manage all payroll
CREATE POLICY "Payroll/Admin can manage payroll"
ON public.payroll FOR ALL
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_process_payroll = true OR r.can_manage_users = true)
    )
);

-- ==========================================
-- RLS POLICIES: PAYSLIPS
-- ==========================================

-- Employees can view their own payslips
CREATE POLICY "Employees can view own payslips"
ON public.payslips FOR SELECT
USING (employee_id = auth.uid());

-- Payroll/Admin can manage payslips
CREATE POLICY "Payroll/Admin can manage payslips"
ON public.payslips FOR ALL
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.profiles p ON p.role_id = r.id
        WHERE p.id = auth.uid() AND (r.can_process_payroll = true OR r.can_manage_users = true)
    )
);

-- ==========================================
-- HELPER FUNCTION: Auto-calculate work hours
-- ==========================================
CREATE OR REPLACE FUNCTION public.calculate_work_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.check_in IS NOT NULL AND NEW.check_out IS NOT NULL THEN
        NEW.work_hours := ROUND(EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600.0, 2);
        IF NEW.work_hours < 4 THEN
            NEW.status := 'half-day';
        ELSE
            NEW.status := 'present';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to auto-calculate work_hours on update
DROP TRIGGER IF EXISTS trg_calculate_work_hours ON public.attendance;
CREATE TRIGGER trg_calculate_work_hours
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_work_hours();

-- ==========================================
-- HELPER FUNCTION: Initialize leave balance for new employee
-- ==========================================
CREATE OR REPLACE FUNCTION public.initialize_leave_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.leave_balances (employee_id, company_id, year)
    VALUES (NEW.id, NEW.company_id, EXTRACT(YEAR FROM NOW())::INTEGER)
    ON CONFLICT (employee_id, year) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger to auto-create leave balance when a profile is created
DROP TRIGGER IF EXISTS trg_init_leave_balance ON public.profiles;
CREATE TRIGGER trg_init_leave_balance
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_leave_balance();
