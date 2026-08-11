import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractFormDialog } from './contract-form-dialog';

describe('ContractFormDialog', () => {
  let component: ContractFormDialog;
  let fixture: ComponentFixture<ContractFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
