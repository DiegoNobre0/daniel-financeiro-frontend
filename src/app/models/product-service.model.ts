export interface ProductService {
  id: string;
  name: string;
  description: string | null;
  type: 'PRODUCT' | 'SERVICE';
  costPrice: number | null;
  salePrice: number;
  profit: number;
  profitMargin: number;
  unit: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateProductServiceDto {
  name: string;
  description?: string;
  type: 'PRODUCT' | 'SERVICE';
  costPrice?: number;
  salePrice: number;
  unit?: string;
}

export type UpdateProductServiceDto = Partial<CreateProductServiceDto>;

export interface ListProductServicesQuery {
  page?: number;
  perPage?: number;
  search?: string;
  type?: 'PRODUCT' | 'SERVICE';
  active?: boolean;
}