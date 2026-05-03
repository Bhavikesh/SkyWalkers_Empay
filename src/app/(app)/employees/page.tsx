'use client'

import { useHRMS } from '@/context/HRMSContext'
import EmployeeListClient from './EmployeeListClient'

export default function EmployeesPage() {
  const { employees, attendance, leaves, currentUser } = useHRMS()

  if (!currentUser) return null

  const today = new Date().toISOString().split('T')[0]
  
  const todayAttendance = attendance.filter(a => a.date === today)
  const presentNames = new Set(
    todayAttendance.map(a => {
      const emp = employees.find(e => e.id === a.employee_id)
      return emp ? emp.name : ''
    }).filter(Boolean)
  )

  const onLeaveNames = new Set(
    leaves.filter(l => l.start_date <= today && l.end_date >= today && l.status === 'Approved')
      .map(l => {
        const emp = employees.find(e => e.id === l.employee_id)
        return emp ? emp.name : ''
      }).filter(Boolean)
  )

  const myAttendance = todayAttendance.find(a => a.employee_id === currentUser.id) || null

  const isHrOrAdmin = currentUser.role === 'Admin' || currentUser.role === 'HR'

  const stats = {
    total: employees.length,
    present: presentNames.size,
    onLeave: onLeaveNames.size,
    highRisk: 0,
  }

  // Map local Employee type to what EmployeeListClient expects
  const mappedEmployees = employees.map(emp => ({
    id: emp.id,
    first_name: emp.name.split(' ')[0],
    last_name: emp.name.split(' ').slice(1).join(' '),
    email: emp.email,
    phone: emp.phone,
    department: emp.department,
    login_id: `EMP-${emp.id}`,
    is_active: true,
    created_at: new Date().toISOString(),
    roles: { name: emp.role }
  }))

  return (
    <EmployeeListClient
      employees={mappedEmployees}
      stats={stats}
      currentUserId={currentUser.id}
      canManageUsers={isHrOrAdmin}
      isHrOrAdmin={isHrOrAdmin}
      presentNames={Array.from(presentNames)}
      onLeaveNames={Array.from(onLeaveNames)}
      myAttendance={myAttendance}
    />
  )
}
