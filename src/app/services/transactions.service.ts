import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Transaction,
  CreateTransactionDto,
  PayInstallmentDto,
  ListTransactionsQuery,
} from '../models/transaction.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/transactions`;

  list(query: ListTransactionsQuery): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Transaction>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, data);
  }

 cancel(id: string): Observable<{ message: string }> {
  return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/cancel`, {});
}

  // Novo endpoint focado apenas em dar baixa na parcela
  payInstallment(installmentId: string, data: PayInstallmentDto): Observable<any> {
    return this.http.patch(`${this.baseUrl}/installments/${installmentId}/pay`, data);
  }
}