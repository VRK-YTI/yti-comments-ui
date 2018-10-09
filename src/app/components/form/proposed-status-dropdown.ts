import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Placement as NgbPlacement } from '@ng-bootstrap/ng-bootstrap';
import { Status } from 'yti-common-ui/entities/status';
import { EditableService } from '../../services/editable.service';
import { ProposedStatus, selectableProposedStatuses } from '../../entity/proposed-status';

export type Placement = NgbPlacement;

@Component({
  selector: 'app-proposed-status-table-dropdown',
  template: `
    <div *ngIf="editing" ngbDropdown [placement]="placement">
      <button [id]="'selected_' + id" class="btn btn-dropdown" ngbDropdownToggle>
        <span>{{ status | translate }}</span>
      </button>

      <div ngbDropdownMenu>
        <button *ngFor="let option of options"
                [id]="option + '_' + id"
                (click)="select(option)"
                class="dropdown-item"
                [class.active]="isSelected(option)">
          {{option | translate}}
        </button>
      </div>
    </div>
    <div *ngIf="!editing">
      <span translate>{{ status }}</span>
    </div>
  `
})
export class ProposedStatusTableDropdownComponent implements ControlValueAccessor {

  @Input() id: string;
  @Input() placement: Placement = 'bottom-left';
  @Input() status: ProposedStatus;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(private editableService: EditableService) {
  }

  get options(): ProposedStatus[] {
    return selectableProposedStatuses;
  }

  get editing() {
    return this.editableService.editing;
  }

  isSelected(option: Status) {
    return this.status === option;
  }

  select(option: Status) {
    this.status = option;
    this.propagateChange(option);
  }

  writeValue(obj: any): void {
    this.status = obj;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
