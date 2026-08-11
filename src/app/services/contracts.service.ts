import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ListContractsQuery,
} from '../models/contract.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/contracts`;

  list(query: ListContractsQuery): Observable<PaginatedResponse<Contract>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Contract>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateContractDto): Observable<Contract> {
    return this.http.post<Contract>(this.baseUrl, data);
  }

  update(id: string, data: UpdateContractDto): Observable<Contract> {
    return this.http.patch<Contract>(`${this.baseUrl}/${id}`, data); // Note que no backend usamos PATCH
  }

  cancel(id: string): Observable<{ message: string }> {
  return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/cancel`, {});
}
}