import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientsService } from '../../services/clients.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { Client } from '../../models/client.model';
import { ClientFormDialogComponent } from '../../components/client-form-dialog/client-form-dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.scss',
})
export class ClientsListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private feedback = inject(UiFeedbackService);
  private confirmDialog = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);

  clients = signal<Client[]>([]);
  loading = signal(false);
  total = signal(0);
  page = signal(1);
  perPage = signal(20);
  activeFilter = signal<'active' | 'inactive' | 'all'>('active');

  searchControl = new FormControl('');

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.perPage())));

  ngOnInit() {
    this.loadClients();

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadClients();
      });
  }

  loadClients() {
    this.loading.set(true);

    const activeParam =
      this.activeFilter() === 'all' ? undefined : this.activeFilter() === 'active';

    this.clientsService
      .list({
        page: this.page(),
        perPage: this.perPage(),
        search: this.searchControl.value || undefined,
        active: activeParam,
      })
      .subscribe({
        next: (res) => {
          this.clients.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onFilterChange(value: 'active' | 'inactive' | 'all') {
    this.activeFilter.set(value);
    this.page.set(1);
    this.loadClients();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadClients();
  }

  openCreateDialog() {
    const ref = this.dialog.open(ClientFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      data: null,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.feedback.success('Cliente cadastrado com sucesso.');
        this.loadClients();
      }
    });
  }

  openEditDialog(client: Client) {
    const ref = this.dialog.open(ClientFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      data: client,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.feedback.success('Cliente atualizado com sucesso.');
        this.loadClients();
      }
    });
  }

  deactivate(client: Client) {
    this.confirmDialog
      .confirm({
        title: 'Inativar cliente',
        message: `Tem certeza que deseja inativar <strong>${client.name}</strong>? O histórico dele é mantido, mas ele deixa de aparecer nas listagens padrão.`,
        confirmText: 'Inativar',
        isDanger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.clientsService.delete(client.id).subscribe({
          next: () => {
            this.feedback.success('Cliente inativado com sucesso.');
            this.loadClients();
          },
          error: (err) => this.feedback.error(err?.error?.message || 'Erro ao inativar cliente.'),
        });
      });
  }

  formatDocument(document: string | null | undefined): string {
    if (!document) return '—'; // Retorna um traço se estiver vazio/nulo
    
    if (document.length === 11) {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (document.length === 14) {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return document;
  }
}