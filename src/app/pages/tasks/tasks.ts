import {
  Component,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import {
  MatCalendar,
  MatCalendarCellClassFunction,
  MatDatepickerModule
} from '@angular/material/datepicker';

import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';

import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';
import { TaskFormDialogComponent } from '../../components/task-form-dialog/task-form-dialog';


@Component({
  selector: 'app-tasks-list',
  standalone: true,

  providers: [
    provideNativeDateAdapter()
  ],

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

  @ViewChild(MatCalendar)
  calendar?: MatCalendar<Date>;

  tasks = signal<Task[]>([]);
  loading = signal(false);

  selectedDate =
    signal<Date | null>(
      new Date()
    );


  // =====================================================
  // TAREFAS DO DIA SELECIONADO
  // =====================================================

  filteredTasks = computed(() => {

    const selected =
      this.selectedDate();

    if (!selected) {
      return [];
    }

    const filtered =
      this.tasks()
        .filter((task) =>
          this.isSameDay(
            new Date(task.dueDate),
            selected
          )
        );

    // Atrasadas primeiro, depois prioridade
    return [...filtered].sort(
      (a, b) => {

        // Concluídas sempre por último
        if (
          a.status === 'DONE' &&
          b.status !== 'DONE'
        ) {
          return 1;
        }

        if (
          b.status === 'DONE' &&
          a.status !== 'DONE'
        ) {
          return -1;
        }

        // Atrasadas primeiro
        const aOverdue =
          this.isTaskOverdue(a);

        const bOverdue =
          this.isTaskOverdue(b);

        if (
          aOverdue &&
          !bOverdue
        ) {
          return -1;
        }

        if (
          !aOverdue &&
          bOverdue
        ) {
          return 1;
        }

        // Prioridade
        const priorityWeight = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1
        };

        return (
          priorityWeight[b.priority] -
          priorityWeight[a.priority]
        );
      }
    );
  });


  // =====================================================
  // RESUMOS
  // =====================================================

  overdueCount = computed(() =>
    this.tasks().filter(
      (task) =>
        task.status === 'PENDING' &&
        this.isOverdue(task.dueDate)
    ).length
  );


  pendingCount = computed(() =>
    this.tasks().filter(
      (task) =>
        task.status === 'PENDING'
    ).length
  );


  todayCount = computed(() => {

    const today =
      new Date();

    return this.tasks().filter(
      (task) =>
        this.isSameDay(
          new Date(task.dueDate),
          today
        ) &&
        task.status !== 'CANCELED'
    ).length;
  });


  ngOnInit() {
    this.loadTasks();
  }


  // =====================================================
  // CARREGAR
  // =====================================================

  loadTasks() {

    this.loading.set(true);

    this.service
      .list({
        perPage: 100
      })
      .subscribe({

        next: (res) => {

          this.tasks.set(
            res.data
          );

          this.loading.set(
            false
          );

          // força o calendário a redesenhar
          // as classes dos dias
          setTimeout(() => {
            this.calendar
              ?.updateTodaysDate();
          });
        },

        error: () => {
          this.loading.set(false);
        }

      });
  }


  // =====================================================
  // CLASSES VISUAIS DOS DIAS
  // =====================================================

  dateClass:
    MatCalendarCellClassFunction<Date> =
    (date, view) => {

      if (
        view !== 'month'
      ) {
        return '';
      }

      const dayTasks =
        this.tasks().filter(
          (task) =>
            this.isSameDay(
              new Date(task.dueDate),
              date
            ) &&
            task.status !== 'CANCELED'
        );

      if (
        dayTasks.length === 0
      ) {
        return '';
      }

      const hasOverdue =
        dayTasks.some(
          (task) =>
            task.status === 'PENDING' &&
            this.isOverdue(
              task.dueDate
            )
        );

      if (hasOverdue) {
        return 'calendar-day-overdue';
      }

      const allDone =
        dayTasks.every(
          (task) =>
            task.status === 'DONE'
        );

      if (allDone) {
        return 'calendar-day-done';
      }

      const hasPending =
        dayTasks.some(
          (task) =>
            task.status === 'PENDING'
        );

      if (hasPending) {
        return 'calendar-day-pending';
      }

      return 'calendar-day-task';
    };


  // =====================================================
  // DATA
  // =====================================================

  onDateSelected(
    date: Date | null
  ) {

    this.selectedDate.set(
      date
    );
  }


  goToToday() {

    const today =
      new Date();

    this.selectedDate.set(
      today
    );

    if (
      this.calendar
    ) {
      this.calendar.activeDate =
        today;

      this.calendar
        .updateTodaysDate();
    }
  }


  isTodaySelected(): boolean {

    const selected =
      this.selectedDate();

    if (!selected) {
      return false;
    }

    return this.isSameDay(
      selected,
      new Date()
    );
  }


  private isSameDay(
    dateA: Date,
    dateB: Date
  ): boolean {

    return (
      dateA.getFullYear() ===
        dateB.getFullYear() &&

      dateA.getMonth() ===
        dateB.getMonth() &&

      dateA.getDate() ===
        dateB.getDate()
    );
  }


  // =====================================================
  // ATRASO
  // =====================================================

  isOverdue(
    dueDate: string
  ): boolean {

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const taskDate =
      new Date(dueDate);

    taskDate.setHours(
      0,
      0,
      0,
      0
    );

    return (
      taskDate < today
    );
  }


  isTaskOverdue(
    task: Task
  ): boolean {

    return (
      task.status === 'PENDING' &&
      this.isOverdue(
        task.dueDate
      )
    );
  }


  // =====================================================
  // STATUS
  // =====================================================

  toggleDone(
    task: Task
  ) {

    const newStatus =
      task.status === 'DONE'
        ? 'PENDING'
        : 'DONE';

    this.service
      .updateStatus(
        task.id,
        {
          status: newStatus
        }
      )
      .subscribe(
        () =>
          this.loadTasks()
      );
  }


  // =====================================================
  // NOVA TAREFA
  // =====================================================

  openCreateDialog() {

    this.dialog
      .open(
        TaskFormDialogComponent,
        {
          width:
            '500px',

          maxWidth:
            '95vw',

          panelClass:
            'n8-dialog-panel'
        }
      )
      .afterClosed()
      .subscribe(
        (res) =>
          res &&
          this.loadTasks()
      );
  }
}