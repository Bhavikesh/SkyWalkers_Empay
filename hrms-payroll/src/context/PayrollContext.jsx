import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/** @typedef {'draft' | 'computed' | 'validated' | 'paid'} PayrollLifecycleState */

const PayrollContext = createContext(null)

export function PayrollProvider({ children }) {
  /** Global payslip / payrun workflow */
  const [payrollState, setPayrollState] = useState(/** @type {PayrollLifecycleState} */ ('draft'))

  const compute = useCallback(() => {
    setPayrollState((s) => (s === 'draft' ? 'computed' : s))
  }, [])

  const validate = useCallback(() => {
    setPayrollState((s) => (s === 'computed' ? 'validated' : s))
  }, [])

  const cancel = useCallback(() => {
    setPayrollState((s) => {
      if (s === 'validated' || s === 'paid') return s
      return 'draft'
    })
  }, [])

  const markPaid = useCallback(() => {
    setPayrollState((s) => (s === 'validated' ? 'paid' : s))
  }, [])

  const resetWorkflow = useCallback(() => {
    setPayrollState('draft')
  }, [])

  const value = useMemo(
    () => ({
      payrollState,
      setPayrollState,
      compute,
      validate,
      cancel,
      markPaid,
      resetWorkflow,
      isLocked: payrollState === 'validated' || payrollState === 'paid',
    }),
    [payrollState, compute, validate, cancel, markPaid, resetWorkflow],
  )

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>
}

export function usePayroll() {
  const ctx = useContext(PayrollContext)
  if (!ctx) throw new Error('usePayroll must be used within PayrollProvider')
  return ctx
}
