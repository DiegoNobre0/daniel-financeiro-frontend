import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { LucideAngularModule } from 'lucide-angular';
import { ProductsServicesService } from '../../services/products-services.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { CreateProductServiceDto, ProductService } from '../../models/product-service.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';



@Component({
  selector: 'app-product-service-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, NgxMaskDirective, LucideAngularModule , MatFormFieldModule,
    MatInputModule,
    MatSelectModule],
  templateUrl: './product-service-form-dialog.html',
  styleUrl: './product-service-form-dialog.scss',
})
export class ProductServiceFormDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(ProductsServicesService);
  private feedback = inject(UiFeedbackService);
  private dialogRef = inject(MatDialogRef<ProductServiceFormDialogComponent>);

  saving = signal(false);
  isEdit = false;

  form = this.fb.nonNullable.group({
    type: ['PRODUCT' as 'PRODUCT' | 'SERVICE', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    unit: [''],
    costPrice: [''], // Guardamos como string no form para o ngx-mask (separator.2)
    salePrice: ['', Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductService | null) {
    this.isEdit = !!data;
    
    if (data) {
      this.form.patchValue({
        type: data.type,
        name: data.name,
        description: data.description ?? '',
        unit: data.unit ?? '',
        costPrice: data.costPrice ? data.costPrice.toString() : '',
        salePrice: data.salePrice.toString(),
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

    const raw = this.form.getRawValue();
    
    // Tratamento para inputs de valor financeiro (se estiver usando ngx-mask separator.2 ele devolve numérico em string)
    const cost = raw.costPrice ? Number(raw.costPrice) : undefined;
    const sale = Number(raw.salePrice);

    if (cost !== undefined && cost > sale) {
      this.feedback.error('O preço de custo não pode ser maior que o preço de venda.');
      return;
    }

    this.saving.set(true);

    const payload: CreateProductServiceDto = {
      type: raw.type,
      name: raw.name,
      description: raw.description || undefined,
      unit: raw.unit || undefined,
      costPrice: cost,
      salePrice: sale,
    };

    const request$ = this.isEdit
      ? this.service.update(this.data!.id, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: (item) => {
        this.saving.set(false);
        this.dialogRef.close(item);
      },
      error: (err) => {
        this.saving.set(false);
        this.feedback.error(err?.error?.message || 'Erro ao salvar item.');
      },
    });
  }
}