export interface DashboardSummary {
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  totalOpenReceivables: number;
  totalOverdueAmount: number;
  overdueClientsCount: number;
  tasksToday: number;
  tasksOverdue: number;
  newClientsThisMonth: number;
}

export interface PeriodQuery {
  startDate?: string;
  endDate?: string;
}

// Queries
export interface CashFlowQuery extends PeriodQuery {
  groupBy?: 'day' | 'month';
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
}

export interface ReceivablesQuery extends PeriodQuery, PaginationQuery {
  clientId?: string;
}

// Respostas
export interface CashFlowPoint {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CashFlowResponse {
  points: CashFlowPoint[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
}

export interface OverdueByClientItem {
  clientId: string;
  clientName: string;
  overdueInstallmentsCount: number;
  overdueTotalAmount: number;
  oldestDueDate: string;
}

export interface OverdueReportResponse {
  data: OverdueByClientItem[];
  totalOverdueAmount: number;
  totalOverdueClients: number;
}

export interface RevenueByClientItem {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  totalProfit: number;
  contractsCount: number;
}

export interface RevenueByClientResponse {
  data: RevenueByClientItem[];
  total: number;
  page: number;
  perPage: number;
}