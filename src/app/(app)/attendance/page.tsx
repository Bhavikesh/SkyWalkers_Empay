'use client'

import { useHRMS } from '@/context/HRMSContext'
import AttendanceClient from './AttendanceClient'

export default function AdminAttendancePage() {
  const { employees, currentUser } = useHRMS()

  if (!currentUser) return null

  const roleName = currentUser.role
  const canManage = roleName === 'Admin' || roleName === 'HR'

  const mappedEmployees = employees.map(emp => ({
    id: emp.id,
    first_name: emp.name.split(' ')[0],
    last_name: emp.name.split(' ').slice(1).join(' '),
    login_id: `EMP-${emp.id}`,
    department: emp.department
  }))

  return (
    <div className="w-full h-full flex flex-col">
      <AttendanceClient 
        employees={mappedEmployees} 
        canManage={canManage} 
        companyId="local"
      />
    </div>
  )
}
