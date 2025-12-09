import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  AfterContentInit,
  inject,
} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DataTableCellDirective } from './data-table-cell.directive';

export type DataColumn = { key: string; label: string };

@Component({
  standalone: true,
  selector: 'app-data-table',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() searchControl?: FormControl<string> | null = null;
  @Input() items: any[] = [];
  @Input() columns: DataColumn[] = [];
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() viewLinkKey?: string | null = null;
  @Input() newLabel?: string | null = null;

  @Output() create = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() toggleActive = new EventEmitter<any>();

  @ContentChildren(DataTableCellDirective) cellTemplates!: QueryList<DataTableCellDirective>;
  private templateMap = new Map<string, any>();

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  onView(item: any) {
    this.view.emit(item);
    if (!this.viewLinkKey) return;
    const seg = item?.[this.viewLinkKey as string] ?? item;
    if (seg === undefined || seg === null) return;
    this.router.navigate([seg], { relativeTo: this.route }).catch(() => {});
  }

  ngAfterContentInit(): void {
    this.templateMap.clear();
    this.cellTemplates.forEach((t) => {
      if (t.key) this.templateMap.set(t.key, t.template);
    });
  }

  getTemplate(key: string) {
    return this.templateMap.get(key) as any | undefined;
  }
}
