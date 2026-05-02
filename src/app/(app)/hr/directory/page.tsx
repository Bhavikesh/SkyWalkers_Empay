import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeeDirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check permissions
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('roles(can_manage_users, can_manage_leaves)')
    .eq('id', user.id)
    .single()

  const perms = (Array.isArray(currentProfile?.roles) ? currentProfile?.roles[0] : currentProfile?.roles) as unknown as { can_manage_users: boolean; can_manage_leaves: boolean } | null
  if (!perms?.can_manage_users && !perms?.can_manage_leaves) {
    redirect('/unauthorized')
  }

  // Get all employees
  const { data: employees } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold">Employee Directory</h1>
        {perms?.can_manage_users && (
          <Link href="/admin/create-employee" className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            + Add Employee
          </Link>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Total: <strong>{employees?.length || 0}</strong> employees
      </div>

      {employees && employees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Login ID</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Department</th>
                <th className="border p-2 text-left">Role</th>
                <th className="border p-2 text-left">Phone</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const roleName = (emp.roles as { name: string } | null)?.name || '—'
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="border p-2 font-mono text-sm">{emp.login_id}</td>
                    <td className="border p-2 font-semibold">{emp.first_name} {emp.last_name}</td>
                    <td className="border p-2 text-sm">{emp.email}</td>
                    <td className="border p-2">{emp.department || '—'}</td>
                    <td className="border p-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {roleName}
                      </span>
                    </td>
                    <td className="border p-2 text-sm">{emp.phone || '—'}</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No employees found.</p>
      )}
    </div>
  )
}
