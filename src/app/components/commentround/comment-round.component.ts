import { AfterViewInit, Component, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../../entity/commentround';
import { DataService } from '../../services/data.service';
import { CommentThread } from '../../entity/commentthread';
import { EditableService } from '../../services/editable.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDisplayDateTime, validDateRange } from '../../utils/date';
import { CommentRoundStatus } from '../../entity/comment-round-status';
import { requiredList } from 'yti-common-ui/utils/validator';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { CommentThreadSimple } from '../../entity/commentthread-simple';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchLinkedIntegrationResourceModalService } from '../form/search-linked-integration-resource-modal.component';
import { CommentThreadSimpleType, CommentThreadType, CommentType } from '../../services/api-schema';
import { IntegrationResource } from '../../entity/integration-resource';
import { Comment } from '../../entity/comment';
import { v4 as uuid } from 'uuid';
import { LanguageService } from '../../services/language.service';
import { ConfigurationService } from '../../services/configuration.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { Localizable } from 'yti-common-ui/types/localization';
import { CommentRoundErrorModalService } from '../common/error-modal.service';
import { CommentSimple } from '../../entity/comment-simple';
import { comparingLocalizable, comparingPrimitive } from 'yti-common-ui/utils/comparator';
import { Moment } from 'moment';

function addToControl<T>(control: FormControl, itemToAdd: T) {

  const previous = control.value ? control.value as T[] : [];
  control.setValue([...previous, itemToAdd]);
}

