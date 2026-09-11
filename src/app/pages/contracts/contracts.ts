import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContractsService } from '../../services/contracts.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { Contract } from '../../models/contract.model';
import { ContractFormDialogComponent } from '../../components/contract-form-dialog/contract-form-dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
  selector: 'app-contracts-list',
  standalone: true,
  providers: [
    provideNativeDateAdapter()
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, MatSelectModule, MatButtonModule, MatDialogModule, MatSelectModule, MatButtonModule, MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,],
  templateUrl: './contracts.html',
  styleUrl: './contracts.scss',
})
export class ContractsListComponent implements OnInit {
  private service = inject(ContractsService);
  private feedback = inject(UiFeedbackService);
  private confirmDialog = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);

  contracts = signal<Contract[]>([]);
  loading = signal(false);
  total = signal(0);
  page = signal(1);
  perPage = signal(20);

  statusFilter = signal<'ALL' | 'ACTIVE' | 'FINISHED' | 'CANCELED'>('ALL');

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.perPage())));

  startDate =
    signal<Date | null>(
      null
    );

  endDate =
    signal<Date | null>(
      null
    );

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {

    this.loading.set(true);

    const currentStatus =
      this.statusFilter();

    let startDate:
      string | undefined;

    let endDate:
      string | undefined;

    if (
      this.startDate()
    ) {

      const date =
        new Date(
          this.startDate()!
        );

      date.setHours(
        0,
        0,
        0,
        0
      );

      startDate =
        date.toISOString();
    }

    if (
      this.endDate()
    ) {

      const date =
        new Date(
          this.endDate()!
        );

      date.setHours(
        23,
        59,
        59,
        999
      );

      endDate =
        date.toISOString();
    }

    this.service
      .list({

        page:
          this.page(),

        perPage:
          this.perPage(),

        status:
          currentStatus === 'ALL'
            ? undefined
            : currentStatus,

        startDate,

        endDate,

      })
      .subscribe({

        next: (
          res
        ) => {

          this.contracts.set(
            res.data
          );

          this.total.set(
            res.total
          );

          this.loading.set(
            false
          );
        },

        error: () =>
          this.loading.set(
            false
          ),
      });
  }
  onStatusFilterChange(value: 'ALL' | 'ACTIVE' | 'FINISHED' | 'CANCELED') {
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadContracts();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadContracts();
  }

  openCreateDialog() {
    const ref = this.dialog.open(ContractFormDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      disableClose: true // Previne fechar clicando fora já que é um form complexo
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.feedback.success('Venda registrada com sucesso.');
        this.loadContracts();
      }
    });
  }

  cancelContract(contract: Contract) {
    this.confirmDialog
      .confirm({
        title: 'Cancelar Contrato/Venda',
        message: `Tem certeza que deseja cancelar a venda de <strong>${contract.productServiceName}</strong> para <strong>${contract.clientName}</strong>? <br><br><b>Aviso:</b> Isso cancelará automaticamente todas as parcelas financeiras pendentes relacionadas a esta venda.`,
        confirmText: 'Sim, Cancelar',
        isDanger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.service.cancel(contract.id).subscribe({
          next: () => {
            this.feedback.success('Contrato e parcelas cancelados com sucesso.');
            this.loadContracts();
          },
          error: (err) => this.feedback.error(err?.error?.message || 'Erro ao cancelar contrato.'),
        });
      });
  }

  openEditDialog(
    contract: Contract
  ) {
    const ref =
      this.dialog.open(
        ContractFormDialogComponent,
        {
          width:
            '640px',

          maxWidth:
            '95vw',

          panelClass:
            'n8-dialog-panel',

          disableClose:
            true,

          data: {
            contract
          }
        }
      );

    ref
      .afterClosed()
      .subscribe(
        (result) => {

          if (!result) {
            return;
          }

          this.feedback.success(
            'Venda atualizada com sucesso.'
          );

          this.loadContracts();
        }
      );
  }

  applyDateFilter() {

    if (
      this.startDate() &&
      this.endDate() &&
      this.startDate()! >
      this.endDate()!
    ) {

      this.feedback.error(
        'A data inicial não pode ser maior que a data final.'
      );

      return;
    }

    this.page.set(1);

    this.loadContracts();
  }


  clearDateFilter() {

    this.startDate.set(
      null
    );

    this.endDate.set(
      null
    );

    this.page.set(1);

    this.loadContracts();
  }
}