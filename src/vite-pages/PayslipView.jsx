import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calculator,
  ShieldCheck,
  XCircle,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import EmployeeInfoSection from '../components/Payslip/EmployeeInfoSection';
import WorkedDaysTab from '../components/Payslip/WorkedDaysTab';
import SalaryComputationTab from '../components/Payslip/SalaryComputationTab';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { PAYSLIP_STATES } from '../services/payrollService';

export default function PayslipView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    payruns,
    selectedPayslip,
    computePayslip,
    validatePayslip,
    markAsPaid,
    cancelPayslip,
  } = usePayroll();
  const [activeTab, setActiveTab] = useState('worked-days');

  // Find payslip from payruns if not selected
  let payslip = selectedPayslip;
  if (!payslip || (id && payslip.id !== parseInt(id))) {
    for (const pr of payruns) {
      const found = pr.payslips.find((ps) => ps.id === parseInt(id));
      if (found) {
        payslip = found;
        break;
      }
    }
  }

  if (!payslip) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Payslip Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">The requested payslip could not be found</p>
        <Button onClick={() => navigate('/payrun')}>Back to Payrun</Button>
      </div>
    );
  }

  const isDraft = payslip.status === PAYSLIP_STATES.DRAFT;
  const isComputed = payslip.status === PAYSLIP_STATES.COMPUTED;
  const isValidated = payslip.status === PAYSLIP_STATES.VALIDATED;
  const isPaid = payslip.status === PAYSLIP_STATES.PAID;
  const isCancelled = payslip.status === PAYSLIP_STATES.CANCELLED;
  const isLocked = isValidated || isPaid;

  const handleCompute = () => computePayslip(payslip);
  const handleValidate = () => validatePayslip(payslip);
  const handleMarkPaid = () => markAsPaid(payslip);
  const handleCancel = () => cancelPayslip(payslip);
  const handlePrint = () => navigate(`/payslip-pdf/${payslip.id}`);
  const handleNewPayslip = () => navigate('/payrun');

  const tabs = [
    { id: 'worked-days', label: 'Worked Days' },
    { id: 'salary-computation', label: 'Salary Computation' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/payrun')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white truncate">
                Payslip — {payslip.employeeName}
              </h1>
              <StatusBadge status={payslip.status} size="md" />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {payslip.employeeCode} • {payslip.department} • {payslip.payPeriod}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" onClick={handleNewPayslip} id="new-payslip-btn" size="sm">
          <Plus className="w-4 h-4" />
          New Payslip
        </Button>

        {isDraft && (
          <Button variant="secondary" onClick={handleCompute} id="compute-payslip-btn" size="sm">
            <Calculator className="w-4 h-4" />
            Compute
          </Button>
        )}

        {isComputed && (
          <Button variant="success" onClick={handleValidate} id="validate-payslip-btn" size="sm">
            <ShieldCheck className="w-4 h-4" />
            Validate
          </Button>
        )}

        {isValidated && (
          <Button variant="success" onClick={handleMarkPaid} id="mark-paid-btn" size="sm">
            <CheckCircle2 className="w-4 h-4" />
            Mark as Paid
          </Button>
        )}

        {!isPaid && !isCancelled && (
          <Button variant="danger" onClick={handleCancel} id="cancel-payslip-btn" size="sm">
            <XCircle className="w-4 h-4" />
            Cancel
          </Button>
        )}

        <Button variant="outline" onClick={handlePrint} id="print-payslip-btn" size="sm">
          <Printer className="w-4 h-4" />
          Print
        </Button>

        {isLocked && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              {isPaid ? 'Payslip is finalized' : 'Payslip is locked — validated'}
            </span>
          </div>
        )}
      </div>

      {/* Employee Info — 2-column grid */}
      <EmployeeInfoSection payslip={payslip} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-[#0f172a] border border-gray-800 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={activeTab}>
        {activeTab === 'worked-days' && (
          <WorkedDaysTab workedDays={payslip.workedDays} />
        )}
        {activeTab === 'salary-computation' && (
          <SalaryComputationTab payslip={payslip} />
        )}
      </div>
    </div>
  );
}
