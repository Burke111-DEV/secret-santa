import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistGeneratorComponent } from './wishlist-generator.component';

describe('WishlistGeneratorComponent', () => {
  let component: WishlistGeneratorComponent;
  let fixture: ComponentFixture<WishlistGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WishlistGeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WishlistGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
