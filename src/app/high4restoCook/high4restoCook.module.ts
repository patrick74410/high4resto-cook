import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { High4RestoCookComponent } from './high4RestoCook.component.';
import { MaterialModule } from '../shared/material/material.module';

@NgModule({
  declarations: [High4RestoCookComponent],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class High4RestoCookModule { }
