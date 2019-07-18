import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Placement as NgbPlacement } from '@ng-bootstrap/ng-bootstrap';
import { ProposedStatus, selectableProposedStatuses } from '../../entity/proposed-status';
import { EditableService } from '../../services/editable.service';

export type Placement = NgbPlacement;

@Component({
  selector: 'app-proposed-status-table-dropdown',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProposedStatusTableDropdownComponent),
    multi: true
  }],
  template: `
    <div *ngIf="editing" ngbDropdown [placement]="placement">
      <button [id]="'selected_proposed_status_' + id" class="btn btn-dropdown" ngbDropdownToggle>
        <span translate>{{ selectedStatus }}</span>
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
      <span *ngIf="selectedStatus === 'NOSTATUS'">-</span>
      <app-status *ngIf="selectedStatus !== 'NOSTATUS'" class="status" [status]="selectedStatus"></app-status>
    </div>
  `
})
export class ProposedStatusTableDropdownComponent implements ControlValueAccessor {

  @Input() id: string;
  @Input() placement: Placement = 'bottom-left';
  @Input() isEditing: boolean | null;
  @Input() restrict = false;
  @Input() defaultStatus: ProposedStatus;

  selectedStatus: ProposedStatus;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(private editableService: EditableService) {
  }

  get editing() {

    return (this.editableService.editing || this.isEditing) && !this.restrict;
  }

  get options(): ProposedStatus[] {

    return selectableProposedStatuses;
  }

  isSelected(option: ProposedStatus) {

    if (this.selectedStatus == null || this.selectedStatus === 'NOSTATUS') {
      this.selectedStatus = this.defaultStatus;
      this.propagateChange(this.selectedStatus);
    }
    return this.selectedStatus === option;
  }

  select(option: ProposedStatus) {

    this.selectedStatus = option;
    this.propagateChange(option);
  }

  writeValue(obj: any): void {

    this.selectedStatus = obj;
  }

  registerOnChange(fn: any): void {

    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {

    this.propagateTouched = fn;
  }
}
