import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Placement as NgbPlacement } from '@ng-bootstrap/ng-bootstrap';
import { ProposedStatus, selectableProposedStatuses } from '../../entity/proposed-status';

export type Placement = NgbPlacement;

@Component({
  selector: 'app-proposedstatus-dropdown',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProposedStatusDropdownComponent),
    multi: true
  }],
  template: `
    <div ngbDropdown [placement]="placement">
      <button [id]="'selected_' + id" class="btn btn-dropdown" ngbDropdownToggle>
        <span>{{selection | translate}}</span>
      </button>

      <div ngbDropdownMenu>
        <button *ngFor="let option of options"
                [id]="option + '_' + id"
                (click)="select(option)"
                class="dropdown-item"
                [class.active]="isSelected(option)">
          <span translate>{{option}}</span>
        </button>
      </div>
    </div>
  `
})
export class ProposedStatusDropdownComponent implements ControlValueAccessor {

  @Input() id: string;
  @Input() placement: Placement = 'bottom-left';

  selection: ProposedStatus;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  get options(): ProposedStatus[] {
    return selectableProposedStatuses;
  }

  isSelected(option: ProposedStatus) {
    return this.selection === option;
  }

  select(option: ProposedStatus) {
    this.selection = option;
    this.propagateChange(option);
  }

  writeValue(obj: any): void {
    this.selection = obj;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
