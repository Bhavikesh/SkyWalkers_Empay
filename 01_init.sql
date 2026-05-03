-- ==========================================
-- EMPAY HRMS: MULTI-TENANT SCHEMA INIT
-- ==========================================

-- Drop existing tables if they exist (Be careful in production!)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- 1. Create Companies Table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- E.g., 'OI'
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Roles Table (Permission-Based)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE, -- Null means system default
    can_manage_users BOOLEAN DEFAULT false,
    can_manage_leaves BOOLEAN DEFAULT false,
    can_process_payroll BOOLEAN DEFAULT false,
    can_view_all_attendance BOOLEAN DEFAULT false,
    can_view_all_employees BOOLEAN DEFAULT false,
    UNIQUE(name, company_id)
);

-- Seed System Default Roles
INSERT INTO public.roles (name, can_manage_users, can_manage_leaves, can_process_payroll, can_view_all_attendance, can_view_all_employees)
VALUES 
    ('Admin', true, true, true, true, true),
    ('HR Officer', true, true, false, true, true),
    ('Payroll Officer', false, false, true, true, false),
    ('Employee', false, false, false, false, true);

-- 3. Create Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id),
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    login_id TEXT UNIQUE NOT NULL, -- E.g., OIJODO20220001
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    resume_url TEXT,
    dob DATE,
    address TEXT,
    nationality TEXT,
    personal_email TEXT,
    gender TEXT,
    marital_status TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function to securely get current user's company_id
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cid UUID;
BEGIN
    SELECT company_id INTO cid FROM public.profiles WHERE id = auth.uid();
    RETURN cid;
END;
$$;

-- Companies: Users can only view their own company
CREATE POLICY "Users can view their own company" 
ON public.companies FOR SELECT 
USING (id = public.get_auth_company_id());

-- Roles: Users can view system roles (company_id is null) or their company's custom roles
CREATE POLICY "Users can view relevant roles" 
ON public.roles FOR SELECT 
USING (company_id IS NULL OR company_id = public.get_auth_company_id());

-- Profiles (Multi-Tenant + Permissions)
-- 0. Users can ALWAYS read their own profile (prevents circular RLS dependency)
CREATE POLICY "Users can always read own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

-- 1. Everyone can view profiles in their company (needed for directory)
CREATE POLICY "Users can view profiles in their company" 
ON public.profiles FOR SELECT 
USING (company_id = public.get_auth_company_id());

-- 2. Users with 'can_manage_users' can insert/update profiles within their company
CREATE POLICY "HR/Admin can manage profiles" 
ON public.profiles FOR ALL
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r 
        JOIN public.profiles p ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.can_manage_users = true
    )
);

-- 3. Users can update their own profile (basic info like password change triggers, etc)
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- Audit Logs
-- Users with 'can_manage_users' or 'can_process_payroll' can view logs in their company
CREATE POLICY "Admins can view company audit logs"
ON public.audit_logs FOR SELECT
USING (
    company_id = public.get_auth_company_id() AND
    EXISTS (
        SELECT 1 FROM public.roles r 
        JOIN public.profiles p ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND (r.can_manage_users = true OR r.can_process_payroll = true)
    )
);

-- Helper Function to resolve Login ID to Email for Authentication
CREATE OR REPLACE FUNCTION public.resolve_login_id(p_login_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
BEGIN
    SELECT email INTO v_email FROM public.profiles WHERE login_id = p_login_id;
    RETURN v_email;
END;
$$;
