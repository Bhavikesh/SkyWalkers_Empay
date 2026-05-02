const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'mahajanram1506@gmail.com';

async function deleteUser() {
  console.log(`Starting deletion process for ${TARGET_EMAIL}...`);
  
  // Find auth user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError);
    return;
  }
  
  const user = users.find(u => u.email === TARGET_EMAIL);
  
  if (!user) {
    console.error(`User with email ${TARGET_EMAIL} not found in Auth system.`);
    return;
  }
  
  console.log(`Found user in Auth: ${user.id}. Finding profile...`);
  
  // Find profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', TARGET_EMAIL)
    .single();
    
  if (profile) {
    const userId = profile.id;
    console.log(`Deleting records for profile ID: ${userId}...`);
    
    // Explicitly delete related records
    await supabase.from('attendance').delete().eq('employee_id', userId);
    await supabase.from('leaves').delete().eq('employee_id', userId);
    await supabase.from('leave_balances').delete().eq('employee_id', userId);
    await supabase.from('payroll').delete().eq('employee_id', userId);
    await supabase.from('payslips').delete().eq('employee_id', userId);
    await supabase.from('salary_structures').delete().eq('employee_id', userId);
    await supabase.from('audit_logs').delete().eq('user_id', userId);
    
    // Check if there is an employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();
      
    if (employee) {
      console.log(`Deleting records for employee ID: ${employee.id}...`);
      await supabase.from('bank_details').delete().eq('employee_id', employee.id);
      await supabase.from('employees').delete().eq('id', employee.id);
    }
    
    console.log('Deleting profile...');
    await supabase.from('profiles').delete().eq('id', userId);
  }
  
  console.log('Deleting from Auth...');
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('Failed to delete auth user:', deleteError);
  } else {
    console.log(`Successfully completely deleted user ${TARGET_EMAIL}`);
  }
}

deleteUser();
