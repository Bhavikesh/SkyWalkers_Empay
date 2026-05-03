'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Role = 'Admin' | 'HR' | 'Payroll' | 'Employee'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Employee {
  id: string
  name: string
  role: string
  salary: number
  department: string
  email: string
  phone: string
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  work_hours: number
  extra_hours: number
}

export interface LeaveRequest {
  id: string
  employee_id: string
  type: string
  start_date: string
  end_date: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface PayrollRecord {
  id: string
  employee_id: string
  month: string
  basic: number
  allowances: number
  deductions: number
  net: number
  status: 'Draft' | 'Computed' | 'Paid'
}

interface HRMSContextType {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void
  
  employees: Employee[]
  addEmployee: (emp: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, emp: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  
  attendance: AttendanceRecord[]
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'work_hours' | 'extra_hours'>) => void
  
  leaves: LeaveRequest[]
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status'>) => void
  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => void
  
  payroll: PayrollRecord[]
  computePayroll: (month: string) => void
  updatePayrollStatus: (id: string, status: PayrollRecord['status']) => void
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined)

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Admin User', role: 'Admin', salary: 100000, department: 'Management', email: 'admin@empay.com', phone: '1234567890' },
  { id: '2', name: 'HR Manager', role: 'HR', salary: 80000, department: 'Human Resources', email: 'hr@empay.com', phone: '0987654321' },
  { id: '3', name: 'Payroll Officer', role: 'Payroll', salary: 75000, department: 'Finance', email: 'payroll@empay.com', phone: '1122334455' },
  { id: '4', name: 'John Doe', role: 'Employee', salary: 50000, department: 'Engineering', email: 'john@empay.com', phone: '5566778899' },
]

export function HRMSProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('empay_user')
      if (storedUser) setCurrentUser(JSON.parse(storedUser))

      const storedEmp = localStorage.getItem('empay_employees')
      if (storedEmp) setEmployees(JSON.parse(storedEmp))
      else setEmployees(DEFAULT_EMPLOYEES)

      const storedAtt = localStorage.getItem('empay_attendance')
      if (storedAtt) setAttendance(JSON.parse(storedAtt))

      const storedLeaves = localStorage.getItem('empay_leaves')
      if (storedLeaves) setLeaves(JSON.parse(storedLeaves))

      const storedPayroll = localStorage.getItem('empay_payroll')
      if (storedPayroll) setPayroll(JSON.parse(storedPayroll))
    } catch (e) {
      console.error('Error loading state from localStorage', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('empay_user', JSON.stringify(currentUser))
    localStorage.setItem('empay_employees', JSON.stringify(employees))
    localStorage.setItem('empay_attendance', JSON.stringify(attendance))
    localStorage.setItem('empay_leaves', JSON.stringify(leaves))
    localStorage.setItem('empay_payroll', JSON.stringify(payroll))
  }, [currentUser, employees, attendance, leaves, payroll, isLoaded])

  const login = (user: User) => setCurrentUser(user)
  const logout = () => setCurrentUser(null)

  // Employee Methods
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp = { ...emp, id: Date.now().toString() }
    setEmployees(prev => [...prev, newEmp])
  }
  
  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  // Attendance Methods
  const markAttendance = (record: Omit<AttendanceRecord, 'id' | 'work_hours' | 'extra_hours'>) => {
    let work_hours = 0
    let extra_hours = 0

    if (record.check_in && record.check_out) {
      const inTime = new Date(`1970/01/01 ${record.check_in}`).getTime()
      const outTime = new Date(`1970/01/01 ${record.check_out}`).getTime()
      work_hours = (outTime - inTime) / (1000 * 60 * 60)
      if (work_hours < 0) work_hours += 24 // Handle overnight
      extra_hours = Math.max(0, work_hours - 8)
    }

    setAttendance(prev => {
      // Update existing record for the day or add new
      const existingIdx = prev.findIndex(a => a.employee_id === record.employee_id && a.date === record.date)
      if (existingIdx >= 0) {
        const newArr = [...prev]
        newArr[existingIdx] = { ...newArr[existingIdx], ...record, work_hours, extra_hours }
        return newArr
      }
      return [...prev, { ...record, id: Date.now().toString(), work_hours, extra_hours }]
    })
  }

  // Leave Methods
  const applyLeave = (leave: Omit<LeaveRequest, 'id' | 'status'>) => {
    setLeaves(prev => [...prev, { ...leave, id: Date.now().toString(), status: 'Pending' }])
  }

  const updateLeaveStatus = (id: string, status: LeaveRequest['status']) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  // Payroll Methods
  const computePayroll = (month: string) => {
    const newPayrollRecords: PayrollRecord[] = employees.map(emp => {
      // 1. Calculate attendance for the month
      const empAttendance = attendance.filter(a => a.employee_id === emp.id && a.date.startsWith(month))
      const daysPresent = empAttendance.length
      
      // Basic salary is proportionate to days present (assuming 20 working days/month)
      const proportionateBasic = (emp.salary / 20) * Math.min(daysPresent, 20)
      const allowances = proportionateBasic * 0.15
      const deductions = proportionateBasic * 0.10
      const net = proportionateBasic + allowances - deductions

      return {
        id: `${emp.id}-${month}`,
        employee_id: emp.id,
        month,
        basic: proportionateBasic || 0,
        allowances: allowances || 0,
        deductions: deductions || 0,
        net: net || 0,
        status: 'Computed'
      }
    })

    setPayroll(prev => {
      // Remove old records for this month, insert new ones
      const filtered = prev.filter(p => p.month !== month)
      return [...filtered, ...newPayrollRecords]
    })
  }

  const updatePayrollStatus = (id: string, status: PayrollRecord['status']) => {
    setPayroll(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  if (!isLoaded) return null // Prevent hydration mismatch

  return (
    <HRMSContext.Provider value={{
      currentUser, login, logout,
      employees, addEmployee, updateEmployee, deleteEmployee,
      attendance, markAttendance,
      leaves, applyLeave, updateLeaveStatus,
      payroll, computePayroll, updatePayrollStatus
    }}>
      {children}
    </HRMSContext.Provider>
  )
}

export const useHRMS = () => {
  const ctx = useContext(HRMSContext)
  if (!ctx) throw new Error('useHRMS must be used within HRMSProvider')
  return ctx
}
