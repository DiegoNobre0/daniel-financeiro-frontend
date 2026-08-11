import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionInstallmentsDialog } from './transaction-installments-dialog';

describe('TransactionInstallmentsDialog', () => {
  let component: TransactionInstallmentsDialog;
  let fixture: ComponentFixture<TransactionInstallmentsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionInstallmentsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionInstallmentsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
