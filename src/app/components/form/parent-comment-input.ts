import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { CommentThread } from '../../entity/commentthread';
import { CommentSimple } from '../../entity/comment-simple';
import { SearchLinkedCommentModalService } from './search-linked-comment-modal.component';
import { CommentRound } from '../../entity/commentround';

function addToControl<T>(control: FormControl, item: T) {

  control.setValue(item);
}

function removeFromControl<T>(control: FormControl) {

  control.setValue(null);
}

@Component({
  selector: 'app-comment-input',
  template: `
    <dl *ngIf="editing || comment">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing && comment">
          <span>{{comment.content}}</span>
        </div>
        <div *ngIf="editing && comment">
          <a class="removal-X">
            <i id="remove_code_link"
               class="fa fa-times"
               (click)="removeComment(comment)"></i>
          </a>
          <span>{{comment.content}}</span>
        </div>

        <app-error-messages id="code_error_messages" [control]="parentControl"></app-error-messages>

        <button *ngIf="editing"
                id="add_code_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                (click)="selectComment()">
          <span translate>Select comment</span>
        </button>
      </dd>
    </dl>
  `
})
export class CommentInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() commentThread: CommentThread;
  @Input() commentRound: CommentRound;
  @Input() required = false;
  @Input() infoText: string;
  @Input() restricts: string[] = [];
  control = new FormControl(null);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedParentCommentModalService: SearchLinkedCommentModalService,
              public languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get comment() {
    return this.control.value as CommentSimple;
  }

  selectComment() {
    const titleLabel = this.translateService.instant('Select comment');
    const searchlabel = this.translateService.instant('Search comment');

    this.searchLinkedParentCommentModalService.openWithCommentRoundAndCommentThread(
      this.commentRound, this.commentThread, titleLabel, searchlabel, this.restricts, true)
      .then(comment => addToControl(this.control, comment), ignoreModalClose);
  }

  removeComment() {
    removeFromControl(this.control);
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
