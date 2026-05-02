import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  getInitialPayruns,
  runPayroll,
  computePayslip,
  validatePayslip,
  markAsPaid,
  cancelPayslip,
  PAYSLIP_STATES,
} from '../services/payrollService';
import { getEmployees, getEmployeesWithoutBank, getEmployeesWithoutManager } from '../services/employeeService';

const PayrollContext = createContext(null);

const initialState = {
  payruns: [],
  employees: [],
  warnings: {
    noBank: [],
    noManager: [],
  },
  selectedPayrun: null,
  selectedPayslip: null,
  loading: true,
  error: null,
};

function payrollReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'INIT_DATA':
      return {
        ...state,
        payruns: action.payload.payruns,
        employees: action.payload.employees,
        warnings: action.payload.warnings,
        loading: false,
      };
    case 'ADD_PAYRUN':
      return {
        ...state,
        payruns: [action.payload, ...state.payruns],
      };
    case 'SELECT_PAYRUN':
      return { ...state, selectedPayrun: action.payload };
    case 'SELECT_PAYSLIP':
      return { ...state, selectedPayslip: action.payload };
    case 'UPDATE_PAYSLIP': {
      const updatedPayslip = action.payload;
      const updatedPayruns = state.payruns.map((pr) => ({
        ...pr,
        payslips: (pr.payslips || []).map((ps) =>
          ps.id === updatedPayslip.id ? updatedPayslip : ps
        ),
      }));
      return {
        ...state,
        payruns: updatedPayruns,
        selectedPayslip:
          state.selectedPayslip?.id === updatedPayslip.id
            ? updatedPayslip
            : state.selectedPayslip,
      };
    }
    case 'UPDATE_PAYRUN': {
      const updatedPayrun = action.payload;
      const updatedPayruns = state.payruns.map((pr) =>
        pr.id === updatedPayrun.id ? updatedPayrun : pr
      );
      return {
        ...state,
        payruns: updatedPayruns,
        selectedPayrun:
          state.selectedPayrun?.id === updatedPayrun.id
            ? updatedPayrun
            : state.selectedPayrun,
      };
    }
    default:
      return state;
  }
}

export function PayrollProvider({ children }) {
  const [state, dispatch] = useReducer(payrollReducer, initialState);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [payruns, employees, noBank, noManager] = await Promise.all([
        getInitialPayruns(),
        getEmployees(),
        getEmployeesWithoutBank(),
        getEmployeesWithoutManager(),
      ]);
      dispatch({
        type: 'INIT_DATA',
        payload: {
          payruns,
          employees,
          warnings: { noBank, noManager },
        },
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createPayrun = useCallback(async (period, month, year) => {
    try {
      const payrun = await runPayroll(period, month, year);
      dispatch({ type: 'ADD_PAYRUN', payload: payrun });
      return payrun;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const selectPayrun = useCallback((payrun) => {
    dispatch({ type: 'SELECT_PAYRUN', payload: payrun });
  }, []);

  const selectPayslip = useCallback((payslip) => {
    dispatch({ type: 'SELECT_PAYSLIP', payload: payslip });
  }, []);

  const doComputePayslip = useCallback(async (payslip) => {
    const updated = await computePayslip(payslip);
    dispatch({ type: 'UPDATE_PAYSLIP', payload: updated });
    return updated;
  }, []);

  const doValidatePayslip = useCallback(async (payslip) => {
    const updated = await validatePayslip(payslip);
    dispatch({ type: 'UPDATE_PAYSLIP', payload: updated });
    return updated;
  }, []);

  const doMarkAsPaid = useCallback(async (payslip) => {
    const updated = await markAsPaid(payslip);
    dispatch({ type: 'UPDATE_PAYSLIP', payload: updated });
    return updated;
  }, []);

  const doCancelPayslip = useCallback(async (payslip) => {
    const updated = await cancelPayslip(payslip);
    dispatch({ type: 'UPDATE_PAYSLIP', payload: updated });
    return updated;
  }, []);

  const computeAllInPayrun = useCallback(async (payrunId) => {
    const payrun = state.payruns.find((pr) => pr.id === payrunId);
    if (!payrun) return;
    
    // Simplification for the DB update
    const updatedPayslips = await Promise.all(
      (payrun.payslips || []).map(async (ps) => {
        if (ps.status === PAYSLIP_STATES.DRAFT) {
          return await computePayslip(ps);
        }
        return ps;
      })
    );

    dispatch({
      type: 'UPDATE_PAYRUN',
      payload: { ...payrun, status: PAYSLIP_STATES.COMPUTED, payslips: updatedPayslips },
    });
  }, [state.payruns]);

  const validateAllInPayrun = useCallback(async (payrunId) => {
    const payrun = state.payruns.find((pr) => pr.id === payrunId);
    if (!payrun) return;

    const updatedPayslips = await Promise.all(
      (payrun.payslips || []).map(async (ps) => {
        if (ps.status === PAYSLIP_STATES.COMPUTED) {
          return await validatePayslip(ps);
        }
        return ps;
      })
    );

    dispatch({
      type: 'UPDATE_PAYRUN',
      payload: { ...payrun, status: PAYSLIP_STATES.VALIDATED, payslips: updatedPayslips },
    });
  }, [state.payruns]);

  const value = {
    ...state,
    createPayrun,
    selectPayrun,
    selectPayslip,
    computePayslip: doComputePayslip,
    validatePayslip: doValidatePayslip,
    markAsPaid: doMarkAsPaid,
    cancelPayslip: doCancelPayslip,
    computeAllInPayrun,
    validateAllInPayrun,
    refreshData: loadData
  };

  return (
    <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>
  );
}

export function usePayrollContext() {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayrollContext must be used within a PayrollProvider');
  }
  return context;
}

export default PayrollContext;
