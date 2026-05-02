import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useUserAttendance } from './UserAttendanceContext'
import { supabase } from '../lib/supabase'

const EmployeeContext = createContext(null)

// Ensure every property the UI expects exists
function normalizeEmployee(dbEmp) {
  const sal = dbEmp.salary || {}
  return {
    ...dbEmp,
    id: dbEmp.id || 'EMP-UNKNOWN',
    name: dbEmp.name || 'Unknown Employee',
    email: dbEmp.email || '',
    role: dbEmp.role || 'Employee',
    department: dbEmp.department || '',
    skills: dbEmp.skills || [],
    certifications: dbEmp.certifications || [],
    bank: dbEmp.bank || {
      accountNumber: '',
      bankName: '',
      ifsc: '',
      pan: '',
      uan: ''
    },
    salary: {
      monthlyWage: sal.monthlyWage || 0,
      yearlyWage: sal.yearlyWage || 0,
      workingDaysPerWeek: sal.workingDaysPerWeek || 5,
      basicPercent: sal.basicPercent || 50,
      hraPercentOfBasic: sal.hraPercentOfBasic || 40,
      standardAllowance: sal.standardAllowance || 0,
      performanceBonus: sal.performanceBonus || 0,
      lta: sal.lta || 0,
      fixedAllowance: sal.fixedAllowance || 0,
      components: sal.components || {
        basic: 0,
        hra: 0,
        standardAllowance: 0,
        performanceBonus: 0,
        lta: 0,
        fixedAllowance: 0,
        total: 0
      },
      deductions: sal.deductions || {
        pfEmployee: 0,
        pfEmployer: 0,
        professionalTax: 0
      }
    }
  }
}

export function EmployeeProvider({ children }) {
  const { user } = useUserAttendance()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: dbError } = await supabase.from('employees').select('*')
      
      if (dbError) throw dbError
      
      const normalizedData = (data || []).map(normalizeEmployee)
      
      setEmployees(normalizedData)
      
      if (normalizedData.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(normalizedData[0].id)
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const currentUserEmployee = employees.find((e) => e.email?.toLowerCase() === String(user?.email).toLowerCase()) ?? employees[0]
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) ?? employees[0]
  const selectEmployee = useCallback((id) => setSelectedEmployeeId(id), [])
  const updateEmployee = useCallback(async (id, updater) => {}, [])

  const value = {
    employees,
    selectedEmployee,
    selectedEmployeeId,
    selectEmployee,
    updateEmployee,
    currentUserEmployee,
    currentUser: user,
    role: user?.role,
    loading,
    error
  }

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#0f172a] text-gray-400">Loading employees...</div>
  }
  
  if (error) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#0f172a] text-red-500">Error: {error}</div>
  }

  if (employees.length === 0) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#0f172a] text-amber-500">No employees found</div>
  }

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext)
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider')
  return ctx
}