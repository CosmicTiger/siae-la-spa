import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnioLectivoListComponent } from './list/anio-lectivo-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AnioLectivoListComponent }]),
    DragDropModule,
  ],
})
export class AnioLectivoModule {}
