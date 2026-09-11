import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

import { UiFeedbackService } from '../../services/ui-feedback.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary } from '../../models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  providers: [
    provideNativeDateAdapter(),
  ],

  imports: [
    CommonModule,
    LucideAngularModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {

  private dashboardService = inject(DashboardService);
  private feedback = inject(UiFeedbackService);
  private fb = inject(FormBuilder);

  summary = signal<DashboardSummary | null>(null);

  loading = signal(true);

  filterForm = this.fb.group({
    period: ['this_month'],

    startDate: [
      null as Date | null
    ],

    endDate: [
      null as Date | null
    ],
  });

  ngOnInit() {
    this.loadData();
  }

  // =====================================================
  // SELECIONOU UM PERÍODO DO DROPDOWN
  // =====================================================

  onPeriodChange(period: string) {

    // "custom" é apenas visual.
    // Não deve chamar a API diretamente.
    if (period === 'custom') {
      return;
    }

    // Ao escolher Hoje / Semana / Mês / Mês passado
    // limpamos qualquer intervalo personalizado.
    this.filterForm.patchValue(
      {
        startDate: null,
        endDate: null,
      },
      {
        emitEvent: false,
      }
    );

    this.loadData();
  }

  // =====================================================
  // SELECIONOU DATA PERSONALIZADA
  // =====================================================

  onCustomDateChange() {

    const {
      startDate,
      endDate,
    } = this.filterForm.getRawValue();

    // Se pelo menos uma das datas foi selecionada,
    // altera visualmente o dropdown.
    if (startDate || endDate) {

      this.filterForm.patchValue(
        {
          period: 'custom',
        },
        {
          emitEvent: false,
        }
      );
    }

    // Só consulta quando ambas estiverem preenchidas.
    if (!startDate || !endDate) {
      return;
    }

    if (startDate > endDate) {

      this.feedback.error(
        'A data inicial não pode ser maior que a data final.'
      );

      return;
    }

    this.loadData();
  }

  // =====================================================
  // BOTÃO ATUALIZAR
  // =====================================================

  resetAndRefresh() {

    this.filterForm.patchValue(
      {
        period: 'this_month',
        startDate: null,
        endDate: null,
      },
      {
        emitEvent: false,
      }
    );

    this.loadData();
  }

  // =====================================================
  // CARREGAMENTO
  // =====================================================

  loadData() {

    this.loading.set(true);

    const {
      period,
      startDate,
      endDate,
    } = this.filterForm.getRawValue();

    // ===============================================
    // INTERVALO PERSONALIZADO
    // ===============================================

    if (
      period === 'custom' &&
      startDate &&
      endDate
    ) {

      this.dashboardService.getSummary({
        startDate,
        endDate,
      }).subscribe({
        next: (data) => {

          this.summary.set(data);

          this.loading.set(false);
        },

        error: () => {

          this.feedback.error(
            'Erro ao carregar o painel inicial.'
          );

          this.loading.set(false);
        },
      });

      return;
    }

    // ===============================================
    // PERÍODO PRÉ-DEFINIDO
    // ===============================================

    this.dashboardService.getSummary({
      period:
        period === 'custom'
          ? 'this_month'
          : period ?? 'this_month',
    }).subscribe({
      next: (data) => {

        this.summary.set(data);

        this.loading.set(false);
      },

      error: () => {

        this.feedback.error(
          'Erro ao carregar o painel inicial.'
        );

        this.loading.set(false);
      },
    });
  }
}