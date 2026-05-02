import { CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import SectionHeader from '../components/common/SectionHeader';
import { usePayrollContext } from '../context/PayrollContext';

export default function AttendancePage() {
  const { employees } = usePayrollContext();

  const mockAttendance = [
    { empId: 1, name: 'Ravi Kumar', present: 22, absent: 0, leave: 2, late: 1 },
    { empId: 2, name: 'Priya Sharma', present: 20, absent: 1, leave: 3, late: 0 },
    { empId: 3, name: 'Arjun Patel', present: 21, absent: 2, leave: 1, late: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon={CalendarCheck}
        title="Attendance"
        subtitle="October 2025 attendance overview"
        color="green"
      />

      {/* Stats — equal-height 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} value="93%" label="Avg. Attendance Rate" color="green" />
        <StatCard icon={Clock} value="6" label="Total Leave Days" color="blue" />
        <StatCard icon={CalendarCheck} value="63" label="Total Present Days" color="amber" />
      </div>

      {/* Table */}
      <Card noPad className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-table-header border-b border-gray-800">
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[40%]">Employee</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[15%]">Present</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[15%]">Absent</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[15%]">Leave</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium w-[15%]">Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {mockAttendance.map((att) => (
                <tr key={att.empId} className="hover:bg-table-row-hover transition-colors">
                  <td className="px-4 py-2">
                    <span className="text-base text-white">{att.name}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-base font-medium text-green-400">{att.present}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-base font-medium text-red-400">{att.absent}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-base font-medium text-blue-400">{att.leave}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-base font-medium text-amber-400">{att.late}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
