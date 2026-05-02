// Mock Salary Structure Service

const salaryStructure = {
  // Percentages of CTC
  earnings: {
    basicSalary: 0.50,      // 50% of CTC
    hra: 0.20,               // 20% of CTC
    standardAllowance: 0.08, // 8% of CTC
    performanceBonus: 0.05,  // 5% of CTC
    lta: 0.04,               // 4% of CTC (Leave Travel Allowance)
    fixedAllowance: 0.13,    // 13% of CTC (remaining)
  },
  deductions: {
    pfEmployee: 0.12,        // 12% of Basic
    pfEmployer: 0.12,        // 12% of Basic
    professionalTax: 200,    // Fixed ₹200/month
  },
};

export const getSalaryStructure = () => {
  return Promise.resolve({ ...salaryStructure });
};

export const calculateMonthlySalary = (annualCTC) => {
  const monthly = annualCTC / 12;
  
  const earnings = {
    basicSalary: Math.round(monthly * salaryStructure.earnings.basicSalary),
    hra: Math.round(monthly * salaryStructure.earnings.hra),
    standardAllowance: Math.round(monthly * salaryStructure.earnings.standardAllowance),
    performanceBonus: Math.round(monthly * salaryStructure.earnings.performanceBonus),
    lta: Math.round(monthly * salaryStructure.earnings.lta),
    fixedAllowance: Math.round(monthly * salaryStructure.earnings.fixedAllowance),
  };

  const grossSalary = Object.values(earnings).reduce((a, b) => a + b, 0);
  
  const deductions = {
    pfEmployee: Math.round(earnings.basicSalary * salaryStructure.deductions.pfEmployee),
    pfEmployer: Math.round(earnings.basicSalary * salaryStructure.deductions.pfEmployer),
    professionalTax: salaryStructure.deductions.professionalTax,
  };

  const totalDeductions = deductions.pfEmployee + deductions.professionalTax;
  const netSalary = grossSalary - totalDeductions;
  const employerCost = grossSalary + deductions.pfEmployer;

  return {
    earnings,
    deductions,
    grossSalary,
    netSalary,
    totalDeductions,
    employerCost,
    basicWage: earnings.basicSalary,
  };
};

export const calculateProRataSalary = (annualCTC, workedDays, totalWorkingDays, paidLeave) => {
  const fullMonthSalary = calculateMonthlySalary(annualCTC);
  const effectiveDays = workedDays + paidLeave;
  const ratio = effectiveDays / totalWorkingDays;

  const proRataEarnings = {};
  for (const [key, value] of Object.entries(fullMonthSalary.earnings)) {
    proRataEarnings[key] = Math.round(value * ratio);
  }

  const proRataGross = Object.values(proRataEarnings).reduce((a, b) => a + b, 0);
  
  const proRataDeductions = {
    pfEmployee: Math.round(proRataEarnings.basicSalary * salaryStructure.deductions.pfEmployee),
    pfEmployer: Math.round(proRataEarnings.basicSalary * salaryStructure.deductions.pfEmployer),
    professionalTax: salaryStructure.deductions.professionalTax,
  };

  const totalDeductions = proRataDeductions.pfEmployee + proRataDeductions.professionalTax;
  const netSalary = proRataGross - totalDeductions;
  const employerCost = proRataGross + proRataDeductions.pfEmployer;

  return {
    earnings: proRataEarnings,
    deductions: proRataDeductions,
    grossSalary: proRataGross,
    netSalary,
    totalDeductions,
    employerCost,
    basicWage: proRataEarnings.basicSalary,
    effectiveDays,
    totalWorkingDays,
    ratio,
  };
};

export default {
  getSalaryStructure,
  calculateMonthlySalary,
  calculateProRataSalary,
};
