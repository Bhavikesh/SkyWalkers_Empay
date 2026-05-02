import { useState, useMemo } from 'react';
import { Printer, Filter, FileSpreadsheet, BarChart3 } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

export default function SalaryReport({ payruns, employees }) {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2025');

  const years = ['2025', '2024'];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const reportData = useMemo(() => {
    const data = {};

    // Initialize months
    months.forEach((month) => {
      data[month] = { gross: 0, deductions: 0, net: 0, employerCost: 0, count: 0 };
    });

    payruns.forEach((payrun) => {
      if (payrun.year !== selectedYear) return;

      payrun.payslips.forEach((payslip) => {
        if (selectedEmployee !== 'all' && payslip.employeeId !== parseInt(selectedEmployee)) return;

        const month = payslip.month;
        if (data[month]) {
          data[month].gross += payslip.grossSalary;
          data[month].deductions += payslip.totalDeductions;
          data[month].net += payslip.netSalary;
          data[month].employerCost += payslip.employerCost;
          data[month].count += 1;
        }
      });
    });

    return data;
  }, [payruns, selectedEmployee, selectedYear]);

  const yearlyTotal = useMemo(() => {
    return Object.values(reportData).reduce(
      (acc, m) => ({
        gross: acc.gross + m.gross,
        deductions: acc.deductions + m.deductions,
        net: acc.net + m.net,
        employerCost: acc.employerCost + m.employerCost,
      }),
      { gross: 0, deductions: 0, net: 0, employerCost: 0 }
    );
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon={BarChart3}
        title="Salary Statement Report"
        subtitle="Monthly & yearly salary breakdown"
        action={
          <Button onClick={handlePrint} id="print-report-btn">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              id="report-employee-filter"
              className="bg-input-bg border border-input-border text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              id="report-year-filter"
              className="bg-input-bg border border-input-border text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-purple-500/5 border-b border-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          <h3 className="text-lg font-medium text-white">
            Salary Statement — {selectedYear}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" id="salary-report-table">
            <thead>
              <tr className="bg-table-header border-b border-gray-800">
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Month</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Gross Salary</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Deductions</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Net Salary</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Employer Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {months.map((month) => {
                const data = reportData[month];
                const hasData = data.count > 0;
                return (
                  <tr
                    key={month}
                    className={`transition-colors ${hasData ? 'hover:bg-table-row-hover' : 'opacity-30'}`}
                  >
                    <td className="px-4 py-2">
                      <span className="text-base text-white">{month}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-base text-gray-300">
                        {hasData ? formatCurrency(data.gross) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-base text-red-400">
                        {hasData ? formatCurrency(data.deductions) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-base font-medium text-green-400">
                        {hasData ? formatCurrency(data.net) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-base text-purple-400">
                        {hasData ? formatCurrency(data.employerCost) : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-dark-600/30 border-t-2 border-purple-500/30">
                <td className="px-4 py-2 text-base font-semibold text-white">Yearly Total</td>
                <td className="px-4 py-2 text-base font-semibold text-white">
                  {formatCurrency(yearlyTotal.gross)}
                </td>
                <td className="px-4 py-2 text-base font-semibold text-red-400">
                  {formatCurrency(yearlyTotal.deductions)}
                </td>
                <td className="px-4 py-2 text-base font-semibold text-green-400">
                  {formatCurrency(yearlyTotal.net)}
                </td>
                <td className="px-4 py-2 text-base font-semibold text-purple-400">
                  {formatCurrency(yearlyTotal.employerCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
