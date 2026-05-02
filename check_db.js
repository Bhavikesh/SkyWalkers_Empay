const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'profiles' });
  console.log(data || error);
  
  // also let's just check the constraints on profiles
  const { data: q } = await supabase.from('profiles').select('*').limit(1);
  console.log(q);
}
check();
