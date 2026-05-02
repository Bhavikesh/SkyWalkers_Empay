import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UserAttendanceContext = createContext(null)

const defaultUser = {
  name: 'Admin K.',
  email: 'admin.k@company.com',
  role: 'HR Admin',
  department: 'Human Resources',
  bankDetails: 'HDFC • XX42 (Savings)',
  pan: 'ABCDE1234F',
  uan: '101234567890',
  avatarUrl: null,
}

export function UserAttendanceProvider({ children }) {
  const [user, setUser] = useState(defaultUser)
  const [attendance, setAttendance] = useState({ status: 'out', checkedInAt: null })

  const checkIn = useCallback(() => {
    setAttendance({ status: 'in', checkedInAt: new Date() })
  }, [])

  const checkOut = useCallback(() => {
    setAttendance({ status: 'out', checkedInAt: null })
  }, [])

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
