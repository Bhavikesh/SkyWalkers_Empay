import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { usePayrollContext } from '../context/PayrollContext';
import PayslipPDF from '../components/PayslipPDF/PayslipPDF';
import Button from '../components/common/Button';

export default function PayslipPDFPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { payruns, selectedPayslip } = usePayrollContext();

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
        <Button onClick={() => navigate('/payrun')}>Back</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - hidden in print */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/payslip/${payslip.id}`)}
            className="p-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Payslip Preview</h1>
            <p className="text-sm text-dark-200">
              {payslip.employeeName} — {payslip.payPeriod}
            </p>
          </div>
        </div>
        <Button onClick={handlePrint} id="download-payslip-btn">
          <Download className="w-4 h-4" />
          Print / Download
        </Button>
      </div>

      {/* PDF */}
      <PayslipPDF payslip={payslip} />
    </div>
  );
}
