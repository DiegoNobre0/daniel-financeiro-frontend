import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardSummary } from '../models/dashboard.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  // Aponta direto para a raiz do novo módulo
  private baseUrl = `${environment.apiUrl}/dashboard`;

 getSummary(filters?: {
  period?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const params: Record<string, string> = {};

  if (filters?.period) {
    params['period'] = filters.period;
  }

  if (filters?.startDate) {
    params['startDate'] =
      filters.startDate.toISOString();
  }

  if (filters?.endDate) {
    params['endDate'] =
      filters.endDate.toISOString();
  }

  return this.http.get<DashboardSummary>(
    `${this.baseUrl}/summary`,
    {
      params,
    }
  );
}
}