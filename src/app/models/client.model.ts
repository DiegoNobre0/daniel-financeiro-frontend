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