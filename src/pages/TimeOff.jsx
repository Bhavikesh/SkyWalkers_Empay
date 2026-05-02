import { useEffect, useState } from 'react'
import { LeaveModal } from '../components/LeaveModal'
import { supabase } from '../lib/supabase'

export default function TimeOff() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTimeOff = async () => {
    try {
      setLoading(true)
      const { data: dbData, error: dbError } = await supabase.from('time_off_requests').select('*')
      if (dbError) throw dbError
      setData(dbData || [])
    } catch (err) {
      console.error('Error fetching time off:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeOff()
  }, [])

  const handleLeaveSubmit = async (payload) => {
    try {
      // Map frontend payload to backend schema if needed (e.g. employee_id mapping)
      // Assuming payload has: { leaveType, startDate, endDate, notes, employeeId }
      
      const dbPayload = {
        employee_id: payload.employeeId || null, 
        leave_type: payload.leaveType || payload.type,
        start_date: payload.startDate,
        end_date: payload.endDate,
        notes: payload.notes,
        status: 'Pending'
      }

      const { error } = await supabase.from('time_off_requests').insert([dbPayload])

      if (error) throw error

      console.log("Leave request submitted")
      setIsModalOpen(false)
      fetchTimeOff() // Refresh UI to show the new request
    } catch (e) {
      console.error("Leave request failed:", e)
      alert("Failed to submit leave request: " + e.message)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading time off requests...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="flex min-h-0 flex-col gap-6 pb-6 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Time Off</h1>
        <button onClick={() => setIsModalOpen(true)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
          Request Time Off
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No time off requests found</p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map(req => (
            <div key={req.id} className="rounded-xl border border-gray-800 bg-[#0f172a] p-4 text-white">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{req.leave_type || req.type}</p>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded-md text-amber-400">{req.status || 'Pending'}</span>
              </div>
              <p className="text-sm text-gray-400">From: {req.start_date}</p>
              <p className="text-sm text-gray-400">To: {req.end_date}</p>
            </div>
          ))}
        </div>
      )}

      <LeaveModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleLeaveSubmit} />
    </div>
  )
}