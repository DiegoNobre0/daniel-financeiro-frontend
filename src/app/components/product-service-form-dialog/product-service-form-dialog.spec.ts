import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductServiceFormDialog } from './product-service-form-dialog';

describe('ProductServiceFormDialog', () => {
  let component: ProductServiceFormDialog;
  let fixture: ComponentFixture<ProductServiceFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductServiceFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductServiceFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
