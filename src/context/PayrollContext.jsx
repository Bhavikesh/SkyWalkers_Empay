import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useUserAttendance } from './UserAttendanceContext'

/** @typedef {{ status: 'Draft' | 'Computed' | 'Validated' | 'Paid' }} PayrollState */

const PayrollContext = createContext(null)

export function userCanManagePayrollWorkflow(user) {
  if (!user?.role) return false
  const r = String(user.role).toLowerCase()
  return r.includes('payroll') || r.includes('admin')
}

export function PayrollProvider({ children }) {
  const { user } = useUserAttendance()
  const [payrollState, setPayrollState] = useState(/** @type {PayrollState} */ ({ status: 'Draft' }))

  const canManagePayroll = userCanManagePayrollWorkflow(user)

  const compute = useCallback(() => {
    if (!canManagePayroll) return
    setPayrollState((prev) => (prev.status === 'Draft' ? { status: 'Computed' } : prev))
  }, [canManagePayroll])

  const validate = useCallback(() => {
    if (!canManagePayroll) return
    setPayrollState((prev) => (prev.status === 'Computed' ? { status: 'Validated' } : prev))
  }, [canManagePayroll])

  const markPaid = useCallback(() => {
    if (!canManagePayroll) return
    setPayrollState((prev) => (prev.status === 'Validated' ? { status: 'Paid' } : prev))
  }, [canManagePayroll])

  const status = payrollState.status
  const isLocked = status === 'Validated' || status === 'Paid'

  const value = useMemo(
    () => ({
      payrollState,
      canManagePayroll,
      compute,
      validate,
      markPaid,
      isLocked,
    }),
    [payrollState, canManagePayroll, compute, validate, markPaid, isLocked],
  )

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>
}

export function usePayroll() {
  const ctx = useContext(PayrollContext)
  if (!ctx) throw new Error('usePayroll must be used within PayrollProvider')
  return ctx
}

// Alias export for backwards compatibility
export const usePayrollContext = usePayroll
