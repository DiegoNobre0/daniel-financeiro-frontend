import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ProductService,
  CreateProductServiceDto,
  UpdateProductServiceDto,
  ListProductServicesQuery,
} from '../models/product-service.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsServicesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products-services`;

  list(query: ListProductServicesQuery): Observable<PaginatedResponse<ProductService>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<ProductService>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ProductService> {
    return this.http.get<ProductService>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateProductServiceDto): Observable<ProductService> {
    return this.http.post<ProductService>(this.baseUrl, data);
  }

  update(id: string, data: UpdateProductServiceDto): Observable<ProductService> {
    return this.http.put<ProductService>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}