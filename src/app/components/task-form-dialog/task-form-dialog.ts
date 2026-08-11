import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LucideAngularModule } from 'lucide-angular';
import { TasksService } from '../../services/tasks.service';
import { ClientsService } from '../../services/clients.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { Client } from '../../models/client.model';
import { CreateTaskDto } from '../../models/task.model';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';


@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
    providers: [provideNativeDateAdapter()], // 👈 Essencial para o calendário funcionar
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    LucideAngularModule,
    // 👇 Adicionando os módulos do Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
})
export class TaskFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private clientsService = inject(ClientsService);
  private feedback = inject(UiFeedbackService);
  private dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);

  saving = signal(false);
  clients = signal<Client[]>([]);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    dueDate: [new Date().toISOString().substring(0, 10), Validators.required],
    priority: ['MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH', Validators.required],
    clientId: [''],
  });

  ngOnInit() {
    this.clientsService.list({ perPage: 100, active: true }).subscribe({
      next: (res) => this.clients.set(res.data),
      error: () => this.feedback.error('Erro ao carregar lista de clientes.'),
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

    const payload: CreateTaskDto = {
      title: raw.title,
      description: raw.description || undefined,
      dueDate: new Date(raw.dueDate).toISOString(),
      priority: raw.priority,
      clientId: raw.clientId || undefined,
    };

    this.tasksService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.feedback.error(err?.error?.message || 'Erro ao criar tarefa.');
      },
    });
  }
}