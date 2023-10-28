import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarYesnoComponent } from './snackbar-yesno.component';

describe('SnackbarYesnoComponent', () => {
  let component: SnackbarYesnoComponent;
  let fixture: ComponentFixture<SnackbarYesnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackbarYesnoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnackbarYesnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
