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
  providers: [provideNativeDateAdapter()], // Necessário para o Datepicker funcionar
  imports: [
    CommonModule, 
    LucideAngularModule, 
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule
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

  // Formulário de filtro para o Dashboard
  filterForm = this.fb.group({
    period: ['this_month'],
    customDate: ['']
  });

  ngOnInit() {
    this.loadData();

    // Recarrega os dados caso o usuário mude o filtro
    this.filterForm.valueChanges.subscribe(() => {
      // Aqui você poderia passar os valores do form para a API no futuro
      this.loadData();
    });
  }

  loadData() {
    this.loading.set(true);
    
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.feedback.error('Erro ao carregar o painel inicial.');
        this.loading.set(false);
      }
    });
  }
}