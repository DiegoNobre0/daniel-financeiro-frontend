import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as Models from '../models/report.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private buildParams(query: any): HttpParams {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return params;
  }

  // Rota raiz do dashboard
  getDashboardSummary(): Observable<Models.DashboardSummary> {
    return this.http.get<Models.DashboardSummary>(`${this.apiUrl}/dashboard/summary`);
  }

  // Rotas de relatórios
  getCashFlow(query: Models.CashFlowQuery): Observable<Models.CashFlowResponse> {
    return this.http.get<Models.CashFlowResponse>(`${this.apiUrl}/reports/cash-flow`, { params: this.buildParams(query) });
  }

  getOverdue(): Observable<Models.OverdueReportResponse> {
    return this.http.get<Models.OverdueReportResponse>(`${this.apiUrl}/reports/overdue`);
  }

  getRevenueByClient(query: Models.PeriodQuery & Models.PaginationQuery): Observable<Models.RevenueByClientResponse> {
    return this.http.get<Models.RevenueByClientResponse>(`${this.apiUrl}/reports/revenue-by-client`, { params: this.buildParams(query) });
  }
}