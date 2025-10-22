import { format, parseISO, differenceInDays, addMonths, isAfter, isBefore } from 'date-fns';

export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const daysUntil = (date: Date | string): number => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(targetDate, new Date());
};

export const isLeaseActive = (startDate: Date | string, endDate: Date | string): boolean => {
  const now = new Date();
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return isAfter(now, start) && isBefore(now, end);
};

export const calculateLeaseEndDate = (startDate: Date | string, durationMonths: number): Date => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  return addMonths(start, durationMonths);
};

export const getDaysRemaining = (endDate: Date | string): number => {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const remaining = differenceInDays(end, new Date());
  return remaining > 0 ? remaining : 0;
};

