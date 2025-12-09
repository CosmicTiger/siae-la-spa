import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[dtCell]',
})
export class DataTableCellDirective {
  @Input('dtCell') key!: string;
  constructor(public template: TemplateRef<any>) {}
}
