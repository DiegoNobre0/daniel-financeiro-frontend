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