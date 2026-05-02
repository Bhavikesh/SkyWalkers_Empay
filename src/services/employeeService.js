import { supabase } from '../lib/supabase';

export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      profiles:profile_id (
        first_name,
        last_name,
        email,
        phone
      )
    `);

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  // Map to the format expected by the frontend
  return data.map((e) => ({
    id: e.id,
    name: e.profiles ? `${e.profiles.first_name} ${e.profiles.last_name}` : e.code,
    code: e.code,
    department: e.department,
    designation: e.designation,
    email: e.profiles?.email,
    phone: e.profiles?.phone,
    joinDate: e.created_at,
    hasBank: false, // Could be determined by joining bank_details
    hasManager: true, // Mock value, update later
    status: e.status,
  }));
};

export const getEmployeeById = async (id) => {
  const { data, error } = await supabase
    .from('employees')
    .select(`*, profiles:profile_id (first_name, last_name, email, phone)`)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.profiles ? `${data.profiles.first_name} ${data.profiles.last_name}` : data.code,
    code: data.code,
    department: data.department,
    designation: data.designation,
    email: data.profiles?.email,
    phone: data.profiles?.phone,
    joinDate: data.created_at,
    status: data.status,
  };
};

export const getEmployeesWithoutBank = async () => {
  // Query employees that do not have a corresponding bank_details row
  const { data, error } = await supabase
    .from('employees')
    .select(`id, code, profiles:profile_id (first_name, last_name)`);
  // For simplicity, returning empty array right now until bank_details UI is built
  return [];
};

export const getEmployeesWithoutManager = async () => {
  return [];
};

export const getEmployeeCount = async () => {
  const { count, error } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true });
    
  if (error) return 0;
  return count;
};

export default {
  getEmployees,
  getEmployeeById,
  getEmployeesWithoutBank,
  getEmployeesWithoutManager,
  getEmployeeCount,
};
