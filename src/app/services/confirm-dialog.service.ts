import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog';


export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'n8-dialog-panel',
    });

    return ref.afterClosed().pipe(map((result) => !!result));
  }
}