import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { LucideAngularModule } from 'lucide-angular';
import { TransactionsService } from '../../services/transactions.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { Installment, Transaction } from '../../models/transaction.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-transaction-installments-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, NgxMaskDirective, LucideAngularModule, MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,],
  templateUrl: './transaction-installments-dialog.html',
  styleUrl: './transaction-installments-dialog.scss',
})
export class TransactionInstallmentsDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(TransactionsService);
  private feedback = inject(UiFeedbackService);
  private dialogRef = inject(MatDialogRef<TransactionInstallmentsDialogComponent>);

  transaction = signal<Transaction | null>(null);
  loading = signal(true);

  // Controla qual parcela está sendo paga no momento
  payingInstallmentId = signal<string | null>(null);
  savingPayment = signal(false);
  hasChanges = signal(false); // Para saber se precisa recarregar a lista por trás do modal

 payForm = this.fb.nonNullable.group({
    amount: ['', Validators.required], 
    paidDate: [new Date().toISOString().substring(0, 10), Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { transactionId: string }) { }

  ngOnInit() {
    this.loadTransactionDetails();
  }

  loadTransactionDetails() {
    this.loading.set(true);
    this.service.getById(this.data.transactionId).subscribe({
      next: (tx) => {
        this.transaction.set(tx);
        this.loading.set(false);
      },
      error: () => {
        this.feedback.error('Erro ao carregar detalhes da transação.');
        this.close();
      }
    });
  }

  openPaymentForm(installment: Installment) {
    const remainingAmount = installment.amount - installment.paidAmount;

    this.payForm.patchValue({
      amount: remainingAmount.toString(), // ✅ Correção AQUI TAMBÉM!
      paidDate: new Date().toISOString().substring(0, 10)
    });

    this.payingInstallmentId.set(installment.id);
  }
  cancelPayment() {
    this.payingInstallmentId.set(null);
    this.payForm.reset();
  }

  confirmPayment(installmentId: string) {
    if (this.payForm.invalid) {
      this.payForm.markAllAsTouched();
      return;
    }

    this.savingPayment.set(true);
    const raw = this.payForm.getRawValue();

    const payload = {
      amount: Number(raw.amount), 
      paidDate: new Date(raw.paidDate).toISOString(),
    };

    this.service.payInstallment(installmentId, payload).subscribe({
      next: () => {
        this.feedback.success('Baixa realizada com sucesso!');
        this.savingPayment.set(false);
        this.payingInstallmentId.set(null);
        this.hasChanges.set(true);
        this.loadTransactionDetails(); // Recarrega os dados atualizados
      },
      error: (err) => {
        this.savingPayment.set(false);
        this.feedback.error(err?.error?.message || 'Erro ao dar baixa na parcela.');
      }
    });
  }

  close() {
    // Retorna true se houveram baixas, para a tela de trás atualizar a listagem
    this.dialogRef.close(this.hasChanges());
  }
}