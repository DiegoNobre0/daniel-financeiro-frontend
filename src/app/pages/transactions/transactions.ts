import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TransactionsService } from '../../services/transactions.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { Transaction } from '../../models/transaction.model';
import { TransactionFormDialogComponent } from '../../components/transaction-form-dialog/transaction-form-dialog';
import { TransactionInstallmentsDialogComponent } from '../../components/transaction-installments-dialog/transaction-installments-dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class TransactionsListComponent implements OnInit {
  private service = inject(TransactionsService);
  private feedback = inject(UiFeedbackService);
  private confirmDialog = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);

  transactions = signal<Transaction[]>([]);
  loading = signal(false);
  total = signal(0);
  page = signal(1);
  perPage = signal(20);

  typeFilter = signal<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  statusFilter = signal<'ALL' | 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELED'>('ALL');

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.perPage())));

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading.set(true);

    const currentType = this.typeFilter();
    const currentStatus = this.statusFilter();

    this.service
      .list({
        page: this.page(),
        perPage: this.perPage(),
        type: currentType === 'ALL' ? undefined : currentType,
        status: currentStatus === 'ALL' ? undefined : currentStatus,
      })
      .subscribe({
        next: (res) => {
          // esconde CANCELED por padrão, exceto se o usuário filtrar por ele explicitamente
          const filtered = currentStatus === 'CANCELED'
            ? res.data
            : res.data.filter((tx) => tx.status !== 'CANCELED');

          this.transactions.set(filtered);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  hasOverdueInstallment(tx: Transaction): boolean {
    return tx.installments?.some((i) => i.status === 'OVERDUE') ?? false;
  }

  onTypeFilterChange(value: 'ALL' | 'INCOME' | 'EXPENSE') {
    this.typeFilter.set(value);
    this.page.set(1);
    this.loadTransactions();
  }

  onStatusFilterChange(value: any) {
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadTransactions();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadTransactions();
  }

  openCreateDialog(type: 'INCOME' | 'EXPENSE') {
    const ref = this.dialog.open(TransactionFormDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      disableClose: true,
      data: { type }, // <--- O objeto de configuração fica separado aqui no segundo parâmetro!
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.feedback.success('Lançamento financeiro registrado com sucesso.');
        this.loadTransactions();
      }
    });
  }

  manageInstallments(transaction: Transaction) {
    const ref = this.dialog.open(TransactionInstallmentsDialogComponent, {
      width: '750px', // Mais larguinho para acomodar a tabela
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      disableClose: true,
      data: { transactionId: transaction.id }
    });

    ref.afterClosed().subscribe((hasChanges) => {
      // Se houveram baixas, recarrega a tabela de trás para refletir o novo status da conta
      if (hasChanges) {
        this.loadTransactions();
      }
    });
  }
  cancelTransaction(transaction: Transaction) {
    this.confirmDialog
      .confirm({
        title: 'Cancelar Lançamento',
        message: `Deseja realmente cancelar o lançamento <strong>${transaction.description}</strong>? As parcelas pendentes também serão canceladas.`,
        confirmText: 'Sim, Cancelar',
        isDanger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.service.cancel(transaction.id).subscribe({
          next: () => {
            this.feedback.success('Lançamento cancelado com sucesso.');
            this.loadTransactions();
          },
          error: (err) => this.feedback.error(err?.error?.message || 'Erro ao cancelar.'),
        });
      });
  }
}