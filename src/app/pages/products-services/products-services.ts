import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductsServicesService } from '../../services/products-services.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ProductService } from '../../models/product-service.model';
import { ProductServiceFormDialogComponent } from '../../components/product-service-form-dialog/product-service-form-dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-products-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './products-services.html',
  styleUrl: './products-services.scss',
})
export class ProductsServicesListComponent implements OnInit {
  private service = inject(ProductsServicesService);
  private feedback = inject(UiFeedbackService);
  private confirmDialog = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);

  items = signal<ProductService[]>([]);
  loading = signal(false);
  total = signal(0);
  page = signal(1);
  perPage = signal(20);
  
  activeFilter = signal<'active' | 'inactive' | 'all'>('active');
  typeFilter = signal<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');
  searchControl = new FormControl('');

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.perPage())));

  ngOnInit() {
    this.loadItems();

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadItems();
      });
  }

  loadItems() {
    this.loading.set(true);

    const activeParam = this.activeFilter() === 'all' ? undefined : this.activeFilter() === 'active';
   const currentType = this.typeFilter();
    const typeParam = currentType === 'ALL' ? undefined : currentType;

    this.service
      .list({
        page: this.page(),
        perPage: this.perPage(),
        search: this.searchControl.value || undefined,
        active: activeParam,
        type: typeParam,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onActiveFilterChange(value: 'active' | 'inactive' | 'all') {
    this.activeFilter.set(value);
    this.page.set(1);
    this.loadItems();
  }

  onTypeFilterChange(value: 'ALL' | 'PRODUCT' | 'SERVICE') {
    this.typeFilter.set(value);
    this.page.set(1);
    this.loadItems();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadItems();
  }

  openCreateDialog() {
    const ref = this.dialog.open(ProductServiceFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      data: null,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.feedback.success('Item cadastrado com sucesso no catálogo.');
        this.loadItems();
      }
    });
  }

  openEditDialog(item: ProductService) {
    const ref = this.dialog.open(ProductServiceFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
      data: item,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.feedback.success('Item atualizado com sucesso.');
        this.loadItems();
      }
    });
  }

  deactivate(item: ProductService) {
    const isProduct = item.type === 'PRODUCT';
    this.confirmDialog
      .confirm({
        title: `Inativar ${isProduct ? 'Produto' : 'Serviço'}`,
        message: `Tem certeza que deseja inativar <strong>${item.name}</strong>? Ele não poderá mais ser vinculado a novos contratos.`,
        confirmText: 'Inativar',
        isDanger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.service.delete(item.id).subscribe({
          next: () => {
            this.feedback.success('Item inativado com sucesso.');
            this.loadItems();
          },
          error: (err) => this.feedback.error(err?.error?.message || 'Erro ao inativar item.'),
        });
      });
  }
}