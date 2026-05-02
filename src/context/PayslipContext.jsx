import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { computePayslipAmounts, getInitialPayslipPayload } from '../services/mockPayroll'

/** @typedef {'Draft' | 'Computed' | 'Validated'} PayslipStatus */

const PayslipContext = createContext(null)

export function PayslipProvider({ children }) {
  const [payslipState, setPayslipState] = useState(() => ({
    status: /** @type {PayslipStatus} */ ('Draft'),
    refreshKey: 0,
    ...getInitialPayslipPayload(),
  }))

  const resetToDraft = useCallback((payload) => {
    setPayslipState({
      status: 'Draft',
      ...payload,
    })
  }, [])

  const newPayslip = useCallback(() => {
    setPayslipState((prev) => ({
      status: 'Draft',
      ...getInitialPayslipPayload(),
      refreshKey: (prev.refreshKey ?? 0) + 1,
    }))
  }, [])

  const compute = useCallback(() => {
    setPayslipState((prev) => {
      if (prev.status !== 'Draft') return prev
      const computed = computePayslipAmounts(prev)
      return {
        ...prev,
        status: 'Computed',
        ...computed,
      }
    })
  }, [])

  const validate = useCallback(() => {
    setPayslipState((prev) => {
      if (prev.status !== 'Computed') return prev
      return { ...prev, status: 'Validated' }
    })
  }, [])

  const cancel = useCallback(() => {
    resetToDraft(getInitialPayslipPayload())
  }, [resetToDraft])

  const value = useMemo(
    () => ({
      payslipState,
      newPayslip,
      compute,
      validate,
      cancel,
    }),
    [payslipState, newPayslip, compute, validate, cancel],
  )

  return <PayslipContext.Provider value={value}>{children}</PayslipContext.Provider>
}

export function usePayslip() {
  const ctx = useContext(PayslipContext)
  if (!ctx) throw new Error('usePayslip must be used within PayslipProvider')
  return ctx
}
