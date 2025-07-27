export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
  paidAt?: string;
}

export interface User {
  name: string;
  email: string;
  hasPaid: boolean;
}