export interface Task {
  id: string;
  userId: string;
  clientId?: string | null;
  clientName?: string; // Para facilitar a listagem
  title: string;
  description: string | null;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'DONE' | 'CANCELED';
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  clientId?: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;
export type UpdateTaskStatusDto = { status: 'PENDING' | 'DONE' | 'CANCELED' };