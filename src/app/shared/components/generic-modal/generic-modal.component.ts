import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output, Optional } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MODAL_DATA, MODAL_REF } from '@app/shared/components/modal-host/modal-host.service';

export type FieldDef = {
  key: string; // dot notation allowed, e.g. 'persona.nombres'
  label: string;
  // optional field type to allow template-aware formatting (e.g. 'date')
  type?: 'string' | 'date' | 'boolean' | 'number';
  // optional formatter function (when passed programmatically)
  formatter?: (v: any) => string;
  // optional predicate to determine visibility (can be boolean-check function)
  visibleWhen?: ((data: any) => boolean) | undefined;
  // optional children for nested/grouped fields. Children keys are relative to the parent key.
  children?: FieldDef[];
  // if true the group can be collapsed by the user
  collapsible?: boolean;
  // whether the group starts collapsed
  collapsedByDefault?: boolean;
  // message to show when the parent value is null/undefined
  noDataText?: string;
};

@Component({
  standalone: true,
  selector: 'app-generic-modal',
  imports: [CommonModule, RouterModule],
  templateUrl: './generic-modal.component.html',
})
export class GenericModalComponent {
  // when used programmatically as a component in templates
  @Input() schema: FieldDef[] | null = null;
  @Input() data: any = null;
  @Input() title: string | null = null;
  @Output() closed = new EventEmitter<any>();

  // when rendered via ModalHost, MODAL_DATA will be provided
  constructor(
    @Optional() @Inject(MODAL_DATA) private modalData?: any,
    @Optional() @Inject(MODAL_REF) private modalRef?: any
  ) {
    // prefer modal-provided values
    if (this.modalData) {
      if (this.modalData.schema) this.schema = this.modalData.schema;
      if (this.modalData.data) this.data = this.modalData.data;
      if (this.modalData.title) this.title = this.modalData.title;
    }
    this.initCollapsedState();
  }

  private _collapsed: Record<string, boolean> = {};

  private initCollapsedState() {
    if (!this.schema) return;
    for (const f of this.schema) {
      if (f.collapsible) {
        this._collapsed[f.key] = !!f.collapsedByDefault;
      }
    }
  }

  toggleCollapsed(key: string) {
    this._collapsed[key] = !this._collapsed[key];
  }

  isCollapsed(key: string) {
    return !!this._collapsed[key];
  }

  getValue(key: string) {
    if (!this.data) return undefined;
    const parts = key.split('.');
    let cur: any = this.data;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  fmt(field: FieldDef) {
    const v = this.getValue(field.key);
    if (field.formatter) return field.formatter(v);
    if (v === null || v === undefined || v === '') return '—';
    // simple default formatting for dates
    if (typeof v === 'string' && /T\d{2}:\d{2}:\d{2}/.test(v)) {
      try {
        return new Date(v).toLocaleString();
      } catch (e) {}
    }
    return String(v);
  }

  fmtChild(parentKey: string, field: FieldDef) {
    const merged: FieldDef = { ...field, key: `${parentKey}.${field.key}` };
    return this.fmt(merged);
  }

  isVisible(field: FieldDef) {
    if (!field.visibleWhen) return true;
    try {
      return field.visibleWhen(this.data);
    } catch (e) {
      return true;
    }
  }

  close(result?: any) {
    // prefer modalRef if provided by host
    if (this.modalRef && this.modalRef.close) {
      this.modalRef.close(result);
      return;
    }
    // otherwise emit out so parent templates can handle
    this.closed.emit(result);
  }
}
