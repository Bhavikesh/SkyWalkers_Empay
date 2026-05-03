const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: attendance } = await supabase.from('attendance').select('*').limit(1);
  console.log('attendance sample:', attendance);
  
  const { data: employees } = await supabase.from('employees').select('*').limit(1);
  console.log('employees sample:', employees);

  const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles sample:', profiles);
}

check();
