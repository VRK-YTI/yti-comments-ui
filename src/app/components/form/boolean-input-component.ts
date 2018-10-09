import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-boolean-input',
  styleUrls: ['./boolean-input-component.scss'],
  template: `
    <dl>
      <dt>
        <div *ngIf="editing" class="checkbox">
          <input [id]="id"
                 type="checkbox"
                 [formControl]="control"/>
          <label for="id">{{ label }}</label>
          <app-information-symbol [infoText]="infoText"></app-information-symbol>
          <app-required-symbol *ngIf="required && editing"></app-required-symbol>
        </div>
        <div *ngIf="!editing" class="checkbox">
          <input [id]="id"
                 type="checkbox"
                 disabled
                 [checked]="control.value"/>
          <label [for]="id">{{ label }}</label>
          <app-information-symbol [infoText]="infoText"></app-information-symbol>
        </div>
      </dt>
    </dl>
  `
})
export class BooleanInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() id: string;
  @Input() infoText: string;

  control = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get editing() {

    return this.editableService.editing && !this.restrict;
  }

  writeValue(obj: any): void {

    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {

    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {

    this.propagateTouched = fn;
  }
}
