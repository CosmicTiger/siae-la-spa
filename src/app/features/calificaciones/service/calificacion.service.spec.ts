import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CalificacionService } from './calificacion.service';

describe('CalificacionService', () => {
  let service: CalificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CalificacionService],
    });
    service = TestBed.inject(CalificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
