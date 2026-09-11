import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ReportsService } from '../../services/reports.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import {
  CashFlowResponse,
  OverdueReportResponse,
  RevenueByClientResponse
} from '../../models/report.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

type ReportTab = 'CASH_FLOW' | 'OVERDUE' | 'REVENUE';

@Component({
  selector: 'app-reports',
  standalone: true,

  providers: [
    provideNativeDateAdapter()
  ],

  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    LucideAngularModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],

  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent implements OnInit {

  private reportsService = inject(ReportsService);
  private feedback = inject(UiFeedbackService);
  private fb = inject(FormBuilder);

  activeTab = signal<ReportTab>('CASH_FLOW');
  loading = signal(false);

  cashFlowData = signal<CashFlowResponse | null>(null);
  overdueData = signal<OverdueReportResponse | null>(null);
  revenueData = signal<RevenueByClientResponse | null>(null);

  private currentYear = new Date().getFullYear();

  // =====================================================
  // FILTRO PADRÃO = ANO ATUAL COMPLETO
  // =====================================================

  dateForm = this.fb.group({
    startDate: [
      new Date(
        this.currentYear,
        0,
        1
      ) as Date | null
    ],

    endDate: [
      new Date(
        this.currentYear,
        11,
        31
      ) as Date | null
    ]
  });

  ngOnInit() {
    this.loadCurrentTab();
  }

  // =====================================================
  // TROCAR ABA
  // =====================================================

  setTab(tab: ReportTab) {
    this.activeTab.set(tab);
    this.loadCurrentTab();
  }

  // =====================================================
  // FILTRAR
  // =====================================================

  applyFilters() {
    const {
      startDate,
      endDate
    } = this.dateForm.getRawValue();

    if (!startDate || !endDate) {
      this.feedback.error(
        'Informe a data inicial e a data final.'
      );

      return;
    }

    if (startDate > endDate) {
      this.feedback.error(
        'A data inicial não pode ser maior que a data final.'
      );

      return;
    }

    this.loadCurrentTab();
  }

  // =====================================================
  // VOLTAR PARA O ANO ATUAL
  // =====================================================

  resetCurrentYear() {
    const year = new Date().getFullYear();

    this.dateForm.patchValue({
      startDate: new Date(
        year,
        0,
        1
      ),

      endDate: new Date(
        year,
        11,
        31
      )
    });

    this.loadCurrentTab();
  }

  // =====================================================
  // MONTA QUERY
  // =====================================================

  private buildDateQuery() {

    const {
      startDate,
      endDate
    } = this.dateForm.getRawValue();

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);

      start.setHours(
        0,
        0,
        0,
        0
      );
    }

    if (endDate) {
      end = new Date(endDate);

      end.setHours(
        23,
        59,
        59,
        999
      );
    }

    return {
      startDate:
        start?.toISOString(),

      endDate:
        end?.toISOString(),
    };
  }

  // =====================================================
  // CARREGAMENTO
  // =====================================================

  loadCurrentTab() {

    this.loading.set(true);

    const query =
      this.buildDateQuery();

    // ===================================================
    // FLUXO DE CAIXA
    // ===================================================

    if (
      this.activeTab() === 'CASH_FLOW'
    ) {

      this.reportsService
        .getCashFlow({
          ...query,
          groupBy: 'month'
        })
        .subscribe({

          next: (res) => {

            this.cashFlowData.set(
              res
            );

            this.loading.set(false);
          },

          error: () =>
            this.handleError()
        });

      return;
    }

    // ===================================================
    // INADIMPLÊNCIA
    // ===================================================

    if (
      this.activeTab() === 'OVERDUE'
    ) {

      this.reportsService
        .getOverdue(query)
        .subscribe({

          next: (res) => {

            this.overdueData.set(
              res
            );

            this.loading.set(false);
          },

          error: () =>
            this.handleError()
        });

      return;
    }

    // ===================================================
    // FATURAMENTO
    // ===================================================

    if (
      this.activeTab() === 'REVENUE'
    ) {

      this.reportsService
        .getRevenueByClient({
          ...query,
          page: 1,
          perPage: 50
        })
        .subscribe({

          next: (res) => {

            this.revenueData.set(
              res
            );

            this.loading.set(false);
          },

          error: () =>
            this.handleError()
        });

      return;
    }
  }

  private handleError() {
    this.loading.set(false);

    this.feedback.error(
      'Erro ao gerar relatório.'
    );
  }
}