function removeFromControl<T>(control: FormControl, itemToRemove: T) {

  const previous = control.value as T[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

@Component({
  selector: 'app-commentround',
  templateUrl: './comment-round.component.html',
  styleUrls: ['./comment-round.component.scss'],
  providers: [EditableService]
})
export class CommentRoundComponent implements OnChanges, OnDestroy, AfterViewInit {

  @ViewChild('tabSet') tabSet: NgbTabset;

  commentRound: CommentRound;
  commentRoundId: string | undefined = undefined;
  myComments: Comment[];
  commenting$ = new BehaviorSubject<boolean>(false);
  newIds: string[] = [];

  currentTab$ = new BehaviorSubject<string>('');

  cancelSubscription: Subscription;

  showCommentsId: number | undefined = undefined;
  activeThreadComments: CommentSimple[];
  activeCommentId$ = new BehaviorSubject<string | null>(null);

  sortOption = 'alphabetical';

  commentRoundForm = new FormGroup({
    label: new FormControl(''),
    description: new FormControl(''),
    fixedThreads: new FormControl(),
    openThreads: new FormControl(),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('INCOMPLETE' as CommentRoundStatus),
    organizations: new FormControl([], [requiredList]),
    commentThreads: new FormArray([])
  }, null);

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private editableService: EditableService,
              private locationService: LocationService,
              private location: Location,
              private authorizationManager: AuthorizationManager,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: CommentRoundErrorModalService,
              private searchLinkedIntegrationResourceModalService: SearchLinkedIntegrationResourceModalService,
              public languageService: LanguageService,
              public configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngAfterViewInit() {

    this.initialize();
  }

  initialize() {

    this.newIds = [];

    const commentRoundId = this.route.snapshot.params.commentRoundId;
    this.commentRoundId = commentRoundId;

    if (!commentRoundId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}'`);
    }

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
      this.locationService.atCommentRoundPage(commentRound);
      this.dataService.getCommentRoundCommenterComments(commentRoundId).subscribe(comments => {
        this.myComments = comments;
        this.reset();
        this.activateCurrentTab();
      });
    });
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

  activateCurrentTab() {

    if (!this.currentTab$.value) {
      if (this.isEditorOrSuperUser || (this.myComments && this.myComments.length > 0)) {
        this.currentTab$.next('commentround_resources_tab');
        this.tabSet.activeId = 'commentround_resources_tab';
      } else {
        this.currentTab$.next('commentround_comments_tab');
        this.tabSet.activeId = 'commentround_comments_tab';
      }
    }
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.reset();
  }

  get canCreateCommentThread(): boolean {

    if (this.resourcesTabActive) {
      if (this.commentRound.status === 'INCOMPLETE') {
        return this.authorizationManager.user.email === this.commentRound.user.email && this.editing;
      } else if (this.commentRound.status === 'INPROGRESS' &&
        !this.commentRound.fixedThreads &&
        (this.editing || this.commenting)) {
        return this.authorizationManager.canCreateCommentThread();
      }
    }

    return false;
  }

  startCommentRound() {

    this.confirmationModalService.startCommentRound()
      .then(() => {
        this.commentRound.status = 'INPROGRESS';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.initialize();
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  closeCommentRound() {

    this.confirmationModalService.closeCommentRound()
      .then(() => {
        this.commentRound.status = 'CLOSED';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.initialize();
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  deleteCommentRound() {

    this.confirmationModalService.deleteCommentRound()
      .then(() => {
        this.dataService.deleteCommentRound(this.commentRound).subscribe(commentRound => {
          this.router.navigate(['frontpage']);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  addCommentThreadToCommentRound() {

    this.searchLinkedIntegrationResourceModalService
      .open(this.commentRound.source.containerType, this.commentRound.source.containerUri, this.openThreads, this.restrictedThreads, true)
      .then(source => this.createNewCommentThreadWithSource(source), ignoreModalClose);
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
      currentStatus: new FormControl(integrationResource.status),
      proposedStatus: new FormControl(integrationResource.uri != null ? integrationResource.status : 'SUGGESTION'),
      proposedText: new FormControl(''),
      commentersProposedStatus: new FormControl('NOSTATUS'),
      commentersProposedEndStatus: new FormControl('NOSTATUS'),
      commentersProposedText: new FormControl(''),
      results: new FormControl([])
    });

    this.commentThreadForms.push(commentThreadFormGroup);
  }

  canModifyCommentProposedStatus(): boolean {

    return this.authorizationManager.canCreateComment(this.commentRound) && this.commentRound.status === 'INPROGRESS';
  }

  canModifyComment(commentThreadId: string): boolean {

    return this.getMyCommentForCommentThread(commentThreadId) == null;
  }

  removeCommentThread(i: any) {

    this.confirmationModalService.deleteCommentThread()
      .then(() => {
        this.commentThreadForms.removeAt(i);
      }, ignoreModalClose);
  }

  get restrictedThreads(): string[] {

    const restrictedIds: string[] = [];
    const threads: FormArray = this.commentThreadForms;

    if (threads) {
      threads.controls.forEach(thread => {
        const threadValue: CommentThreadSimple = thread.value;
        if (threadValue.resourceUri) {
          restrictedIds.push(threadValue.resourceUri);
        }
      });
    }

    return restrictedIds;
  }

  get commentThreadForms(): FormArray {

    return this.commentRoundForm.get('commentThreads') as FormArray;
  }

  get openThreads(): boolean {

    return this.commentRoundForm.controls['openThreads'].value;
  }

  private reset() {

    const { label, description, fixedThreads, openThreads, startDate, endDate, organizations, status, commentThreads }
      = this.commentRound;

    this.commentRoundForm.reset({
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      validity: { start: startDate, end: endDate },
      organizations: organizations.map(organization => organization.clone()),
      status: status
    });

    this.commentThreadForms.controls = [];

    commentThreads.sort(comparingPrimitive<CommentThreadSimple>(
      commentThread => this.languageService.isLocalizableEmpty(commentThread.label))
      .andThen(comparingPrimitive<CommentThreadSimple>(commentThread =>
        this.languageService.isLocalizableEmpty(commentThread.label) ? commentThread.url.toLowerCase() : null))
      .andThen(comparingLocalizable<CommentThreadSimple>(this.languageService,
        commentThread => commentThread.label ? commentThread.label : {})));

    commentThreads.forEach(commentThread => {
      const commentThreadFormGroup: FormGroup = new FormGroup({
        id: new FormControl(commentThread.id),
        url: new FormControl(commentThread.url),
        resourceUri: new FormControl(commentThread.resourceUri),
        label: new FormControl(commentThread.label, Validators.required),
        description: new FormControl(commentThread.description, Validators.required),
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

  save(formData: any): Observable<any> {

    if (this.isEditorOrSuperUser) {

      const { label, description, fixedThreads, openThreads, validity, organizations, status } = formData;

      const commentThreadsToBeUpdated: CommentThreadSimple[] = this.mapCommentThreads(this.commentThreadForms);

      const updatedCommentRound = this.commentRound.clone();

      Object.assign(updatedCommentRound, {
        label: label,
        description: description,
        fixedThreads: fixedThreads,
        openThreads: openThreads,
        startDate: validity.start,
        endDate: validity.end,
        organizations: organizations,
        source: this.commentRound.source,
        sourceLabel: this.commentRound.sourceLabel,
        status: status,
        commentThreads: commentThreadsToBeUpdated
      });

      const save = () => {

        return this.dataService.updateCommentRound(updatedCommentRound.serialize()).pipe(tap(() => this.initialize()));
      };

      return save();

    } else {

      const commentThreadsToBeUpdated: CommentThreadSimpleType[] =
        this.mapCommentThreads(this.commentThreadForms).map(ct => ct.serialize());

      const save = () => {

        return this.dataService.createCommentThreads(this.commentRound.id, commentThreadsToBeUpdated).pipe(tap(() => this.initialize()));
      };

      return save();
    }
  }

  isNewResource(id: string): boolean {
    return this.newIds.indexOf(id) !== -1;
  }

  get editing() {

    return this.editableService.editing;
  }

  startCommenting() {

    this.editableService.cancel();
    this.commenting$.next(true);
  }

  cancelCommenting() {

    this.reset();
    this.commenting$.next(false);
  }

  sendMyComments() {

    const comments: CommentType[] = [];

    this.commentThreadForms.controls.forEach(commentThreadInput => {
      const commentThreadInputValue = commentThreadInput.value;
      const commentType: CommentType = <CommentType>{
        commentThread: <CommentThreadType>{ id: commentThreadInputValue.id },
        proposedStatus: commentThreadInputValue.commentersProposedStatus,
        endStatus: commentThreadInputValue.commentersProposedEndStatus,
        content: commentThreadInputValue.commentersProposedText
      };
      if (!this.commentRound.fixedThreads && this.commentRound.openThreads && commentThreadInputValue.commentersProposedText) {
        comments.push(commentType);
      } else {
        comments.push(commentType);
      }
    });

    this.dataService.createCommentsToCommentRound(this.commentRound.id, comments).subscribe(myComments => {
      this.cancelCommenting();
      this.initialize();
    }, error => {
      this.cancelCommenting();
      this.errorModalService.openSubmitError(error);
    });
  }

  get commenting(): boolean {

    return this.commenting$.getValue();
  }

  get loading() {

    return this.commentRound == null || this.myComments == null;
  }

  get getResourceUri(): string | null {

    return this.configurationService.getUriWithEnv(this.commentRound.source.containerUri);
  }

  get hasCommentThreads(): boolean {

    const threads: FormArray = this.commentThreadForms;

    return threads && threads.length > 0;
  }

  get isEditorOrSuperUser(): boolean {

    return this.authorizationManager.user.superuser || this.commentRound.user.email === this.authorizationManager.user.email;
  }

  get isEditor(): boolean {

    return this.commentRound.user.email === this.authorizationManager.user.email;
  }

  get toolType(): string {

    return this.commentRound.source.containerType;
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

  closeInlineComments() {
    this.showCommentsId = undefined;
    this.activeThreadComments = [];
  }

  onTabChange(event: NgbTabChangeEvent) {

    this.closeInlineComments();
    this.cancelCommenting();
    if (this.isEditing()) {
      event.preventDefault();

      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.cancelEditing();
          this.tabSet.activeId = event.nextId;
          this.currentTab$.next(event.nextId);
        }, ignoreModalClose);
    } else {
      this.tabSet.activeId = event.nextId;
      this.currentTab$.next(event.nextId);
    }
  }

  cancelEditing(): void {

    this.editableService.cancel();
  }

  isEditing(): boolean {

    return this.editableService.editing;
  }

  get canStartCommenting(): boolean {

    return !this.commenting &&
      this.commentsTabActive &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get showCancelCommenting(): boolean {

    return this.commenting &&
      this.commentsTabActive &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get canSendComments(): boolean {

    return this.commenting &&
      this.commentsTabActive &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get commentsHaveContent(): boolean {

    let hasContent = true;

    this.commentThreadForms.controls.forEach(commentThread => {
      if (commentThread.value.commentersProposedText == null || commentThread.value.commentersProposedText === '') {
        hasContent = false;
      }
    });
    return hasContent;
  }

  get canInlineComment(): boolean {

    return this.resourcesTabActive &&
      this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS';
  }

  get commentsTabActive(): boolean {

    if (this.currentTab$) {
      if (this.currentTab$.value === 'commentround_comments_tab') {
        return true;
      }
    }
    return false;
  }

  get resourcesTabActive(): boolean {

    if (this.currentTab$) {
      if (this.currentTab$.value === 'commentround_resources_tab') {
        return true;
      }
    }
    return false;
  }

  get canStartCommentRound(): boolean {

    return this.commentRound.status === 'INCOMPLETE' &&
      this.commentRound.commentThreads.length > 0 &&
      !this.editing &&
      this.authorizationManager.user.email === this.commentRound.user.email;
  }

  get canEndCommenting(): boolean {

    return this.commentRound.status === 'INPROGRESS' && !this.editing &&
      (this.authorizationManager.user.superuser || this.authorizationManager.user.email === this.commentRound.user.email);
  }

  get canDeleteCommentRound(): boolean {

    return this.authorizationManager.canDeleteCommentRound(this.commentRound);
  }

  get commentRoundCountTranslateParams() {

    return {
      value: this.commentRound.commentThreads.length
    };
  }

  get showActions(): boolean {

    return this.editing &&
      (this.commentRound.status === 'INCOMPLETE' || this.commentRound.status === 'INPROGRESS' || this.commentRound.status === 'AWAIT');
  }

  get showResults(): boolean {

    return this.commentRound.status === 'ENDED' || this.commentRound.status === 'CLOSED';
  }

  get showExcelExport(): boolean {

    return this.commentRound.status === 'ENDED' || this.commentRound.status === 'CLOSED';
  }

  get exportUrl(): string {

    return this.commentRound.url + '/?format=excel';
  }

  get requireComments(): boolean {

    return this.commentRound.fixedThreads;
  }

  hasLocalization(localizable: Localizable) {

    return hasLocalization(localizable);
  }

  getCommentThreadResourceUri(commentThread: CommentThread): string | null {

    return this.configurationService.getUriWithEnv(commentThread.resourceUri);
  }

  get showMenu(): boolean {

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
}
