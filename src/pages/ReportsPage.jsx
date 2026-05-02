import { usePayrollContext } from '../context/PayrollContext';
import SalaryReport from '../components/Reports/SalaryReport';

export default function ReportsPage() {
  const { payruns, employees } = usePayrollContext();

  return <SalaryReport payruns={payruns} employees={employees} />;
}
