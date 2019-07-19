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
import { SearchLinkedIntegrationResourceModalService } from '../form/search-linked-integration-resource-modal.component';
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

  @Output() refreshCommentThreads = new EventEmitter();

  cancelSubscription: Subscription;

  newIds: string[] = [];
  showCommentsId: number | undefined = undefined;
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
              // private searchLinkedIntegrationResourceModalService: SearchLinkedIntegrationResourceModalService,
              private searchLinkedIntegrationResourceMultiModalService: SearchLinkedIntegrationResourceMultiModalService,
              private editableService: EditableService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
    editableService.onSave = () => this.save();
  }

  ngOnInit() {

    this.reset();
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {

    const commentRoundChange: SimpleChange = changes['commentRound'];
    if (commentRoundChange && !commentRoundChange.isFirstChange()) {
      // this.commentRound = commentRoundChange.currentValue;
    }

    const commentThreadsChange: SimpleChange = changes['commentThreads'];
    if (commentThreadsChange && !commentThreadsChange.isFirstChange()) {
      // this.commentThreads = commentThreadsChange.currentValue;
      this.reset();
    }

    const myCommentsChange: SimpleChange = changes['myComments'];
    if (myCommentsChange && !myCommentsChange.isFirstChange()) {
      // this.myComments = myCommentsChange.currentValue;
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

  toggleShowThreadComments(commentRoundId: string, commentThreadId: string, index: number) {

    if (index === this.showCommentsId) {
      this.showCommentsId = undefined;
      this.activeThreadComments = [];
    } else {
      this.dataService.getCommentRoundCommentThreadComments(commentRoundId, commentThreadId).subscribe(comments => {
        this.showCommentsId = index;
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
      this.activeThreadComments = comments;
    }, error => {
      this.errorModalService.openSubmitError(error);
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
      return this.authorizationManager.canCreateCommentThread();
    }

    return false;
  }

  get showCreateThreadButton() {

    return (this.isEditing && this.isEditorOrSuperUser) ||
      (this.isEditing && !this.commentRound.fixedThreads && this.authorizationManager.canCreateCommentThread());
  }

  get showEditableButtons() {

    return this.isEditorOrSuperUser || (!this.commentRound.fixedThreads && this.authorizationManager.canCreateCommentThread());
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
      label: new FormControl(integrationResource.prefLabel),
      description: new FormControl(integrationResource.description),
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
      }));
    };

    return save();
  }

  commentIdentity(index: number, item: CommentSimple) {
    return item.id;
  }
}
