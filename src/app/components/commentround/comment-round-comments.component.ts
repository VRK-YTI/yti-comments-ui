import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { ConfigurationService } from '../../services/configuration.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { DataService } from '../../services/data.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommentRound } from '../../entity/commentround';
import { Moment } from 'moment';
import { formatDisplayDateTime } from '../../utils/date';
import { CommentThreadType, CommentType } from '../../services/api-schema';
import { CommentThreadSimple } from '../../entity/commentthread-simple';
import { Comment } from '../../entity/comment';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { CommentRoundErrorModalService } from '../common/error-modal.service';
import { comparingLocalizable, comparingPrimitive } from 'yti-common-ui/utils/comparator';
import { Localizable } from 'yti-common-ui/types/localization';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { CommentThread } from '../../entity/commentthread';

@Component({
  selector: 'app-comment-round-comments',
  templateUrl: './comment-round-comments.component.html',
  styleUrls: ['./comment-round-comments.component.scss'],
  providers: [EditableService]
})
export class CommentRoundCommentsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() commentRound: CommentRound;
  @Input() commentThreads: CommentThreadSimple[];
  @Input() myComments: Comment[];
  @Input() tabSet: NgbTabset;

  @Output() refreshCommentThreads = new EventEmitter();
  @Output() refreshMyComments = new EventEmitter();

  cancelSubscription: Subscription;

  commenting$ = new BehaviorSubject<boolean>(false);
  sortOption = 'alphabetical';

  commentThreadForm = new FormGroup({
    commentThreads: new FormArray([])
  }, null);

  constructor(public configurationService: ConfigurationService,
              public languageService: LanguageService,
              private authorizationManager: AuthorizationManager,
              private dataService: DataService,
              private editableService: EditableService,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: CommentRoundErrorModalService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {

    this.reset();
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {

    const commentRoundChange: SimpleChange = changes['commentRound'];
    if (commentRoundChange && !commentRoundChange.isFirstChange()) {
    }

    const commentThreadsChange: SimpleChange = changes['commentThreads'];
    if (commentThreadsChange && !commentThreadsChange.isFirstChange()) {
      this.reset();
    }

    const myCommentsChange: SimpleChange = changes['myComments'];
    if (myCommentsChange && !myCommentsChange.isFirstChange()) {
      this.reset();
    }
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  reset() {

    if (this.loading) {
      return;
    }

    this.commentThreadForms.controls = [];

    this.commentThreads.sort(comparingPrimitive<CommentThreadSimple>(
      commentThread => this.languageService.isLocalizableEmpty(commentThread.label))
      .andThen(comparingPrimitive<CommentThreadSimple>(commentThread =>
        this.languageService.isLocalizableEmpty(commentThread.label) ? commentThread.resourceUri.toLowerCase() : null))
      .andThen(comparingPrimitive<CommentThreadSimple>(commentThread =>
        commentThread.localName ? commentThread.localName : null))
      .andThen(comparingLocalizable<CommentThreadSimple>(this.languageService,
        commentThread => commentThread.label ? commentThread.label : {}, true)));

    this.commentThreads.forEach(commentThread => {
      const commentThreadFormGroup: FormGroup = new FormGroup({
        id: new FormControl(commentThread.id),
        url: new FormControl(commentThread.url),
        resourceUri: new FormControl(commentThread.resourceUri),
        label: new FormControl(commentThread.label, Validators.required),
        description: new FormControl(commentThread.description, Validators.required),
        localName: new FormControl(commentThread.localName),
        created: new FormControl(commentThread.created),
        user: new FormControl(commentThread.user),
        currentStatus: new FormControl(commentThread.currentStatus),
        proposedStatus: new FormControl(commentThread.proposedStatus),
        proposedText: new FormControl(commentThread.proposedText),
        commentersProposedStatus: new FormControl(this.getMyProposedStatusForCommentThread(commentThread)),
        commentersProposedEndStatus: new FormControl(this.getMyProposedEndStatusForCommentThread(commentThread)),
        commentersProposedText: new FormControl(this.getMyCommentContentForCommentThread(commentThread.id)),
        results: new FormControl(commentThread.results),
        commentCount: new FormControl(commentThread.commentCount)
      });
      this.commentThreadForms.push(commentThreadFormGroup);
    });
  }

  get loading() {
    return this.commentRound == null || this.commentThreads == null || this.myComments == null;
  }

  get commentThreadForms(): FormArray {

    return this.commentThreadForm.get('commentThreads') as FormArray;
  }

  getMyCommentContentForCommentThread(commentThreadId: string): string {

    let content = '';
    if (this.myComments) {
      this.myComments.forEach(comment => {
        if (comment.commentThread.id === commentThreadId) {
          content = comment.content;
        }
      });
    }
    return content;
  }

  getMyProposedStatusForCommentThread(commentThread: CommentThreadSimple): string {

    let proposedStatus = commentThread.proposedStatus;
    if (this.myComments) {
      this.myComments.forEach(comment => {
        if (comment.commentThread.id === commentThread.id && comment.proposedStatus != null) {
          proposedStatus = comment.proposedStatus;
        }
      });
    }
    return proposedStatus;
  }

  getMyProposedEndStatusForCommentThread(commentThread: CommentThreadSimple): string {

    let proposedEndStatus = 'NOSTATUS';
    if (this.myComments) {
      this.myComments.forEach(comment => {
        if (comment.commentThread.id === commentThread.id && comment.endStatus != null) {
          proposedEndStatus = comment.endStatus;
        }
      });
    }
    return proposedEndStatus;
  }

  get hasCommentThreads(): boolean {

    return this.commentThreads && this.commentThreads.length > 0;
  }

  formatDisplayDate(created: Moment): string {

    return formatDisplayDateTime(created);
  }

  get canSendComments(): boolean {

    return this.commenting &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get commentsHaveContent(): boolean {

    let hasContent = false;

    this.commentThreadForms.controls.forEach(commentThread => {
      if (commentThread.value.commentersProposedText != null && commentThread.value.commentersProposedText.trim().length > 0) {
        hasContent = true;
      }
    });
    return hasContent;
  }

  sendMyComments() {

    if (this.hasPartialComments) {
      this.confirmationModalService.sendPartialComments()
        .then(() => {
          this.sendComments();
        }, () => {
        });
    } else {
      this.sendComments();
    }
  }

  sendComments() {

    const comments: CommentType[] = [];

    this.commentThreadForms.controls.forEach(commentThreadInput => {
      const commentThreadInputValue = commentThreadInput.value;
      const commentType: CommentType = <CommentType>{
        commentThread: <CommentThreadType>{ id: commentThreadInputValue.id },
        proposedStatus: commentThreadInputValue.commentersProposedStatus,
        endStatus: commentThreadInputValue.commentersProposedEndStatus,
        content: commentThreadInputValue.commentersProposedText
      };
      if (commentThreadInputValue.commentersProposedText && commentThreadInputValue.commentersProposedText.trim().length > 0) {
        comments.push(commentType);
      }
    });

    this.dataService.createCommentsToCommentRound(this.commentRound.id, comments).subscribe(() => {
      this.refreshCommentThreads.emit();
      this.refreshMyComments.emit();
      this.cancelCommenting();
    }, error => {
      this.cancelCommenting();
      this.reset();
      this.errorModalService.openSubmitError(error);
    });
  }

  get commenting(): boolean {

    return this.commenting$.getValue();
  }

  startCommenting() {

    this.editableService.cancel();
    this.commenting$.next(true);
  }

  cancelCommenting() {

    this.reset();
    this.commenting$.next(false);
  }

  get canStartCommenting(): boolean {

    return !this.commenting &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get showCancelCommenting(): boolean {

    return this.commenting &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get hasPartialComments(): boolean {

    let partialComments = false;

    this.commentThreadForms.controls.forEach(commentThread => {
      if (commentThread.value.commentersProposedText == null || commentThread.value.commentersProposedText.trim() === '') {
        partialComments = true;
      }
    });
    return partialComments;
  }

  getMyCommentForCommentThread(commentThreadId: string): string | null {

    let myComment = null;
    if (this.myComments) {
      this.myComments.forEach(comment => {
        if (comment.commentThread.id === commentThreadId) {
          myComment = comment;
        }
      });
    }
    if (myComment == null) {
    }
    return myComment;
  }

  get requireComments(): boolean {

    return this.commentRound.fixedThreads;
  }

  canModifyCommentProposedStatus(): boolean {

    return this.authorizationManager.canCreateComment(this.commentRound) && this.commentRound.status === 'INPROGRESS';
  }

  canModifyComment(commentThreadId: string): boolean {

    return this.getMyCommentForCommentThread(commentThreadId) == null;
  }

  sortContent(sortingType: string) {

    this.sortOption = sortingType;
    switch (sortingType) {
      case 'alphabetical':
        this.commentThreadForms.controls.sort(comparingPrimitive<AbstractControl>(
          commentThread => this.languageService.isLocalizableEmpty(commentThread.value.label))
          .andThen(comparingPrimitive<AbstractControl>(commentThread =>
            this.languageService.isLocalizableEmpty(
              commentThread.value.label) ? (commentThread.value.url ? commentThread.value.url.toLowerCase() : null) : null))
          .andThen(comparingLocalizable<AbstractControl>(this.languageService,
            commentThread => commentThread.value.label ? commentThread.value.label : {})));
        break;
      case 'created':
        this.commentThreadForms.controls.sort(comparingPrimitive<AbstractControl>(
          commentThread => commentThread.value.created));
        break;
      default:
        break;
    }
  }

  hasLocalization(localizable: Localizable) {

    return hasLocalization(localizable);
  }

  getCommentThreadResourceUri(commentThread: CommentThread): string | null {

    return this.configurationService.getUriWithEnv(commentThread.resourceUri);
  }
}
