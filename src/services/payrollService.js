import { supabase } from '../lib/supabase';
import { getEmployees } from './employeeService';

export const PAYSLIP_STATES = {
  DRAFT: 'draft',
  COMPUTED: 'computed',
  VALIDATED: 'validated',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

// Map DB payruns to frontend expected format
export const getInitialPayruns = async () => {
  const { data: payruns, error } = await supabase
    .from('payruns')
    .select(`
      id,
      month,
      year,
      status,
      total_amount,
      created_at,
      payslips (
        id,
        employee_id,
        basic_pay,
        hra,
        allowances,
        deductions,
        net_pay,
        status,
        employees (
          code,
          department,
          designation,
          profiles:profile_id (
            first_name,
            last_name
          )
        )
      )
    `)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching payruns:', error);
    return [];
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return payruns.map(pr => {
    return {
      id: pr.id,
      period: `${pr.year}-${String(pr.month).padStart(2, '0')}`,
      month: monthNames[pr.month - 1],
      year: String(pr.year),
      name: `Payrun for ${monthNames[pr.month - 1]} ${pr.year}`,
      payslipCount: pr.payslips ? pr.payslips.length : 0,
      payslips: (pr.payslips || []).map(ps => ({
        id: ps.id,
        employeeId: ps.employee_id,
        employeeName: ps.employees?.profiles ? `${ps.employees.profiles.first_name} ${ps.employees.profiles.last_name}` : ps.employees?.code,
        employeeCode: ps.employees?.code,
        department: ps.employees?.department,
        designation: ps.employees?.designation,
        basicWage: ps.basic_pay,
        earnings: ps.basic_pay + ps.hra + ps.allowances,
        deductions: ps.deductions,
        grossSalary: ps.basic_pay + ps.hra + ps.allowances,
        netSalary: ps.net_pay,
        totalDeductions: ps.deductions,
        employerCost: ps.basic_pay + ps.hra + ps.allowances, // Simple mock
        status: ps.status,
      })),
      totalEmployerCost: (pr.payslips || []).reduce((sum, p) => sum + (p.basic_pay + p.hra + p.allowances), 0),
      totalNetSalary: (pr.payslips || []).reduce((sum, p) => sum + p.net_pay, 0),
      status: pr.status,
      createdAt: pr.created_at,
    };
  });
};

export const runPayroll = async (period, month, year) => {
  // Call the generate_payroll RPC function we created in DB
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNum = monthNames.indexOf(month) + 1;
  const yearNum = parseInt(year, 10);

  // Note: generate_payroll requires p_company_id, p_month, p_year
  // Since we don't have the auth context here directly, we'll get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  // We need the company_id. Assuming we fetch it or it's tied to the user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', session.user.id)
    .single();

  if (!profile?.company_id) {
    throw new Error('User has no company assigned');
  }

  const { data: newPayrunId, error } = await supabase.rpc('generate_payroll', {
    p_company_id: profile.company_id,
    p_month: monthNum,
    p_year: yearNum
  });

  if (error) {
    throw error;
  }

  // Return the newly created payruns by re-fetching
  const payruns = await getInitialPayruns();
  return payruns.find(p => p.id === newPayrunId) || payruns[0];
};

export const computePayslip = async (payslip) => {
  const { data, error } = await supabase
    .from('payslips')
    .update({ status: PAYSLIP_STATES.COMPUTED })
    .eq('id', payslip.id)
    .select()
    .single();
  return data ? { ...payslip, status: data.status } : payslip;
};

export const validatePayslip = async (payslip) => {
  const { data, error } = await supabase
    .from('payslips')
    .update({ status: PAYSLIP_STATES.VALIDATED })
    .eq('id', payslip.id)
    .select()
    .single();
  return data ? { ...payslip, status: data.status } : payslip;
};

export const markAsPaid = async (payslip) => {
  const { data, error } = await supabase
    .from('payslips')
    .update({ status: PAYSLIP_STATES.PAID })
    .eq('id', payslip.id)
    .select()
    .single();
  return data ? { ...payslip, status: data.status } : payslip;
};

export const cancelPayslip = async (payslip) => {
  const { data, error } = await supabase
    .from('payslips')
    .update({ status: PAYSLIP_STATES.CANCELLED })
    .eq('id', payslip.id)
    .select()
    .single();
  return data ? { ...payslip, status: data.status } : payslip;
};

export const getEmployerCostData = () => {
  return Promise.resolve([
    { month: 'May', cost: 0 },
    { month: 'Jun', cost: 0 },
    { month: 'Jul', cost: 0 },
    { month: 'Aug', cost: 0 },
    { month: 'Sep', cost: 0 },
    { month: 'Oct', cost: 0 },
  ]);
};

export const getEmployeeCountData = () => {
  return Promise.resolve([
    { month: 'May', count: 0 },
    { month: 'Jun', count: 0 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 0 },
    { month: 'Sep', count: 0 },
    { month: 'Oct', count: 0 },
  ]);
};

export default {
  getInitialPayruns,
  runPayroll,
  computePayslip,
  validatePayslip,
  markAsPaid,
  cancelPayslip,
  getEmployerCostData,
  getEmployeeCountData,
  PAYSLIP_STATES,
};
