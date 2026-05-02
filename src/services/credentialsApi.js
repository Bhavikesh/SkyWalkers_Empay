export async function generateAndSendCredentials({ supabaseUrl, employeeId, email, employeeName, joiningDate, role }) {
  if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL')

  const res = await fetch(`${supabaseUrl}/functions/v1/generate-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hrms-role': role ?? '',
    },
    body: JSON.stringify({ employeeId, email, employeeName, joiningDate }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error || 'Failed to send email'
    throw new Error(msg)
  }
  return data
}

