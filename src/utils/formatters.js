// Formatting utility functions

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPeriod = (period) => {
  if (!period) return '';
  const [year, month] = period.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
  });
};

export const getMonthName = (monthNum) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNum - 1] || '';
};

export const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-dark-400 text-dark-100',
    computed: 'bg-blue-500/20 text-blue-400',
    validated: 'bg-amber-500/20 text-amber-400',
    paid: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return colors[status] || colors.draft;
};

export const getStatusLabel = (status) => {
  const labels = {
    draft: 'Draft',
    computed: 'Computed',
    validated: 'Validated',
    paid: 'Done',
    cancelled: 'Cancelled',
  };
  return labels[status] || 'Draft';
};

export const earningLabels = {
  basicSalary: 'Basic Salary',
  hra: 'House Rent Allowance (HRA)',
  standardAllowance: 'Standard Allowance',
  performanceBonus: 'Performance Bonus',
  lta: 'Leave Travel Allowance',
  fixedAllowance: 'Fixed Allowance',
};

export const deductionLabels = {
  pfEmployee: 'PF Employee Contribution',
  pfEmployer: 'PF Employer Contribution',
  professionalTax: 'Professional Tax',
};
