import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-localizable-textarea',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd>
        <div class="text-content-wrap" *ngIf="!editing">{{control.value | translateValue}}</div>
      </dd>
    </dl>
  `
})
export class LocalizableTextareaComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() id: string;
  @Input() infoText: string;

  control = new FormControl({});

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get valid() {
    return !this.parentControl || this.parentControl.valid;
  }

  get show() {
    return this.control.value;
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
