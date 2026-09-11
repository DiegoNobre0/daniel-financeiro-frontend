import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LucideAngularModule } from 'lucide-angular';
import { ContractsService } from '../../services/contracts.service';
import { ClientsService } from '../../services/clients.service';
import { ProductsServicesService } from '../../services/products-services.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { Client } from '../../models/client.model';
import { ProductService } from '../../models/product-service.model';
import { Contract, CreateContractDto, UpdateContractDto } from '../../models/contract.model';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMaskDirective } from 'ngx-mask';
import { provideNativeDateAdapter } from '@angular/material/core';



@Component({
  selector: 'app-contract-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, LucideAngularModule, MatSelectModule, MatButtonModule, FormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule],
  templateUrl: './contract-form-dialog.html',
  styleUrl: './contract-form-dialog.scss',
})
export class ContractFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contractsService = inject(ContractsService);
  private clientsService = inject(ClientsService);
  private productsService = inject(ProductsServicesService);
  private feedback = inject(UiFeedbackService);
  private dialogRef = inject(MatDialogRef<ContractFormDialogComponent>);

  saving = signal(false);
  loadingData = signal(true);

  // Listas para os dropdowns (carregadas no Init)
  clients = signal<Client[]>([]);
  products = signal<ProductService[]>([]);

  form = this.fb.nonNullable.group({
    clientId: ['', Validators.required],
    productServiceId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    paymentMethod: ['CASH' as 'CASH' | 'INSTALLMENT', Validators.required],
    installmentsQty: [1, [Validators.required, Validators.min(1)]],
    contractDate: [new Date().toISOString().substring(0, 10), Validators.required],
    notes: [''],

    generateTransaction: [false],
    firstDueDate: [''],
    intervalDays: [30]
  });

  ngOnInit() {
    this.loadDependencies();
    this.setupFormListeners();

    if (
      this.data?.contract
    ) {
      const contract =
        this.data.contract;

      this.form.patchValue({
        clientId:
          contract.clientId,

        productServiceId:
          contract.productServiceId,

        quantity:
          contract.quantity,

        paymentMethod:
          contract.paymentMethod,

        installmentsQty:
          contract.installmentsQty,

        contractDate:
          new Date(
            contract.contractDate
          )
            .toISOString()
            .substring(
              0,
              10
            ),
      });
    }
  }




  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      contract?: Contract;
    }
  ) { }

  get isEditing() {
    return !!this.data?.contract;
  }

  loadDependencies() {
    // Busca apenas clientes e produtos ativos para popular os selects
    // Nota: Em um sistema muito grande, idealmente usaríamos um select com autocomplete buscando da API
    this.loadingData.set(true);

    Promise.all([
      this.clientsService.list({ perPage: 100, active: true }).toPromise(),
      this.productsService.list({ perPage: 100, active: true }).toPromise()
    ]).then(([clientsRes, productsRes]) => {
      this.clients.set(clientsRes?.data || []);
      this.products.set(productsRes?.data || []);
      this.loadingData.set(false);
    }).catch(() => {
      this.feedback.error('Erro ao carregar dados auxiliares.');
      this.close();
    });
  }

  setupFormListeners() {
    // Usamos this.form.controls para garantir 100% de type-safety (TypeScript ama isso)
    this.form.controls.paymentMethod.valueChanges.subscribe(method => {
      const qtyControl = this.form.controls.installmentsQty;

      if (method === 'CASH') {
        qtyControl.setValue(1);
        qtyControl.disable();
      } else {
        qtyControl.enable();
        if (qtyControl.value < 2) {
          qtyControl.setValue(2);
        }
      }
    });

    // Torna a primeira parcela obrigatória se escolher gerar financeiro
    this.form.controls.generateTransaction.valueChanges.subscribe(generate => {
      const firstDueCtrl = this.form.controls.firstDueDate;
      if (generate) {
        firstDueCtrl.setValidators(Validators.required);
      } else {
        firstDueCtrl.clearValidators();
      }
      firstDueCtrl.updateValueAndValidity();
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

  const raw = this.form.getRawValue();

  // =====================================================
  // VALIDAÇÕES
  // =====================================================

  if (
    raw.paymentMethod === 'INSTALLMENT' &&
    raw.installmentsQty < 2
  ) {
    this.feedback.error(
      'Pagamento a prazo exige no mínimo 2 parcelas.'
    );
    return;
  }

  if (
    raw.paymentMethod === 'CASH' &&
    raw.installmentsQty !== 1
  ) {
    this.feedback.error(
      'Pagamento à vista deve possuir apenas 1 parcela.'
    );
    return;
  }

  this.saving.set(true);

  // =====================================================
  // DADOS COMUNS
  // =====================================================

  const commonPayload = {
    clientId: raw.clientId,

    productServiceId:
      raw.productServiceId,

    quantity:
      raw.quantity,

    paymentMethod:
      raw.paymentMethod,

    installmentsQty:
      raw.paymentMethod === 'CASH'
        ? 1
        : raw.installmentsQty,

    contractDate:
      new Date(
        raw.contractDate
      ).toISOString(),
  };

  // =====================================================
  // EDIÇÃO
  // =====================================================

  if (
    this.isEditing &&
    this.data.contract
  ) {
    const payload:
      UpdateContractDto = {
        ...commonPayload,
      };

    this.contractsService
      .update(
        this.data.contract.id,
        payload
      )
      .subscribe({
        next: (contract) => {
          this.saving.set(false);

          this.dialogRef.close(
            contract
          );
        },

        error: (err) => {
          this.saving.set(false);

          this.feedback.error(
            err?.error?.message ||
            'Erro ao atualizar venda.'
          );
        },
      });

    return;
  }

  // =====================================================
  // CRIAÇÃO
  // =====================================================

  const payload:
    CreateContractDto = {
      ...commonPayload,

      notes:
        raw.notes ||
        undefined,

      generateTransaction:
        raw.generateTransaction,

      firstDueDate:
        raw.generateTransaction &&
        raw.firstDueDate
          ? new Date(
              raw.firstDueDate
            ).toISOString()
          : undefined,

      intervalDays:
        raw.generateTransaction
          ? raw.intervalDays
          : undefined,
    };

  this.contractsService
    .create(payload)
    .subscribe({
      next: (contract) => {
        this.saving.set(false);

        this.dialogRef.close(
          contract
        );
      },

      error: (err) => {
        this.saving.set(false);

        this.feedback.error(
          err?.error?.message ||
          'Erro ao registrar venda.'
        );
      },
    });
}
}