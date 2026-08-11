import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { LucideAngularModule } from 'lucide-angular';
import { ClientsService } from '../../services/clients.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { Client } from '../../models/client.model';



@Component({
  selector: 'app-client-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, NgxMaskDirective, LucideAngularModule],
  templateUrl: './client-form-dialog.html',
  styleUrl: './client-form-dialog.scss',
})
export class ClientFormDialogComponent {
  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private feedback = inject(UiFeedbackService);
  private dialogRef = inject(MatDialogRef<ClientFormDialogComponent>);

  saving = signal(false);
  isEdit = false;

  form = this.fb.nonNullable.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  document: this.fb.nonNullable.control('', [Validators.pattern(/^\d{11}$|^\d{14}$/)]),
  email: [''],
  phone: [''],
  address: [''],
});

  constructor(@Inject(MAT_DIALOG_DATA) public data: Client | null) {
    this.isEdit = !!data;

    if (data) {
      this.form.patchValue({
        name: data.name,
        document: data.document,
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
      });
    }
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

    const payload = {
      name: raw.name,
      document: raw.document ? raw.document.replace(/\D/g, '') : undefined,
      email: raw.email || undefined,
      phone: raw.phone || undefined,
      address: raw.address || undefined,
    };

    

    const request$ = this.isEdit
      ? this.clientsService.update(this.data!.id, payload)
      : this.clientsService.create(payload);

    request$.subscribe({
      next: (client) => {
        this.saving.set(false);
        this.dialogRef.close(client);
      },
      error: (err) => {
        this.saving.set(false);
        this.feedback.error(err?.error?.message || 'Erro ao salvar cliente.');
      },
    });
  }
}