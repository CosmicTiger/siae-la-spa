import { Injectable, InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';

export const MODAL_DATA = new InjectionToken<any>('MODAL_DATA');

export interface ModalOpenRequest {
  component: any;
  data?: any;
  id?: string;
  title?: string;
}

export interface ModalRef {
  id: string;
  afterClosed: Promise<any>;
  close(result?: any): void;
}

export const MODAL_REF = new InjectionToken<ModalRef>('MODAL_REF');

@Injectable({ providedIn: 'root' })
export class ModalHostService {
  private openSubject = new Subject<ModalOpenRequest | null>();
  open$ = this.openSubject.asObservable();

  private pending = new Map<
    string,
    { resolve: (v?: any) => void; reject: (e?: any) => void; promise: Promise<any> }
  >();

  open(req: Omit<ModalOpenRequest, 'id'>): ModalRef {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const fullReq: ModalOpenRequest = { ...req, id };

    let resolve: (v?: any) => void = () => {};
    let reject: (e?: any) => void = () => {};
    const promise = new Promise<any>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.pending.set(id, { resolve, reject, promise });
    this.openSubject.next(fullReq);

    return {
      id,
      afterClosed: promise,
      close: (result?: any) => this.resolve(id, result),
    };
  }

  resolve(id: string, result?: any) {
    const p = this.pending.get(id);
    if (p) {
      p.resolve(result);
      this.pending.delete(id);
    }
  }

  getPromise(id: string) {
    return this.pending.get(id)?.promise;
  }

  reject(id: string, err?: any) {
    const p = this.pending.get(id);
    if (p) {
      p.reject(err);
      this.pending.delete(id);
    }
  }

  // legacy: signal close without value for consumers that used open$ directly
  closed() {
    this.openSubject.next(null);
  }
}
