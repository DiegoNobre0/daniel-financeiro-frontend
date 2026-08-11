export interface Installment {
  id: string;
  transactionId: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  paidDate?: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  totalValue: number;
  paymentMethod: 'CASH' | 'INSTALLMENT';
  installmentsQty: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELED';
  clientId?: string | null;
  client?: { id: string; name: string };
  contractId?: string | null;
  createdAt: string;
  installments?: Installment[]; // Vem quando pedimos os detalhes
}

export interface CreateTransactionDto {
  type: 'INCOME' | 'EXPENSE';
  description: string;
  totalValue: number;
  paymentMethod: 'CASH' | 'INSTALLMENT';
  installmentsQty: number;
  clientId?: string;
  // Para geração automática das parcelas no backend
  dueDate: string; 
  intervalDays?: number;
}

export interface PayInstallmentDto {
  amount: number;
  paidDate: string;
}

export interface ListTransactionsQuery {
  page?: number;
  perPage?: number;
  type?: 'INCOME' | 'EXPENSE';
  status?: string;
  clientId?: string;
}