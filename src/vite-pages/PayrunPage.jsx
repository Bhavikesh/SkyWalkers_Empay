import { useNavigate } from 'react-router-dom';
import { Play, Calculator, ShieldCheck, Wallet, ArrowLeft } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import PayrunTable from '../components/Payrun/PayrunTable';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { PAYSLIP_STATES } from '../services/payrollService';

export default function PayrunPage() {
  const {
    payruns,
    selectedPayrun,
    selectPayrun,
    selectPayslip,
    computeAllInPayrun,
    validateAllInPayrun,
  } = usePayroll();
  const navigate = useNavigate();

  // Use first payrun if none selected
  const payrun = selectedPayrun || payruns[0];

  if (!payrun) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Payrun Selected</h2>
        <p className="text-sm text-gray-400 mb-6">Create or select a payrun from the dashboard</p>
        <Button onClick={() => navigate('/payroll')} id="go-dashboard-btn">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Determine available actions based on payslip states
  const allDraft = payrun.payslips.every((p) => p.status === PAYSLIP_STATES.DRAFT);
  const anyDraft = payrun.payslips.some((p) => p.status === PAYSLIP_STATES.DRAFT);
  const anyComputed = payrun.payslips.some((p) => p.status === PAYSLIP_STATES.COMPUTED);

  const handleCompute = () => computeAllInPayrun(payrun.id);
  const handleValidate = () => validateAllInPayrun(payrun.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/payroll')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white truncate">{payrun.name}</h1>
              <StatusBadge status={payrun.status} size="md" />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {payrun.payslipCount} payslip{payrun.payslipCount !== 1 ? 's' : ''} • Created{' '}
              {new Date(payrun.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#0f172a] border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => navigate('/payroll')}
          className="px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
        >
          Dashboard
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white cursor-pointer">
          Payrun
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="primary" disabled={!anyDraft && !allDraft} id="payrun-generate-btn" size="sm">
          <Play className="w-4 h-4" />
          Payrun
        </Button>
        <Button variant="secondary" onClick={handleCompute} disabled={!anyDraft} id="payrun-compute-btn" size="sm">
          <Calculator className="w-4 h-4" />
          Compute
        </Button>
        <Button variant="success" onClick={handleValidate} disabled={!anyComputed} id="payrun-validate-btn" size="sm">
          <ShieldCheck className="w-4 h-4" />
          Validate
        </Button>
      </div>

      {/* Payrun Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400 font-medium">Select Payrun:</label>
        <select
          value={payrun.id}
          onChange={(e) => {
            const selected = payruns.find((p) => p.id === parseInt(e.target.value));
            if (selected) selectPayrun(selected);
          }}
          className="bg-input-bg border border-input-border text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
          id="payrun-selector"
        >
          {payruns.map((pr) => (
            <option key={pr.id} value={pr.id}>
              {pr.name} ({pr.payslipCount} payslips)
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <PayrunTable payrun={payrun} onSelectPayslip={selectPayslip} />
    </div>
  );
}
