// Database type definitions for the EmPay HRMS system

export interface Company {
  id: string
  name: string
  code: string
  logo_url?: string
  created_at: string
}

export interface Role {
  id: string
  name: string
  company_id?: string
  can_manage_users: boolean
  can_manage_leaves: boolean
  can_process_payroll: boolean
  can_view_all_attendance: boolean
  can_view_all_employees: boolean
}

export interface Profile {
  id: string
  company_id: string
  role_id: string
  manager_id?: string
  login_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  address?: string
  is_active: boolean
  is_first_login: boolean
  created_at: string
  updated_at: string
  // Joined fields
  companies?: Company
  roles?: Role
}

export interface Attendance {
  id: string
  company_id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  work_hours: number
  status: 'present' | 'half-day' | 'absent' | 'on-leave'
  created_at: string
  // Joined
  profiles?: Profile
}

export interface Leave {
  id: string
  company_id: string
  employee_id: string
  type: 'paid' | 'sick' | 'unpaid' | 'casual'
  start_date: string
  end_date: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  created_at: string
  // Joined
  profiles?: Profile
  approver?: Profile
}

export interface LeaveBalance {
  id: string
  employee_id: string
  company_id: string
  year: number
  paid_total: number
  paid_used: number
  sick_total: number
  sick_used: number
  casual_total: number
  casual_used: number
}

export interface SalaryStructure {
  id: string
  employee_id: string
  company_id: string
  basic_salary: number
  hra_percent: number
  da_percent: number
  pf_percent: number
  professional_tax: number
  created_at: string
  updated_at: string
}

export interface Payroll {
  id: string
  company_id: string
  employee_id: string
  month: number
  year: number
  working_days: number
  days_present: number
  days_absent: number
  leaves_taken: number
  basic: number
  hra: number
  da: number
  gross_salary: number
  pf_deduction: number
  professional_tax: number
  other_deductions: number
  total_deductions: number
  net_salary: number
  status: 'draft' | 'processed' | 'paid'
  generated_at: string
  // Joined
  profiles?: Profile
}

export interface Payslip {
  id: string
  payroll_id: string
  employee_id: string
  company_id: string
  month: number
  year: number
  payslip_data: PayslipData
  generated_at: string
  // Joined
  profiles?: Profile
  payroll?: Payroll
}

export interface PayslipData {
  employee_name: string
  employee_id: string
  login_id: string
  department?: string
  month: number
  year: number
  working_days: number
  days_present: number
  days_absent: number
  leaves_taken: number
  earnings: {
    basic: number
    hra: number
    da: number
    gross: number
  }
  deductions: {
    pf: number
    professional_tax: number
    other: number
    total: number
  }
  net_salary: number
}

export interface AuditLog {
  id: string
  company_id: string
  user_id: string
  action: string
  entity: string
  entity_id: string
  timestamp: string
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
