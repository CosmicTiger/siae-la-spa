import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatriculasService } from './matriculas.service';
import { environment } from '../../../../environments/environment';

describe('MatriculasService', () => {
  let service: MatriculasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MatriculasService],
    });
    service = TestBed.inject(MatriculasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should post create to /api/matriculas', () => {
    const payload = { alumnoId: 1, nivelDetalleId: 2, periodoId: 3 } as any;
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${environment.apiBase}/api/matriculas`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok', data: null });
  });
});
