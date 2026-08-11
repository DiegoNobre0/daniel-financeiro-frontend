import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task, CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from '../models/task.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/tasks`;

  list(query: any): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Task>>(this.baseUrl, { params });
  }

  create(data: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, data);
  }

  update(id: string, data: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, data);
  }

  updateStatus(id: string, data: UpdateTaskStatusDto): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}