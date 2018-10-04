import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Status } from 'yti-common-ui/entities/status';

@Component({
  selector: 'app-proposedstatus-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label translate>Proposed status</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <app-status *ngIf="!editing && status !== 'NOSTATUS'" [status]="status"></app-status>
        <span *ngIf="!editing && status === 'NOSTATUS'">-</span>

        <app-proposedstatus-dropdown *ngIf="editing"
                                     id="proposedstatus_input_dropdown"
                                     [formControl]="control"></app-proposedstatus-dropdown>

        <app-error-messages id="proposedstatus_input_error_messages" [control]="parentControl"></app-error-messages>
      </dd>
    </dl>
  `
})
export class ProposedStatusInputComponent implements ControlValueAccessor {

  @Input() required = false;
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

  get status() {
    return this.control.value as Status;
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing;
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
