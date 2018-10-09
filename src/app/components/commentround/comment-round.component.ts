import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../../entity/commentround';
import { DataService } from '../../services/data.service';
import { CommentThread } from '../../entity/commentthread';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup } from '@angular/forms';
import { validDateRange } from '../../utils/date';
import { CommentRoundStatus } from '../../entity/comment-round-status';
import { requiredList } from 'yti-common-ui/utils/validator';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { CommentThreadSimple } from '../../entity/commentthread-simple';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { ErrorModalService } from 'yti-common-ui/components/error-modal.component';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';

@Component({
  selector: 'app-commentround',
  templateUrl: './comment-round.component.html',
  styleUrls: ['./comment-round.component.scss'],
  providers: [EditableService]
})
export class CommentRoundComponent implements OnInit, OnChanges, OnDestroy {

  commentRound: CommentRound;
  commentThreads: CommentThreadSimple[];

  cancelSubscription: Subscription;

  commentRoundForm = new FormGroup({
    label: new FormControl(''),
    description: new FormControl(''),
    fixedThreads: new FormControl(),
    openThreads: new FormControl(),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('AWAIT' as CommentRoundStatus),
    organizations: new FormControl([], [requiredList])
  }, null);

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private editableService: EditableService,
              private locationService: LocationService,
              private location: Location,
              private authorizationManager: AuthorizationManager,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: ErrorModalService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const commentRoundId = this.route.snapshot.params.commentRoundId;

    if (!commentRoundId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}'`);
    }

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
      this.locationService.atCommentRoundPage(commentRound);
      this.reset();
    });

    this.dataService.getCommentRoundCommentThreads(commentRoundId).subscribe(commentThreads => {
      this.commentThreads = commentThreads;
    });
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.reset();
  }

  canCreateCommentThread() {

    if (this.commentRound.status === 'AWAIT') {
      return this.authorizationManager.user.email === this.commentRound.user.email;
    } else if (this.commentRound.status === 'INPROGRESS' && !this.commentRound.fixedThreads) {
      return this.authorizationManager.canCreateCommentThread();
    }
    return false;
  }

  startCommentRound() {

    this.confirmationModalService.startCommentRound()
      .then(() => {
        this.commentRound.status = 'INPROGRESS';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.ngOnInit();
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  closeCommentRound() {

    this.confirmationModalService.startCommentRound()
      .then(() => {
        this.commentRound.status = 'CLOSED';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.ngOnInit();
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  createNewCommentThread() {

    this.router.navigate(
      ['createcommentthread',
        {
          commentRoundId: this.commentRound.id
        }
      ]
    );
  }

  private reset() {

    const { label, description, fixedThreads, openThreads, startDate, endDate, organizations, status }
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
  }

  save(formData: any): Observable<any> {

    const { label, description, fixedThreads, openThreads, validity, organizations, status } = formData;

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
      status: status
    });

    const save = () => {
      return this.dataService.updateCommentRound(updatedCommentRound.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    return save();
  }

  get editing() {

    return this.editableService.editing;
  }

  get loading() {

    return this.commentRound == null || this.commentThreads == null;
  }

  get getResourceUri(): string {

    return this.commentRound.source.containerUri;
  }

  get hasCommentThreads(): boolean {

    return this.commentThreads && this.commentThreads.length > 0;
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

  back() {

    this.location.back();
  }
}
