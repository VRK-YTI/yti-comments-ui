import { Component, Input, Optional, Self } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-literal-textarea',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <textarea [id]="id"
                    rows="3"
                    class="form-control"
                    [ngClass]="{'is-invalid': !valid}"
                    [formControl]="control"></textarea>
          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <div class="text-content-wrap" *ngIf="!editing">{{control.value}}</div>
      </dd>
    </dl>
  `
})
export class LiteralTextareaComponent implements ControlValueAccessor {

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

  get valid() {
    return !this.parentControl || this.parentControl.valid;
  }

  get show() {
    return this.editing || this.control.value;
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
