import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { LucideAngularModule } from 'lucide-angular';

import {
  Client,
  ClientDetails,
} from '../../models/client.model';

import { ClientsService } from '../../services/clients.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';

import {
  ClientFormDialogComponent
} from '../../components/client-form-dialog/client-form-dialog';


type ClientDetailsTab =
  | 'PURCHASES'
  | 'FINANCIAL'
  | 'TASKS';


@Component({
  selector: 'app-client-details',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    MatDialogModule,
  ],

  templateUrl: './client-details.html',
  styleUrl: './client-details.scss',
})
export class ClientDetailsComponent
  implements OnInit {

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private clientsService =
    inject(ClientsService);

  private feedback =
    inject(UiFeedbackService);

  private dialog =
    inject(MatDialog);


  loading =
    signal(true);

  details =
    signal<ClientDetails | null>(
      null
    );

  activeTab =
    signal<ClientDetailsTab>(
      'PURCHASES'
    );


  client =
    computed(
      () =>
        this.details()?.client ??
        null
    );


  summary =
    computed(
      () =>
        this.details()?.summary ??
        null
    );


  ngOnInit() {
    const id =
      this.route.snapshot.paramMap.get(
        'id'
      );

    if (!id) {
      this.feedback.error(
        'Cliente inválido.'
      );

      this.router.navigate([
        '/clientes'
      ]);

      return;
    }

    this.loadClient(id);
  }


  // =====================================================
  // CARREGAMENTO
  // =====================================================

  loadClient(id?: string) {

    const clientId =
      id ??
      this.route.snapshot.paramMap.get(
        'id'
      );

    if (!clientId) {
      return;
    }

    this.loading.set(true);

    this.clientsService
      .getDetails(clientId)
      .subscribe({

        next: (res) => {

          this.details.set(
            res
          );

          this.loading.set(
            false
          );
        },

        error: (err) => {

          this.loading.set(
            false
          );

          this.feedback.error(
            err?.error?.message ||
            'Erro ao carregar cliente.'
          );

          this.router.navigate([
            '/clientes'
          ]);
        }

      });
  }


  // =====================================================
  // TABS
  // =====================================================

  setTab(
    tab: ClientDetailsTab
  ) {
    this.activeTab.set(tab);
  }


  // =====================================================
  // EDITAR CLIENTE
  // =====================================================

  openEditDialog() {

    const client =
      this.client();

    if (!client) {
      return;
    }

    const ref =
      this.dialog.open(
        ClientFormDialogComponent,
        {
          width:
            '520px',

          maxWidth:
            '95vw',

          panelClass:
            'n8-dialog-panel',

          data:
            client,
        }
      );

    ref
      .afterClosed()
      .subscribe(
        (result) => {

          if (!result) {
            return;
          }

          this.feedback.success(
            'Cliente atualizado com sucesso.'
          );

          this.loadClient(
            client.id
          );
        }
      );
  }


  // =====================================================
  // FORMATADORES
  // =====================================================

  formatDocument(
    document:
      string |
      null |
      undefined
  ): string {

    if (!document) {
      return 'Não informado';
    }

    const digits =
      document.replace(
        /\D/g,
        ''
      );

    if (
      digits.length === 11
    ) {

      return digits.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );
    }

    if (
      digits.length === 14
    ) {

      return digits.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return document;
  }


  formatPhone(
    phone:
      string |
      null |
      undefined
  ): string {

    if (!phone) {
      return 'Não informado';
    }

    const digits =
      phone.replace(
        /\D/g,
        ''
      );

    if (
      digits.length === 11
    ) {

      return digits.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3'
      );
    }

    if (
      digits.length === 10
    ) {

      return digits.replace(
        /(\d{2})(\d{4})(\d{4})/,
        '($1) $2-$3'
      );
    }

    return phone;
  }
}