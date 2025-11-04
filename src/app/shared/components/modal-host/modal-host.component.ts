import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ModalHostService, MODAL_DATA, MODAL_REF, ModalOpenRequest } from './modal-host.service';

@Component({
  standalone: true,
  selector: 'app-modal-host',
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/40" (click)="close()" aria-hidden="true"></div>
      <div
        class="bg-base-100 rounded-lg shadow-lg z-10 w-full max-w-3xl p-4"
        tabindex="-1"
        #dialog
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId || null"
        (keydown)="onKeydown($event)"
      >
        <header *ngIf="title" class="mb-3">
          <h2 id="{{ titleId }}" tabindex="-1" class="text-lg font-semibold">{{ title }}</h2>
        </header>
        <ng-container *ngComponentOutlet="component; injector: componentInjector"></ng-container>
      </div>
    </div>
  `,
})
export class ModalHostComponent implements OnInit, OnDestroy {
  private svc = inject(ModalHostService);
  private el = inject(ElementRef);

  open = false;
  component: any = null;
  componentInjector: any = null;
  private currentId: string | null = null;
  private previouslyFocused: HTMLElement | null = null;
  titleId: string | null = null;
  title: string | null = null;

  private sub: any;

  ngOnInit(): void {
    this.sub = this.svc.open$.subscribe((op: ModalOpenRequest | null) => {
      if (!op) return;
      this.component = op.component;
      this.currentId = op.id || null;
      this.title = op.title || null;
      this.titleId = this.title ? `modal-title-${this.currentId}` : null;
      // remember previously focused element so we can restore it after close
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      // create a child injector that provides MODAL_DATA when data is present
      if (op.data !== undefined) {
        // create a ModalRef proxy for this id so the injected component can close with a result
        const modalRef = {
          id: this.currentId!,
          afterClosed: this.svc.getPromise(this.currentId!),
          close: (result?: any) => this.svc.resolve(this.currentId!, result),
        };
        this.componentInjector = Injector.create({
          providers: [
            { provide: MODAL_DATA, useValue: op.data },
            { provide: MODAL_REF, useValue: modalRef },
          ],
          parent: inject(Injector),
        });
      } else {
        this.componentInjector = null;
      }
      this.open = true;
      // focus title (if present) or dialog after open
      setTimeout(() => {
        if (this.titleId) {
          const titleEl = this.el.nativeElement.querySelector(
            `#${this.titleId}`
          ) as HTMLElement | null;
          titleEl?.focus?.();
        } else {
          const dialog = this.el.nativeElement.querySelector(
            '[tabindex="-1"]'
          ) as HTMLElement | null;
          dialog?.focus?.();
        }
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe?.();
  }

  close() {
    this.open = false;
    this.component = null;
    this.componentInjector = null;
    // resolve the pending ModalRef promise if present
    if (this.currentId) {
      this.svc.resolve(this.currentId);
    }
    this.currentId = null;
    this.svc.closed();
    // restore focus to previously focused element
    setTimeout(() => this.previouslyFocused?.focus?.(), 0);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydown(event?: Event) {
    if (!this.open) return;
    const ke = event as KeyboardEvent | undefined;
    ke?.preventDefault();
    // handle Escape separately via HostListener, but also allow programmatic handling
    if (ke && ke.key === 'Escape') {
      this.close();
      return;
    }

    // focus trap: if Tab pressed, keep focus inside dialog
    if (ke && ke.key === 'Tab') {
      const dialog = this.el.nativeElement.querySelector('[tabindex="-1"]') as HTMLElement | null;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];
      if (focusable.length === 0) return;
      const idx = focusable.indexOf(document.activeElement as HTMLElement);
      if (ke.shiftKey) {
        const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
        prev?.focus();
      } else {
        const next = focusable[(idx + 1) % focusable.length];
        next?.focus();
      }
      ke.preventDefault();
    }
  }
}
