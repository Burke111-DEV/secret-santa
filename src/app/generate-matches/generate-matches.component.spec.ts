import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateMatchesComponent } from './generate-matches.component';

describe('GenerateMatchesComponent', () => {
  let component: GenerateMatchesComponent;
  let fixture: ComponentFixture<GenerateMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateMatchesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
