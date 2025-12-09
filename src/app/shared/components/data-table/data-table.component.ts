import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataTableCellDirective } from './data-table-cell.directive';

export type DataColumn = { key: string; label: string };

@Component({
  standalone: true,
  selector: 'app-data-table',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() searchControl?: FormControl<string> | null = null;
  // Per-column filters and general search are managed internally when `searchControl` isn't provided
  @Input() enableFilters = true;
  search = '';
  filters: Record<string, string> = {};
  /** Placeholder text for the search input (customizable at use site) */
  @Input() searchPlaceholder = 'Buscar';
  /** Show or hide the search control entirely */
  @Input() showSearch = true;
  // controls for filter UI
  showFilters = false;
  // sorting state
  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' | null = null;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns'] && this.columns) {
      // initialize filters for columns
      this.columns.forEach((c) => {
        if (!(c.key in this.filters)) this.filters[c.key] = '';
      });
    }
    if (changes['items']) {
      // when items change, apply filters if any
      this.applyFilters();
    }
  }

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
    // ensure filters keys exist for columns available at init
    this.columns.forEach((c) => {
      if (!(c.key in this.filters)) this.filters[c.key] = '';
    });
    // initialize filtered view
    this.applyFilters();
  }

  // filtered view
  displayItems: any[] = [];

  private applyFilters() {
    const s =
      (this.searchControl?.value ?? this.search ?? '')?.toString().toLowerCase().trim() ?? '';
    this.displayItems = (this.items || []).filter((r) => {
      // per-column filters
      if (this.enableFilters) {
        for (const k of Object.keys(this.filters)) {
          const fv = (this.filters[k] || '').toString().toLowerCase().trim();
          if (!fv) continue;
          const rv = (r?.[k] ?? '') + '';
          if (!rv.toLowerCase().includes(fv)) return false;
        }
      }
      // global search across visible columns
      if (s) {
        const found = (this.columns || Object.keys(r || {})).some((c: any) => {
          const key = (typeof c === 'string' ? c : c.key) as string;
          const v = (r?.[key] ?? '') + '';
          return v.toLowerCase().includes(s);
        });
        if (!found) return false;
      }
      return true;
    });
    // apply sorting if set
    if (this.sortKey) {
      const k = this.sortKey;
      const dir = this.sortDir === 'desc' ? -1 : 1;
      this.displayItems.sort((a: any, b: any) => {
        const va = (a?.[k] ?? '') + '';
        const vb = (b?.[k] ?? '') + '';
        // try numeric compare
        const na = parseFloat(va.replace(/,/g, '.'));
        const nb = parseFloat(vb.replace(/,/g, '.'));
        if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir;
        return va.localeCompare(vb) * dir;
      });
    }
  }

  // called from template when a filter input changes
  onFilterChange(key: string, v: string) {
    this.filters[key] = v || '';
    this.applyFilters();
  }

  onSearchInput(v: string) {
    this.search = v || '';
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleSort(key: string) {
    if (this.sortKey !== key) {
      this.sortKey = key;
      this.sortDir = 'asc';
    } else {
      if (this.sortDir === 'asc') this.sortDir = 'desc';
      else if (this.sortDir === 'desc') {
        this.sortKey = null;
        this.sortDir = null;
      } else this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  resetFiltersAndSort() {
    this.search = '';
    Object.keys(this.filters).forEach((k) => (this.filters[k] = ''));
    this.sortKey = null;
    this.sortDir = null;
    this.applyFilters();
  }

  getTemplate(key: string) {
    return this.templateMap.get(key) as any | undefined;
  }
}
