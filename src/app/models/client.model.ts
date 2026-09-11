export interface Client {
  id: string;
  name: string;
  document: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type UpdateClientDto = Partial<CreateClientDto>;

export interface ListClientsQuery {
  page?: number;
  perPage?: number;
  search?: string;
  active?: boolean;
}


export interface ClientDetails {
  client: Client;

  summary: {
    totalPurchases: number;
    totalSpent: number;
    totalOpen: number;
    totalOverdue: number;
    activeContracts: number;
    finishedContracts: number;
  };

  purchases: {
    id: string;
    productServiceId: string;
    productServiceName: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
    totalProfit: number;
    paymentMethod:
      | 'CASH'
      | 'INSTALLMENT';
    installmentsQty: number;
    contractDate: string;
    status:
      | 'ACTIVE'
      | 'FINISHED'
      | 'CANCELED';
    transactionId: string | null;
  }[];

  transactions: {
    id: string;
    type:
      | 'INCOME'
      | 'EXPENSE';
    description: string;
    totalValue: number;
    status:
      | 'PENDING'
      | 'PARTIALLY_PAID'
      | 'PAID'
      | 'OVERDUE'
      | 'CANCELED';
    createdAt: string;
  }[];

  tasks: {
    id: string;
    title: string;
    dueDate: string;
    priority:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH';
    status:
      | 'PENDING'
      | 'DONE'
      | 'CANCELED';
  }[];
}