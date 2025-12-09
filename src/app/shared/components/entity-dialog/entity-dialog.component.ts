import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { Observable } from 'rxjs';

export type FieldType = 'text' | 'email' | 'password' | 'date' | 'select' | 'checkbox' | 'group';

export interface FieldDef {
  key: string;
  label?: string;
  type?: FieldType;
  options?: Array<{ value: any; label: string }>;
  validators?: any[];
  fields?: FieldDef[]; // for group
  // visibleWhen can be either a control key (string) or a predicate that receives the form
  visibleWhen?: string | ((form: FormGroup) => boolean);
}

@Component({
  standalone: true,
  selector: 'app-entity-dialog',
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './entity-dialog.component.html',
})
export class EntityDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() title: string | null = null;
  @Input() initial: any | null = null;
  @Input() schema: FieldDef[] = [];
  /**
   * submitFn: (initial, formValue) => Observable<any>
   * If not provided, the component will simply emit closed(true) without calling any service.
   */
  @Input() submitFn?: (initial: any, value: any) => Observable<any> | Promise<any> | null;
  @Input() onInit?: (form: FormGroup, initial: any) => void;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<boolean>();

  form!: FormGroup;
  loading = false;
  error = '';

  private fb = new FormBuilder();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schema']) {
      this.buildForm();
    }
    if (changes['open'] && this.open) {
      // ensure form is (re)built
      if (!this.form) this.buildForm();
      this.error = '';
      // patch initial values if any
      if (this.initial) {
        this.form.patchValue(this.initial, { emitEvent: false });
      } else {
        this.form.reset();
      }
      // run optional init hook
      if (this.onInit) this.onInit(this.form, this.initial);
    }
  }

  isVisible(f: FieldDef): boolean {
    if (!f.visibleWhen) return true;
    if (typeof f.visibleWhen === 'function') {
      try {
        return !!(f.visibleWhen as (form: FormGroup) => boolean)(this.form);
      } catch (e) {
        return false;
      }
    }
    return !!this.form.get(f.visibleWhen as string)?.value;
  }

  private buildForm() {
    const group: { [k: string]: any } = {};
    this.schema.forEach((f) => this.addField(group, f));
    this.form = this.fb.group(group);
  }

  private addField(group: { [k: string]: any }, f: FieldDef) {
    if (f.type === 'group' && f.fields) {
      const subgroup: { [k: string]: any } = {};
      f.fields.forEach((sf) => this.addField(subgroup, sf));
      group[f.key] = this.fb.group(subgroup);
    } else {
      const validators = f.validators || [];
      group[f.key] = new FormControl(null, validators);
    }
  }

  close(ok: boolean) {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit(ok);
  }

  submit() {
    if (!this.form) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';

    try {
      const val = this.form.value;
      const res = this.submitFn ? this.submitFn(this.initial, val) : null;
      if (!res) {
        // no submit function, assume success
        this.loading = false;
        this.close(true);
        return;
      }
      const obs = res as Observable<any> | Promise<any>;
      if ((obs as any).subscribe) {
        (obs as Observable<any>).subscribe({
          next: () => {
            this.loading = false;
            this.close(true);
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.error?.message || err?.message || 'Error en operación';
          },
        });
      } else {
        (obs as Promise<any>)
          .then(() => {
            this.loading = false;
            this.close(true);
          })
          .catch((err) => {
            this.loading = false;
            this.error = err?.error?.message || err?.message || 'Error en operación';
          });
      }
    } catch (e: any) {
      this.loading = false;
      this.error = e?.message || String(e);
    }
  }
}
