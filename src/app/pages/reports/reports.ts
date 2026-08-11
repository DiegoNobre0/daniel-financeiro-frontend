import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ReportsService } from '../../services/reports.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { CashFlowResponse, OverdueReportResponse, RevenueByClientResponse } from '../../models/report.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';


type ReportTab = 'CASH_FLOW' | 'OVERDUE' | 'REVENUE';

@Component({
  selector: 'app-reports',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private feedback = inject(UiFeedbackService);
  private fb = inject(FormBuilder);

  activeTab = signal<ReportTab>('CASH_FLOW');
  loading = signal(false);

  // Estados dos relatórios
  cashFlowData = signal<CashFlowResponse | null>(null);
  overdueData = signal<OverdueReportResponse | null>(null);
  revenueData = signal<RevenueByClientResponse | null>(null);

  // Filtro de data global
  dateForm = this.fb.group({
    startDate: [''],
    endDate: ['']
  });

  ngOnInit() {
    this.loadCurrentTab();
  }

  setTab(tab: ReportTab) {
    this.activeTab.set(tab);
    this.loadCurrentTab();
  }

  applyFilters() {
    this.loadCurrentTab();
  }

  loadCurrentTab() {
    this.loading.set(true);
    const dates = this.dateForm.getRawValue();
    const query = {
      startDate: dates.startDate ? new Date(dates.startDate).toISOString() : undefined,
      endDate: dates.endDate ? new Date(dates.endDate).toISOString() : undefined,
    };

    if (this.activeTab() === 'CASH_FLOW') {
      this.reportsService.getCashFlow({ ...query, groupBy: 'month' }).subscribe({
        next: (res) => { this.cashFlowData.set(res); this.loading.set(false); },
        error: () => this.handleError()
      });
    } else if (this.activeTab() === 'OVERDUE') {
      this.reportsService.getOverdue().subscribe({
        next: (res) => { this.overdueData.set(res); this.loading.set(false); },
        error: () => this.handleError()
      });
    } else if (this.activeTab() === 'REVENUE') {
      this.reportsService.getRevenueByClient({ ...query, page: 1, perPage: 50 }).subscribe({
        next: (res) => { this.revenueData.set(res); this.loading.set(false); },
        error: () => this.handleError()
      });
    }
  }

  private handleError() {
    this.loading.set(false);
    this.feedback.error('Erro ao gerar relatório.');
  }
}