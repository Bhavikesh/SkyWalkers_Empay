import { CalendarOff, PlusCircle } from 'lucide-react';
import Card from '../components/common/Card';
import SectionHeader from '../components/common/SectionHeader';
import Button from '../components/common/Button';

export default function TimeOffPage() {
  const leaveRequests = [
    { id: 1, employee: 'Ravi Kumar', type: 'Casual Leave', from: 'Oct 15, 2025', to: 'Oct 16, 2025', days: 2, status: 'Approved' },
    { id: 2, employee: 'Priya Sharma', type: 'Sick Leave', from: 'Oct 8, 2025', to: 'Oct 10, 2025', days: 3, status: 'Approved' },
    { id: 3, employee: 'Arjun Patel', type: 'Casual Leave', from: 'Oct 20, 2025', to: 'Oct 20, 2025', days: 1, status: 'Pending' },
  ];

  const statusColor = {
    Approved: 'bg-green-500/20 text-green-400',
    Pending: 'bg-amber-500/20 text-amber-400',
    Rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={CalendarOff}
        title="Time Off"
        subtitle="Manage leave requests"
        color="orange"
        action={
          <Button>
            <PlusCircle className="w-4 h-4" />
            New Request
          </Button>
        }
      />

      <Card noPad className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-table-header border-b border-gray-800">
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Employee</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Type</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">From</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">To</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Days</th>
                <th className="text-left px-4 py-2 text-sm text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-table-row-hover transition-colors">
                  <td className="px-4 py-2 text-base text-white">{req.employee}</td>
                  <td className="px-4 py-2 text-base text-gray-300">{req.type}</td>
                  <td className="px-4 py-2 text-base text-gray-300">{req.from}</td>
                  <td className="px-4 py-2 text-base text-gray-300">{req.to}</td>
                  <td className="px-4 py-2 text-base font-medium text-white">{req.days}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statusColor[req.status]}`}>
                      {req.status}
                    </span>
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
