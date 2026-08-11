export interface Contract {
  id: string;
  clientId: string;
  productServiceId: string;
  clientName?: string;
  productServiceName?: string;
  quantity: number;
  unitCost?: number | null;
  unitPrice: number;
  totalCost?: number | null;
  totalValue: number;
  profit: number;
  profitMargin: number;
  contractDate: string;
  status: 'ACTIVE' | 'FINISHED' | 'CANCELED';
  notes?: string | null;
  createdAt: string;
}

export interface CreateContractDto {
  clientId: string;
  productServiceId: string;
  quantity: number;
  paymentMethod: 'CASH' | 'INSTALLMENT';
  installmentsQty: number;
  contractDate?: string;
  notes?: string;
  
  // Integração com o financeiro
  generateTransaction: boolean;
  firstDueDate?: string;
  intervalDays?: number;
}

export interface UpdateContractDto {
  status?: 'ACTIVE' | 'FINISHED' | 'CANCELED';
  notes?: string;
}

export interface ListContractsQuery {
  page?: number;
  perPage?: number;
  clientId?: string;
  productServiceId?: string;
  status?: 'ACTIVE' | 'FINISHED' | 'CANCELED';
}