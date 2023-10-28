import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupGeneratorComponent } from './group-generator.component';

describe('GroupGeneratorComponent', () => {
  let component: GroupGeneratorComponent;
  let fixture: ComponentFixture<GroupGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupGeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
