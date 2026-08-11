import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Client, CreateClientDto, UpdateClientDto, ListClientsQuery } from '../models/client.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clients`;

  list(query: ListClientsQuery): Observable<PaginatedResponse<Client>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Client>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, data);
  }

  update(id: string, data: UpdateClientDto): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}