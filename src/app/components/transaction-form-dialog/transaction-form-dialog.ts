import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { LucideAngularModule } from 'lucide-angular';
import { TransactionsService } from '../../services/transactions.service';
import { ClientsService } from '../../services/clients.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { Client } from '../../models/client.model';
import { CreateTransactionDto } from '../../models/transaction.model';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';



@Component({
  selector: 'app-transaction-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, NgxMaskDirective, LucideAngularModule , MatSelectModule, MatButtonModule, FormsModule ,MatDatepickerModule , MatInputModule, MatFormFieldModule ],
  templateUrl: './transaction-form-dialog.html',
  styleUrl: './transaction-form-dialog.scss',
})
export class TransactionFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionsService = inject(TransactionsService);
  private clientsService = inject(ClientsService);
  private feedback = inject(UiFeedbackService);
  private dialogRef = inject(MatDialogRef<TransactionFormDialogComponent>);

  saving = signal(false);
  clients = signal<Client[]>([]);

  form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    totalValue: ['', Validators.required],
    clientId: [''],
    paymentMethod: ['CASH' as 'CASH' | 'INSTALLMENT', Validators.required],
    installmentsQty: [1, [Validators.required, Validators.min(1)]],
    firstDueDate: [new Date().toISOString().substring(0, 10), Validators.required],
    intervalDays: [30]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { type: 'INCOME' | 'EXPENSE' }) {}

  ngOnInit() {
    this.clientsService.list({ perPage: 100, active: true }).subscribe(res => {
      this.clients.set(res.data);
    });

    this.form.controls.paymentMethod.valueChanges.subscribe(method => {
      const qtyCtrl = this.form.controls.installmentsQty;
      const intervalCtrl = this.form.controls.intervalDays;

      if (method === 'CASH') {
        qtyCtrl.setValue(1);
        qtyCtrl.disable();
        intervalCtrl.disable();
      } else {
        qtyCtrl.enable();
        intervalCtrl.enable();
        if (qtyCtrl.value < 2) qtyCtrl.setValue(2);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const payload: CreateTransactionDto = {
      type: this.data.type,
      description: raw.description,
      totalValue: Number(raw.totalValue),
      clientId: raw.clientId || undefined,
      paymentMethod: raw.paymentMethod,
      installmentsQty: raw.installmentsQty,
      dueDate: new Date(raw.firstDueDate).toISOString(),
      intervalDays: raw.intervalDays
    };

    this.transactionsService.create(payload).subscribe({
      next: (tx) => {
        this.saving.set(false);
        this.dialogRef.close(tx);
      },
      error: (err) => {
        this.saving.set(false);
        this.feedback.error(err?.error?.message || 'Erro ao salvar movimentação.');
      }
    });
  }
}