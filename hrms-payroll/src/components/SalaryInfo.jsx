function currency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
}

function Label({ children }) {
  return <p className="text-xs uppercase tracking-wide text-gray-500">{children}</p>
}

export function SalaryInfo({ salary, canEdit, onChange }) {
  const fields = [
    { key: 'monthlyWage', label: 'Monthly Wage' },
    { key: 'workingDaysPerWeek', label: 'Working days/week' },
    { key: 'basicPercent', label: 'Basic Salary (%)' },
    { key: 'hraPercentOfBasic', label: 'HRA (% of Basic)' },
    { key: 'standardAllowance', label: 'Standard Allowance' },
    { key: 'performanceBonus', label: 'Performance Bonus' },
    { key: 'lta', label: 'LTA' },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="grid grid-cols-1 gap-4">
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-2">
            <Label>{f.label}</Label>
            <input
              type="number"
              value={salary[f.key]}
              disabled={!canEdit}
              onChange={(e) => onChange(f.key, Number(e.target.value))}
              className="rounded-lg border border-gray-800 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none disabled:opacity-70"
            />
          </label>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-gray-800 bg-[#0f172a] p-4">
        <p className="text-sm font-semibold text-white">Salary summary</p>
        <div className="space-y-2 text-sm text-gray-300">
          <p>Yearly wage: {currency(salary.yearlyWage)}</p>
          <p>Basic: {currency(salary.components.basic)}</p>
          <p>HRA: {currency(salary.components.hra)}</p>
          <p>Standard allowance: {currency(salary.components.standardAllowance)}</p>
          <p>Performance bonus: {currency(salary.components.performanceBonus)}</p>
          <p>LTA: {currency(salary.components.lta)}</p>
          <p>Fixed allowance: {currency(salary.components.fixedAllowance)}</p>
          <p className="font-semibold text-white">Total components: {currency(salary.components.total)}</p>
        </div>

        <div className="border-t border-gray-800 pt-3 text-sm text-gray-300">
          <p>PF Employee: {currency(salary.deductions.pfEmployee)}</p>
          <p>PF Employer: {currency(salary.deductions.pfEmployer)}</p>
          <p>Professional Tax: {currency(salary.deductions.professionalTax)}</p>
        </div>
      </div>
    </div>
  )
}
