// Payroll calculation utilities

export const calculateGrossSalary = (earnings) => {
  return Object.values(earnings).reduce((sum, val) => sum + val, 0);
};

export const calculateTotalDeductions = (deductions) => {
  // Only employee-side deductions affect net
  return (deductions.pfEmployee || 0) + (deductions.professionalTax || 0);
};

export const calculateNetSalary = (grossSalary, deductions) => {
  const totalDeductions = calculateTotalDeductions(deductions);
  return grossSalary - totalDeductions;
};

export const calculateEmployerCost = (grossSalary, deductions) => {
  return grossSalary + (deductions.pfEmployer || 0);
};

export const calculateWorkedDaysTotal = (workedDays) => {
  return workedDays.reduce((sum, wd) => sum + wd.days, 0);
};

export const calculateWorkedDaysAmountTotal = (workedDays) => {
  return workedDays.reduce((sum, wd) => sum + wd.amount, 0);
};
