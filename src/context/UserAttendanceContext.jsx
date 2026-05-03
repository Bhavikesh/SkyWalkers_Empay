import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const UserAttendanceContext = createContext(null)

const defaultUser = {
  id: 'eb11abdb-9d57-4c7d-a6c4-a2c7e22b466e', // One of our test employees
  name: 'HR Admin',
  email: 'hr.admin@company.com',
  role: 'HR Manager',
  department: 'Human Resources',
  bankDetails: 'HDFC ?" XX42 (Savings)',
  pan: 'ABCDE1234F',
  uan: '101234567890',
  avatarUrl: null,
}

export function UserAttendanceProvider({ children }) {
  const [user, setUser] = useState(defaultUser)
  const [attendance, setAttendance] = useState({ status: 'out', checkedInAt: null, recordId: null })

  // Fetch current attendance state from Supabase
  useEffect(() => {
    async function fetchMyAttendance() {
      if (!user?.id) return
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setAttendance({
          status: data.check_out ? 'out' : 'in',
          checkedInAt: data.check_in,
          recordId: data.id
        })
      }
    }
    fetchMyAttendance()
  }, [user?.id])

  const checkIn = useCallback(async () => {
    const now = new Date().toISOString()
    setAttendance(prev => ({ ...prev, status: 'in', checkedInAt: now }))
    
    const { data, error } = await supabase.from('attendance').insert([{
      employee_id: user.id,
      date: now.split('T')[0],
      check_in: now,
      status: 'Present'
    }]).select().single()

    if (data) {
      setAttendance({ status: 'in', checkedInAt: data.check_in, recordId: data.id })
    }
  }, [user.id])

  const checkOut = useCallback(async () => {
    setAttendance(prev => ({ ...prev, status: 'out' }))
    if (!attendance.recordId) return

    const now = new Date().toISOString()
    await supabase.from('attendance')
      .update({ check_out: now })
      .eq('id', attendance.recordId)
  }, [attendance.recordId])

  const updateUser = useCallback((partial) => {
    setUser((u) => ({ ...u, ...partial }))
  }, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      attendance,
      checkIn,
      checkOut,
    }),
    [user, updateUser, attendance, checkIn, checkOut],
  )

  return <UserAttendanceContext.Provider value={value}>{children}</UserAttendanceContext.Provider>
}

export function useUserAttendance() {
  const ctx = useContext(UserAttendanceContext)
  if (!ctx) throw new Error('useUserAttendance must be used within UserAttendanceProvider')
  return ctx
}