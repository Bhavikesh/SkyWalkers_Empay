import { useEffect, useState } from 'react'
import { AttendanceTable } from '../components/AttendanceTable'
import { supabase } from '../lib/supabase'
import { useUserAttendance } from '../context/UserAttendanceContext'

export default function Attendance() {
  const { user } = useUserAttendance()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // ROLE-BASED ACCESS
  const isPayrollOfficer = user?.role?.toLowerCase().includes('admin') || user?.role?.toLowerCase().includes('payroll')

  const fetchAttendance = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)
      
      // Admin sees everyone, Employee sees only their own
      let query = supabase.from('attendance').select('*').order('employee_name', { ascending: true })
      if (!isPayrollOfficer) {
        query = query.eq('employee_id', user.id)
      }
      
      const { data: dbData, error: dbError } = await query
      
      if (dbError) throw dbError
      
      const mappedData = (dbData || []).map(row => ({
        ...row,
        name: row.employee_name || 'Unknown',
        checkIn: row.check_in || '--:--',
        checkOut: row.check_out || '--:--',
        status: row.status || 'Unknown'
      }))

      setData(mappedData)
    } catch (err) {
      console.error('Error fetching attendance:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance(true)
    
    // REAL-TIME UPDATES (Bonus)
    const sub = supabase.channel('public:attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        fetchAttendance(false) // Silent refresh
      })
      .subscribe()
      
    return () => supabase.removeChannel(sub)
  }, [user.id, isPayrollOfficer])

  const handleUpdateRecord = async (id, field, value) => {
    if (!isPayrollOfficer) return;
    try {
      // 1. Instantly update UI state for zero latency
      setData((prevData) => 
        prevData.map((item) => 
          item.id === id ? { ...item, [field === 'status' ? 'status' : field]: value } : item
        )
      );

      // 2. Perform background database update
      const { error } = await supabase.from('attendance').update({ [field]: value }).eq('id', id)
      if (error) throw error
      
      // No need to manually call fetchAttendance() here because the postgres_changes realtime 
      // subscription will automatically detect this update and silently refresh the data!
    } catch (e) {
      console.error("Update failed:", e.message)
      // On failure, revert back by fetching true data silently
      fetchAttendance(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading attendance...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  const filteredData = data.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-0 flex-col gap-6 pb-6 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Attendance</h1>
        {isPayrollOfficer && (
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-[#0f172a] px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No attendance data found</p>
      ) : filteredData.length === 0 ? (
        <p className="text-sm text-gray-400">No employees match your search.</p>
      ) : (
        <AttendanceTable rows={filteredData} canEdit={isPayrollOfficer} onUpdate={handleUpdateRecord} />
      )}
    </div>
  )
}