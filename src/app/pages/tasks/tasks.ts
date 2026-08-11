import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card'; // Importante para o calendário "inline"
import { provideNativeDateAdapter } from '@angular/material/core';

import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';
import { TaskFormDialogComponent } from '../../components/task-form-dialog/task-form-dialog';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule,
    MatDatepickerModule,
    MatCardModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksListComponent implements OnInit {
  private service = inject(TasksService);
  private dialog = inject(MatDialog);

  tasks = signal<Task[]>([]);
  loading = signal(false);

  // Data selecionada no calendário (por padrão, hoje)
  selectedDate = signal<Date | null>(new Date());

  // Computed signal que filtra as tarefas apenas para a data selecionada
  filteredTasks = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return this.tasks();

    return this.tasks().filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === selected.toDateString();
    });
  });

  ngOnInit() { this.loadTasks(); }

  loadTasks() {
    this.loading.set(true);
    // Idealmente, se a base crescer muito, você buscaria apenas do mês/dia, 
    // mas aqui buscamos tudo e filtramos no frontend para ser mais responsivo à navegação do calendário
    this.service.list({ perPage: 100 }).subscribe(res => {
      this.tasks.set(res.data);
      console.log('Tarefas carregadas:', res.data);
      this.loading.set(false);
    });
  }

  onDateSelected(date: Date | null) {
    this.selectedDate.set(date);
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas o dia
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  }

  toggleDone(task: Task) {
    const newStatus = task.status === 'DONE' ? 'PENDING' : 'DONE';
    this.service.updateStatus(task.id, { status: newStatus }).subscribe(() => this.loadTasks());
  }

  openCreateDialog() {
    this.dialog.open(TaskFormDialogComponent, { width: '500px', panelClass: 'n8-dialog-panel' })
      .afterClosed().subscribe(res => res && this.loadTasks());
  }
}