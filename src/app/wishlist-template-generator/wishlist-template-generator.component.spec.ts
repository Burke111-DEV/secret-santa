import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistTemplateGeneratorComponent } from './wishlist-template-generator.component';

describe('WishlistTemplateGeneratorComponent', () => {
  let component: WishlistTemplateGeneratorComponent;
  let fixture: ComponentFixture<WishlistTemplateGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WishlistTemplateGeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WishlistTemplateGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
