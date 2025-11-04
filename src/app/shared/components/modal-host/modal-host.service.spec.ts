import { TestBed } from '@angular/core/testing';
import { ModalHostService } from './modal-host.service';

describe('ModalHostService', () => {
  let service: ModalHostService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ModalHostService] });
    service = TestBed.inject(ModalHostService);
  });

  it('open returns a ModalRef and afterClosed resolves when resolved', async () => {
    const ref = service.open({ component: {} as any });
    let resolved = false;
    ref.afterClosed.then((v) => {
      resolved = true;
      expect(v).toEqual('ok');
    });

    // simulate host resolving
    service.resolve(ref.id, 'ok');

    await ref.afterClosed;
    expect(resolved).toBeTrue();
  });
});
