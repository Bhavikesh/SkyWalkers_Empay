import { Users, UserPlus, Search, MoreHorizontal } from 'lucide-react';
import Card from '../components/common/Card';
import SectionHeader from '../components/common/SectionHeader';
import Button from '../components/common/Button';
import { usePayrollContext } from '../context/PayrollContext';

export default function EmployeesPage() {
  const { employees } = usePayrollContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon={Users}
        title="Employees"
        subtitle={`${employees.length} total employees`}
        color="blue"
        action={
          <Button id="add-employee-btn">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search employees..."
          className="w-full pl-11 pr-4 py-2 bg-input-bg border border-input-border text-white text-sm rounded-xl focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-500"
        />
      </div>

      {/* Employee Cards — strict 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card key={emp.id} className="flex flex-col">
            {/* Top: Avatar + Name + Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                  {emp.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-white truncate">{emp.name}</h3>
                  <p className="text-sm text-gray-400">{emp.code}</p>
                </div>
              </div>
              <button className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-dark-500 transition-colors cursor-pointer flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom: Detail rows — clean 2-col grid */}
            <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
              <InfoField label="Department" value={emp.department} />
              <InfoField label="Designation" value={emp.designation} />
              <InfoField label="Email" value={emp.email} truncate />
              <InfoField
                label="Bank A/c"
                value={
                  emp.hasBank ? (
                    <span className="text-green-400 font-medium">✓ Linked</span>
                  ) : (
                    <span className="text-amber-400 font-medium">✗ Missing</span>
                  )
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InfoField({ label, value, truncate = false }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
      <p className={`text-base text-white ${truncate ? 'truncate' : ''}`}>{value}</p>
    </div>
  );
}
