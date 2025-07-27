import { Invoice, User } from '@/types/invoice';

export const STORAGE_KEYS = {
  INVOICES: 'paynapple_invoices',
  USER: 'paynapple_user'
} as const;

export const loadInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const loadUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const exportToCSV = (invoices: Invoice[]): void => {
  const headers = ['Client Name', 'Amount', 'Status', 'Created Date', 'Paid Date'];
  const csvContent = [
    headers.join(','),
    ...invoices.map(invoice => [
      `"${invoice.clientName}"`,
      invoice.amount.toFixed(2),
      invoice.status,
      new Date(invoice.createdAt).toLocaleDateString(),
      invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};