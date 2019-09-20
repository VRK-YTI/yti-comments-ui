import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { ConfigurationService } from '../../services/configuration.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { DataService } from '../../services/data.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { formatDisplayDateTime } from '../../utils/date';
import { CommentRound } from '../../entity/commentround';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { comparingLocalizable, comparingPrimitive } from 'yti-common-ui/utils/comparator';
import { Moment } from 'moment';
import { CommentRoundErrorModalService } from '../common/error-modal.service';
import { CommentThread } from '../../entity/commentthread';
import { Localizable } from 'yti-common-ui/types/localization';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationResource } from '../../entity/integration-resource';
import { v4 as uuid } from 'uuid';
import { CommentThreadSimple } from '../../entity/commentthread-simple';
import { CommentThreadSimpleType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { CommentSimple } from '../../entity/comment-simple';
import { Comment } from '../../entity/comment';
import { SearchLinkedIntegrationResourceMultiModalService } from '../form/search-linked-integration-resource-multi-modal.component';
import { nonEmptyLocalizableValidator } from '../../utils/validators';

@Component({
  selector: 'app-comment-round-comment-threads',
  templateUrl: './comment-round-comment-threads.component.html',
  styleUrls: ['./comment-round-comment-threads.component.scss'],
  providers: [EditableService]
})
export class CommentRoundCommentThreadsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() commentRound: CommentRound;
  @Input() myComments: Comment[];
  @Input() commentThreads: CommentThreadSimple[];
  @Input() tabSet: NgbTabset;

  @Output() changeTabControl = new EventEmitter<boolean>();
  @Output() refreshCommentThreads = new EventEmitter();

  editSubscription: Subscription;
  cancelSubscription: Subscription;

  newIds: string[] = [];
  showCommentsId: number | undefined = undefined;
  activeThreadId: string | undefined = undefined;
  activeCommentId$ = new BehaviorSubject<string | null>(null);
  activeThreadComments: CommentSimple[];
  sortOption = 'alphabetical';

  commentThreadForm = new FormGroup({
    commentThreads: new FormArray([])
  }, null);

  constructor(public languageService: LanguageService,
              public configurationService: ConfigurationService,
              private authorizationManager: AuthorizationManager,
              private dataService: DataService,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: CommentRoundErrorModalService,
              private searchLinkedIntegrationResourceMultiModalService: SearchLinkedIntegrationResourceMultiModalService,
              private editableService: EditableService) {

    this.editSubscription = editableService.edit$.subscribe(() => this.changeTabControl.emit(true));
    this.cancelSubscription = editableService.cancel$.subscribe(() => {
      this.reset();
      this.changeTabControl.emit(false);
    });
    editableService.onSave = () => this.save();
  }

  ngOnInit() {

    this.refreshCommentThreads.emit();
    this.reset();
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {

    const commentThreadsChange: SimpleChange = changes['commentThreads'];
    if (commentThreadsChange && !commentThreadsChange.isFirstChange()) {
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

    this.newIds = [];

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
        label: new FormControl(commentThread.label, nonEmptyLocalizableValidator),
        description: new FormControl(commentThread.description, nonEmptyLocalizableValidator),
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

  toggleShowThreadComments(commentRoundId: string, commentThreadId: string, index: number) {

    if (index === this.showCommentsId) {
      this.showCommentsId = undefined;
      this.activeThreadId = undefined;
      this.activeThreadComments = [];
    } else {
      this.dataService.getCommentRoundCommentThreadComments(commentRoundId, commentThreadId).subscribe(comments => {
        this.showCommentsId = index;
        this.activeThreadId = commentThreadId;
        this.sortCommentsByCreated(comments);
        this.activeThreadComments = comments;
      });
    }
  }

  get showActions(): boolean {

    return this.isEditing &&
      (this.commentRound.status === 'INCOMPLETE' || this.commentRound.status === 'INPROGRESS' || this.commentRound.status === 'AWAIT');
  }

  get showResults(): boolean {

    return this.commentRound.status === 'ENDED' || this.commentRound.status === 'CLOSED';
  }

  isNewResource(id: string): boolean {

    return this.newIds.indexOf(id) !== -1;
  }

  removeCommentThread(i: any) {

    this.confirmationModalService.deleteCommentThread()
      .then(() => {
        this.commentThreadForms.removeAt(i);
      }, ignoreModalClose);
  }

  get isEditorOrSuperUser(): boolean {

    return this.authorizationManager.user.superuser || this.commentRound.user.email === this.authorizationManager.user.email;
  }

  filterTopLevelComments(comments: CommentSimple[]): CommentSimple[] {

    return comments.filter(comment => comment.parentComment == null);
  }

  refreshComments(commentThreadId: string) {

    this.dataService.getCommentRoundCommentThreadComments(this.commentRound.id, commentThreadId).subscribe(comments => {
      this.updateCommentCountForCommentThread(commentThreadId, comments.length);
      this.sortCommentsByCreated(comments);
      comments.forEach(comment => {
        this.activeThreadComments.forEach(c => {
          if (comment.id === c.id) {
            comment.expanded = c.expanded;
          }
        });
      });
      this.activeThreadComments = comments;
    }, error => {
      this.errorModalService.openSubmitError(error);
    });
  }

  expandComment(commentId: string) {

    this.activeThreadComments.forEach(comment => {
      if (comment.id === commentId) {
        comment.expanded = true;
        this.expandChildComments(comment.id);
      }
    });
  }

  expandChildComments(parentCommentId: string) {

    const childComments: CommentSimple[] = this.getRecursiveChildComments(parentCommentId);
    childComments.forEach(comment => {
      comment.expanded = true;
    });
  }

  getRecursiveChildComments(parentCommentId: string): CommentSimple[] {

    const childComments: CommentSimple[] = [];
    this.activeThreadComments.forEach(comment => {
      if (comment.parentComment && comment.parentComment.id === parentCommentId) {
        childComments.push(comment);
        const grandChildComments = this.getRecursiveChildComments(comment.id);
        if (grandChildComments.length > 0) {
          grandChildComments.forEach(grandChildComment => {
            childComments.push(grandChildComment);
          });
        }
      }
    });
    return childComments;
  }

  collapseComment(commentId: string) {

    this.activeThreadComments.forEach(comment => {
      if (comment.id === commentId) {
        comment.expanded = false;
        const grandChildComments = this.getRecursiveChildComments(comment.id);
        if (grandChildComments.length > 0) {
          grandChildComments.forEach(grandChildComment => {
            grandChildComment.expanded = true;
          });
        }
      }
    });
  }

  updateCommentCountForCommentThread(commentThreadId: string, count: number) {

    this.commentThreadForms.controls.forEach(commentThread => {
      if (commentThread.value.id === commentThreadId) {
        commentThread.value.commentCount = count;
      }
    });
  }

  sortCommentsByCreated(comments: CommentSimple[]) {

    comments.sort(
      comparingPrimitive<CommentSimple>(comment => comment.created ? comment.created.toString() : undefined));
  }

  formatDisplayDate(created: Moment): string {

    return formatDisplayDateTime(created);
  }

  hasLocalization(localizable: Localizable) {

    return hasLocalization(localizable);
  }

  getCommentThreadResourceUri(commentThread: CommentThread): string | null {

    return this.configurationService.getUriWithEnv(commentThread.resourceUri);
  }

  get canInlineComment(): boolean {

    return this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  canModifyOrDeleteInlineComment(comment: CommentSimple): boolean {

    return (this.authorizationManager.user.email === comment.user.email) &&
      this.commentRound.status === 'INPROGRESS';
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

  addCommentThreadToCommentRound() {

    this.searchLinkedIntegrationResourceMultiModalService
      .open(this.commentRound.source.containerType, this.commentRound.source.containerUri,
        this.commentRound.openThreads, this.restrictedThreads, true)
      .then(source => this.createNewCommentThreadsWithSources(source), ignoreModalClose);
  }

  get canCreateCommentThread(): boolean {

    if (this.commentRound.status === 'INCOMPLETE') {
      return this.isEditorOrSuperUser;
    } else if (this.commentRound.status === 'INPROGRESS' && !this.commentRound.fixedThreads) {
      return this.authorizationManager.canCreateCommentThread(this.commentRound);
    }
    return false;
  }

  get showCreateThreadButton() {

    return ((this.isEditing && this.isEditorOrSuperUser) ||
      (this.isEditing && !this.commentRound.fixedThreads && this.authorizationManager.canCreateCommentThread(this.commentRound)));
  }

  get showEditableButtons() {

    return (this.isEditorOrSuperUser ||
      (!this.commentRound.fixedThreads && this.authorizationManager.canCreateCommentThread(this.commentRound)));
  }

  get isEditing() {

    return this.editableService.editing;
  }

  createNewCommentThreadWithSource(integrationResource: IntegrationResource) {

    const id: string = uuid();
    this.newIds.push(id);
    const commentThreadFormGroup: FormGroup = new FormGroup({
      id: new FormControl(id),
      resourceUri: new FormControl(integrationResource.uri),
      resourceType: new FormControl(integrationResource.type),
      created: new FormControl(),
      user: new FormControl(),
      label: integrationResource.uri ? new FormControl(integrationResource.prefLabel) :
        new FormControl(integrationResource.prefLabel ? integrationResource.prefLabel : {}, nonEmptyLocalizableValidator),
      description: integrationResource.uri ? new FormControl(integrationResource.description) :
        new FormControl(integrationResource.description ? integrationResource.description : {}, nonEmptyLocalizableValidator),
      localName: new FormControl(integrationResource.localName),
      currentStatus: new FormControl(integrationResource.status),
      proposedStatus: new FormControl(integrationResource.uri != null ? integrationResource.status : 'SUGGESTED'),
      proposedText: new FormControl(''),
      commentersProposedStatus: new FormControl('NOSTATUS'),
      commentersProposedEndStatus: new FormControl('NOSTATUS'),
      commentersProposedText: new FormControl(''),
      results: new FormControl([])
    });

    this.commentThreadForms.push(commentThreadFormGroup);
  }

  createNewCommentThreadsWithSources(integrationResources: IntegrationResource[]) {

    integrationResources.forEach(integrationResource => this.createNewCommentThreadWithSource(integrationResource));
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

  get restrictedThreads(): string[] {

    const restrictedIds: string[] = [];
    const commentThreads: FormArray = this.commentThreadForms;

    if (commentThreads) {
      commentThreads.controls.forEach(thread => {
        const threadValue: CommentThreadSimple = thread.value;
        if (threadValue.resourceUri) {
          restrictedIds.push(threadValue.resourceUri);
        }
      });
    }

    return restrictedIds;
  }

  mapCommentThreads(commentThreadsFormArray: FormArray): CommentThreadSimple[] {

    const commentThreads: CommentThreadSimple[] = [];

    if (commentThreadsFormArray) {
      commentThreadsFormArray.controls.forEach(commentThreadInput => {
        const commentThreadInputValue = commentThreadInput.value;
        const commentThreadFromFormInput: CommentThreadSimpleType = <CommentThreadSimpleType>{
          id: commentThreadInputValue.id,
          url: commentThreadInputValue.url,
          resourceUri: commentThreadInputValue.resourceUri,
          label: commentThreadInputValue.label,
          description: commentThreadInputValue.description,
          localName: commentThreadInputValue.localName,
          created: commentThreadInputValue.created,
          user: commentThreadInputValue.user,
          currentStatus: commentThreadInputValue.currentStatus,
          proposedStatus: commentThreadInputValue.proposedStatus,
          proposedText: commentThreadInputValue.proposedText,
          commentersProposedStatus: commentThreadInputValue.commentersProposedStatus,
          commentersProposedEndStatus: commentThreadInputValue.commentersProposedEndStatus,
          commentersProposedText: commentThreadInputValue.commentersProposedText,
          results: commentThreadInputValue.results,
          commentCount: commentThreadInputValue.commentCount
        };
        const commentThread: CommentThreadSimple = new CommentThreadSimple(commentThreadFromFormInput);
        commentThreads.push(commentThread);
      });
    }

    return commentThreads;
  }

  save(): Observable<any> {

    let removeOrphans = false;

    if (this.isEditorOrSuperUser && this.commentRound.status === 'INCOMPLETE') {
      removeOrphans = true;
    }

    const commentThreadsToBeUpdated: CommentThreadSimpleType[] =
      this.mapCommentThreads(this.commentThreadForms).map(ct => ct.serialize());

    const save = () => {
      return this.dataService.createCommentThreads(this.commentRound.id, commentThreadsToBeUpdated, removeOrphans).pipe(tap(() => {
        this.refreshCommentThreads.emit();
        this.editableService.cancel();
        this.changeTabControl.emit(false);
      }));
    };

    return save();
  }

  commentIdentity(index: number, item: CommentSimple) {

    return item.id;
  }

  get numberOfExpanded() {

    return this.filterTopLevelComments(this.activeThreadComments)
      .filter(comment => comment.expanded && this.hasChildComments(comment.id)).length;
  }

  hasChildComments(parentCommentId: string): boolean {

    return this.activeThreadComments.filter(comment => comment.parentComment && comment.parentComment.id === parentCommentId).length > 0;
  }

  get numberOfCollapsed() {

    return this.activeThreadComments.filter(comment => !comment.expanded).length;
  }

  hasExpanded() {

    return this.numberOfExpanded > 0;
  }

  hasCollapsed() {

    return this.numberOfCollapsed > 0;
  }

  expandAll() {

    this.activeThreadComments.forEach(comment => {
      comment.expanded = true;
    });
  }

  collapseAll() {

    this.activeThreadComments.forEach(comment => {
      comment.expanded = false;
    });
  }

  showExpandAll() {

    return this.hasCollapsed();
  }

  showCollapseAll() {

    return this.hasExpanded();
  }

  hasHierarchy() {

    return this.activeThreadComments.filter(comment => comment.parentComment !== undefined).length > 0;
  }

  allowExpandAllAndCollapseAll() {

    return this.hasHierarchy && this.activeThreadComments.length <= 500;
  }
}
