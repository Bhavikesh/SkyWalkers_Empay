import { Building, CreditCard, User, Hash, MapPin, Briefcase, Calendar } from 'lucide-react';

export default function EmployeeInfoSection({ payslip }) {
  if (!payslip) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* LEFT COLUMN — Employee Details + Bank */}
      <div className="space-y-4">
        <InfoCard title="Employee Details">
          <InfoRow icon={User} label="Name" value={payslip.employeeName} />
          <InfoRow icon={Hash} label="Employee Code" value={payslip.employeeCode} />
          <InfoRow icon={MapPin} label="Department" value={payslip.department} />
          <InfoRow icon={Briefcase} label="Designation" value={payslip.designation} />
        </InfoCard>

        <InfoCard title="Bank Details">
          <InfoRow icon={Building} label="Bank" value={payslip.bankName || 'Not Provided'} />
          <InfoRow icon={CreditCard} label="Account No." value={payslip.bankAccount || 'N/A'} />
          <InfoRow icon={Hash} label="IFSC" value={payslip.ifsc || 'N/A'} />
        </InfoCard>
      </div>

      {/* RIGHT COLUMN — Tax/Compliance + Pay Period */}
      <div className="space-y-4">
        <InfoCard title="Tax & Compliance">
          <InfoRow icon={Hash} label="PAN" value={payslip.pan || 'N/A'} />
          <InfoRow icon={Hash} label="UAN" value={payslip.uan || 'N/A'} />
        </InfoCard>

        <InfoCard title="Pay Period">
          <InfoRow icon={Calendar} label="Period" value={payslip.payPeriod} />
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-sm p-6">
      <h4 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-4">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-base text-white font-medium">{value}</span>
    </div>
  );
}
