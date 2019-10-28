import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Placement as NgbPlacement } from '@ng-bootstrap/ng-bootstrap';
import { allCommentRoundStatuses, CommentRoundStatus } from '../../entities/comment-round-status';

export type Placement = NgbPlacement;

@Component({
  selector: 'app-comment-round-status-dropdown',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CommentRoundStatusDropdownComponent),
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
          <span>{{ option | translate }}</span>
        </button>
      </div>
    </div>
  `
})
export class CommentRoundStatusDropdownComponent implements ControlValueAccessor {

  @Input() id: string;
  @Input() placement: Placement = 'bottom-left';
  @Input() restrict = false;

  selection: CommentRoundStatus;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  get options(): CommentRoundStatus[] {

    return allCommentRoundStatuses;
  }

  isSelected(option: CommentRoundStatus) {

    return this.selection === option;
  }

  select(option: CommentRoundStatus) {

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
