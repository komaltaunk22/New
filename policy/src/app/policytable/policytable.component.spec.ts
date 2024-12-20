import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicytableComponent } from './policytable.component';

describe('PolicytableComponent', () => {
  let component: PolicytableComponent;
  let fixture: ComponentFixture<PolicytableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicytableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicytableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
