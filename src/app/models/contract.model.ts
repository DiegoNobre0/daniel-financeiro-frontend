export interface Contract {
  id: string;

  clientId: string;
  productServiceId: string;

  clientName: string;
  productServiceName: string;

  quantity: number;

  unitPrice: number;
  unitCost: number;

  totalValue: number;
  totalCost: number;
  totalProfit: number;

  profit: number;
  profitMargin: number;

  paymentMethod: 'CASH' | 'INSTALLMENT';
  installmentsQty: number;

  status: 'ACTIVE' | 'FINISHED' | 'CANCELED';

  contractDate: string;

  notes?: string | null;

  transactionId?: string | null;
}

export interface CreateContractDto {
  clientId: string;
  productServiceId: string;
  quantity: number;

  paymentMethod: 'CASH' | 'INSTALLMENT';
  installmentsQty: number;

  contractDate?: string;

  notes?: string;

  generateTransaction?: boolean;
  firstDueDate?: string;
  intervalDays?: number;
}

export interface UpdateContractDto {
  clientId: string;
  productServiceId: string;
  quantity: number;

  paymentMethod: 'CASH' | 'INSTALLMENT';
  installmentsQty: number;

  contractDate: string;
}

export interface ListContractsQuery {
  page?: number;
  perPage?: number;

  clientId?: string;

  status?:
  | 'ACTIVE'
  | 'FINISHED'
  | 'CANCELED';

  startDate?: string;
  endDate?: string;
}

export interface UpdateContractDto {
  clientId: string;

  productServiceId: string;

  quantity: number;

  paymentMethod:
  | 'CASH'
  | 'INSTALLMENT';

  installmentsQty: number;

  contractDate: string;
}

export interface ListContractsQuery {
  page?: number;
  perPage?: number;
  clientId?: string;
  productServiceId?: string;
  status?: 'ACTIVE' | 'FINISHED' | 'CANCELED';
}