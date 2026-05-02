import { useState, useEffect } from 'react';
import { getEmployerCostData, getEmployeeCountData } from '../services/payrollService';

export function usePayrollStats() {
  const [employerCostData, setEmployerCostData] = useState([]);
  const [employeeCountData, setEmployeeCountData] = useState([]);
  const [costView, setCostView] = useState('monthly'); // monthly | annually
  const [countView, setCountView] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [costs, counts] = await Promise.all([
        getEmployerCostData(),
        getEmployeeCountData(),
      ]);
      setEmployerCostData(costs);
      setEmployeeCountData(counts);
      setLoading(false);
    };
    load();
  }, []);

  const displayCostData = costView === 'annually'
    ? employerCostData.map((d) => ({ ...d, cost: d.cost * 12 }))
    : employerCostData;

  const displayCountData = countView === 'annually'
    ? employeeCountData
    : employeeCountData;

  return {
    employerCostData: displayCostData,
    employeeCountData: displayCountData,
    costView,
    setCostView,
    countView,
    setCountView,
    loading,
  };
}

export default usePayrollStats;
