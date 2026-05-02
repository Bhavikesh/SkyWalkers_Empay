import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
import { usePayrollContext } from '../context/PayrollContext';
import { usePayrollStats } from '../hooks/usePayroll';
import SectionHeader from '../components/common/SectionHeader';
import WarningsPanel from '../components/Dashboard/WarningsPanel';
import PayrunList from '../components/Dashboard/PayrunList';
import StatsPanel from '../components/Dashboard/StatsPanel';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function PayrollDashboard() {
  const { payruns, warnings, selectPayrun, createPayrun } = usePayrollContext();
  const stats = usePayrollStats();
  const navigate = useNavigate();
  const [showNewPayrun, setShowNewPayrun] = useState(false);
  const [newMonth, setNewMonth] = useState('November');
  const [newYear, setNewYear] = useState('2025');
  const [creating, setCreating] = useState(false);

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthToPeriod = (month, year) => {
    const idx = monthOptions.indexOf(month) + 1;
    return `${year}-${String(idx).padStart(2, '0')}`;
  };

  const handleCreatePayrun = async () => {
    setCreating(true);
    const period = monthToPeriod(newMonth, newYear);
    const payrun = await createPayrun(period, newMonth, newYear);
    setCreating(false);
    setShowNewPayrun(false);
    selectPayrun(payrun);
    navigate('/payrun');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SectionHeader
        icon={Wallet}
        title="Payroll"
        subtitle="Manage employee payroll and payslips"
        action={
          <Button onClick={() => setShowNewPayrun(true)} id="new-payrun-btn">
            <Plus className="w-4 h-4" />
            New Payrun
          </Button>
        }
      />

      {/* Dashboard Tabs */}
      <div className="flex items-center gap-1 bg-[#0f172a] border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => navigate('/payroll')}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white cursor-pointer"
          id="tab-dashboard"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/payrun')}
          className="px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
          id="tab-payrun"
        >
          Payrun
        </button>
      </div>

      {/* Warnings */}
      <WarningsPanel warnings={warnings} />

      {/* Payrun List */}
      <PayrunList payruns={payruns} onSelectPayrun={selectPayrun} />

      {/* Stats */}
      <StatsPanel {...stats} />

      {/* New Payrun Modal */}
      <Modal
        isOpen={showNewPayrun}
        onClose={() => setShowNewPayrun(false)}
        title="Create New Payrun"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Month</label>
            <select
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              className="w-full bg-input-bg border border-input-border text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
              id="new-payrun-month"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Year</label>
            <select
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full bg-input-bg border border-input-border text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
              id="new-payrun-year"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={() => setShowNewPayrun(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreatePayrun} disabled={creating} className="flex-1" id="create-payrun-btn">
              {creating ? 'Creating...' : 'Create Payrun'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
