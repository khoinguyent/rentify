export const formatCurrency = (
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(numAmount);
};

export const formatMoney = (amount: number | string): string => {
  return formatCurrency(amount);
};

export const parseMoney = (amount: string): number => {
  return parseFloat(amount.replace(/[^0-9.-]+/g, ''));
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const calculateDiscount = (originalPrice: number, discountPercent: number): number => {
  return originalPrice * (1 - discountPercent / 100);
};

export const calculateLateFee = (rentAmount: number, daysLate: number, feePerDay: number = 50): number => {
  return Math.min(daysLate * feePerDay, rentAmount * 0.1); // Max 10% of rent
};

export const calculateProRatedRent = (
  monthlyRent: number,
  daysInMonth: number,
  daysOccupied: number
): number => {
  return (monthlyRent / daysInMonth) * daysOccupied;
};

