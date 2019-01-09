import { AfterViewInit, Component, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../../entity/commentround';
import { DataService } from '../../services/data.service';
import { CommentThread } from '../../entity/commentthread';
import { EditableService } from '../../services/editable.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { validDateRange } from '../../utils/date';
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
import { TranslateService } from '@ngx-translate/core';
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
  myComments: Comment[];
  commenting$ = new BehaviorSubject<boolean>(false);
  newIds: string[] = [];

  currentTab$ = new BehaviorSubject<string>('');

  cancelSubscription: Subscription;

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
              private translateService: TranslateService,
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

  activateCurrentTab() {

    if (!this.currentTab$.value) {
      if (this.isEditorOrSuperUser) {
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

    if (this.commentRound.status === 'INCOMPLETE') {
      return this.authorizationManager.user.email === this.commentRound.user.email &&
        this.editing && this.resourcesTabActive;
    } else if (this.commentRound.status === 'INPROGRESS' &&
      !this.commentRound.fixedThreads &&
      (this.editing || this.commenting) &&
      this.resourcesTabActive) {
      return this.authorizationManager.canCreateCommentThread();
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

  addCommentThreadToCommentRound() {

    const titleLabel = this.translateService.instant('Choose source');
    const searchlabel = this.translateService.instant('Search term');

    this.searchLinkedIntegrationResourceModalService
      .open(this.commentRound.source.containerType, this.commentRound.source.containerUri, this.openThreads,
        titleLabel, searchlabel, this.restrictedThreads, true)
      .then(source => this.createNewCommentThreadWithSource(source), ignoreModalClose);
  }

  createNewCommentThreadWithSource(integrationResource: IntegrationResource) {

    const id: string = uuid();
    this.newIds.push(id);
    const commentThreadFormGroup: FormGroup = new FormGroup({
      id: new FormControl(id),
      resourceUri: new FormControl(integrationResource.uri),
      resourceType: new FormControl(integrationResource.type),
      label: new FormControl(integrationResource.prefLabel),
      description: new FormControl(integrationResource.description),
      currentStatus: new FormControl(integrationResource.status),
      proposedStatus: new FormControl(integrationResource.uri != null ? 'NOSTATUS' : 'SUGGESTION'),
      proposedText: new FormControl(''),
      commentersProposedStatus: new FormControl('NOSTATUS'),
      commentersProposedText: new FormControl(''),
      results: new FormControl([])
    });

    this.commentThreadForms.push(commentThreadFormGroup);
  }

  canModifyComment(commentThreadId: string): boolean {

    return this.getMyCommentForCommentThread(commentThreadId) == null;
  }

  removeCommentThread(i: any) {

    this.commentThreadForms.removeAt(i);
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

    commentThreads.forEach(commentThread => {
      const commentThreadFormGroup: FormGroup = new FormGroup({
        id: new FormControl(commentThread.id),
        resourceUri: new FormControl(commentThread.resourceUri),
        label: new FormControl(commentThread.label, Validators.required),
        description: new FormControl(commentThread.description, Validators.required),
        currentStatus: new FormControl(commentThread.currentStatus),
        proposedStatus: new FormControl(commentThread.proposedStatus),
        proposedText: new FormControl(commentThread.proposedText),
        commentersProposedStatus: new FormControl(this.getMyProposedStatusForCommentThread(commentThread.id)),
        commentersProposedText: new FormControl(this.getMyCommentContentForCommentThread(commentThread.id)),
        results: new FormControl(commentThread.results)
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

  getMyProposedStatusForCommentThread(commentThreadId: string): string {

    let proposedStatus = 'NOSTATUS';
    if (this.myComments) {
      this.myComments.forEach(comment => {
        if (comment.commentThread.id === commentThreadId && comment.proposedStatus != null) {
          proposedStatus = comment.proposedStatus;
        }
      });
    }
    return proposedStatus;
  }

  mapCommentThreads(commentThreadsFormArray: FormArray): CommentThreadSimple[] {

    const commentThreads: CommentThreadSimple[] = [];

    if (commentThreadsFormArray) {
      commentThreadsFormArray.controls.forEach(commentThreadInput => {
        const commentThreadInputValue = commentThreadInput.value;
        const commentThreadFromFormInput: CommentThreadSimpleType = <CommentThreadSimpleType> {
          id: commentThreadInputValue.id,
          resourceUri: commentThreadInputValue.resourceUri,
          label: commentThreadInputValue.label,
          description: commentThreadInputValue.description,
          currentStatus: commentThreadInputValue.currentStatus,
          proposedStatus: commentThreadInputValue.proposedStatus,
          proposedText: commentThreadInputValue.proposedText,
          commentersProposedStatus: commentThreadInputValue.commentersProposedStatus,
          commentersProposedText: commentThreadInputValue.commentersProposedText,
          results: commentThreadInputValue.results
        };
        const commentThread: CommentThreadSimple = new CommentThreadSimple(commentThreadFromFormInput);
        commentThreads.push(commentThread);
      });
    }

    return commentThreads;
  }

  save(formData: any): Observable<any> {

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
  }

  isNewResource(id: string): boolean {
    return this.newIds.includes(id);
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

  sendCommentsAndAddResources() {

    const commentThreadsToBeAdded: CommentThreadSimple[] =
      this.mapCommentThreads(this.commentThreadForms).filter(commentThread => this.isNewResource(commentThread.id));

    if (commentThreadsToBeAdded.length > 0) {
      this.dataService.createCommentThreads(this.commentRound.id,
        commentThreadsToBeAdded.map(thread => thread.serialize())).subscribe(commentThreads => {
        this.newIds = [];
        this.sendComments();
      });
    } else {
      this.sendComments();
    }
  }

  sendComments() {

    const comments: CommentType[] = [];

    this.commentThreadForms.controls.forEach(commentThreadInput => {
      const commentThreadInputValue = commentThreadInput.value;
      const commentType: CommentType = <CommentType> {
        commentThread: <CommentThreadType> { id: commentThreadInputValue.id },
        proposedStatus: commentThreadInputValue.commentersProposedStatus,
        content: commentThreadInputValue.commentersProposedText
      };
      comments.push(commentType);
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

  viewCommentThread(commentThread: CommentThread) {

    this.router.navigate([
      'commentthread',
      {
        commentRoundId: this.commentRound.id,
        commentThreadId: commentThread.id
      }
    ]);
  }

  onTabChange(event: NgbTabChangeEvent) {

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

  get canComment(): boolean {

    return this.commentsTabActive &&
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
      !this.editing &&
      this.authorizationManager.user.email === this.commentRound.user.email;
  }

  get canEndCommenting(): boolean {

    return this.commentRound.status === 'INPROGRESS' && !this.editing &&
      this.authorizationManager.user.email === this.commentRound.user.email;
  }

  get commentRoundCountTranslateParams() {

    return {
      value: this.commentRound.commentThreads.length
    };
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
}
