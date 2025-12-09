import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurriculaComponent } from './curricula.component';

describe('CurriculaComponent', () => {
  let component: CurriculaComponent;
  let fixture: ComponentFixture<CurriculaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurriculaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurriculaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
