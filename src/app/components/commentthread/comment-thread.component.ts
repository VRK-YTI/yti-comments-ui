import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommentRound } from '../../entity/commentround';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthorizationManager } from '../../services/authorization-manager';
import { EditableService } from '../../services/editable.service';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { CommentThreadType, IntegrationReourceType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { CommentThread } from '../../entity/commentthread';
import { IntegrationResource } from '../../entity/integration-resource';
import { LocationService } from '../../services/location.service';
import { CommentSimple } from '../../entity/comment-simple';
import { Localizable } from 'yti-common-ui/types/localization';
import { DiscussionModalService } from '../common/discussion-modal.service';

@Component({
  selector: 'app-comment-thread',
  templateUrl: './comment-thread.component.html',
  styleUrls: ['./comment-thread.component.scss'],
  providers: [EditableService]
})
export class CommentThreadComponent implements OnInit {

  commentRound: CommentRound;
  commentThread: CommentThread;
  comments: CommentSimple[];

  cancelSubscription: Subscription;
  resourceChangeSubscription: Subscription;

  commentThreadForm = new FormGroup({
    label: new FormControl({}),
    description: new FormControl({}),
    proposedText: new FormControl(''),
    proposedStatus: new FormControl(''),
    resource: new FormControl(null)
  }, null);

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private authorizationManager: AuthorizationManager,
              private editableService: EditableService,
              private location: Location,
              private locationService: LocationService,
              private discussionModalService: DiscussionModalService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    this.resourceChangeSubscription = this.commentThreadForm.controls['resource'].valueChanges
      .subscribe(data => this.updateResourceData());

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const commentRoundId = this.route.snapshot.params.commentRoundId;
    const commentThreadId = this.route.snapshot.params.commentThreadId;

    if (!commentRoundId || !commentThreadId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}', commentThread: '${commentThreadId}'`);
    }

    this.dataService.getCommentRoundCommentThread(commentRoundId, commentThreadId).subscribe(commentThread => {
      this.commentThread = commentThread;
      this.locationService.atCommentThreadPage(commentThread);
      this.reset();
    });

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
    });

    this.dataService.getCommentRoundCommentThreadComments(commentRoundId, commentThreadId).subscribe(comments => {
      this.comments = comments;
    });
  }

  get loading() {

    return this.commentRound == null || this.commentThread == null || this.comments == null;
  }

  canCreateComment() {

    return this.authorizationManager.canCreateComment(this.commentRound);
  }

  createNewComment(parentCommentId: string) {

    this.router.navigate(
      ['createcomment',
        {
          commentRoundId: this.commentRound.id,
          commentThreadId: this.commentThread.id,
          parentCommentId: parentCommentId
        }
      ]
    );
  }

  hasChildComments(parentCommentId: string): boolean {

    const childComments = this.childComments(parentCommentId);
    return childComments != null && childComments.length > 0;
  }

  childComments(parentCommentId: string): CommentSimple[] {

    return this.comments.filter(comment => comment.parentComment != null && comment.parentComment.id === parentCommentId);
  }

  childCommentsWithParent(parentCommentId: string): CommentSimple[] {

    return this.comments.filter(comment => comment.id === parentCommentId ||
      comment.parentComment != null && comment.parentComment.id === parentCommentId);
  }

  showChildComments(parentCommentId: string) {

    const titleLabel = 'Discussion';
    this.discussionModalService.open(this.childCommentsWithParent(parentCommentId), titleLabel);
  }

  get baseLevelComments(): CommentSimple[] {

    return this.comments.filter(comment => comment.parentComment == null);
  }

  get allowInput(): boolean {

    return this.getResource == null && this.commentRound.openThreads;
  }

  updateResourceData() {

    const resource = this.commentThreadForm.controls['resource'].value;
    if (resource) {
      this.commentThreadForm.patchValue({ label: resource.prefLabel });
      this.commentThreadForm.patchValue({ description: resource.description });
      this.commentThread.currentStatus = resource.status;
    } else {
      this.commentThreadForm.patchValue({ label: {} });
      this.commentThreadForm.patchValue({ description: {} });
      this.commentThread.currentStatus = undefined;
    }
  }

  get getLabel(): Localizable {

    const label = this.commentThreadForm.controls['label'].value;
    if (label) {
      return label;
    }
    return {};
  }

  get getDescription(): Localizable {

    const description = this.commentThreadForm.controls['description'].value;
    if (description) {
      return description;
    }
    return {};
  }

  get hasResource(): boolean {

    return !!this.commentThreadForm.controls['resource'].value;
  }

  get getResourceUri(): string {

    return this.commentThreadForm.controls['resource'].value ? this.commentThreadForm.controls['resource'].value.uri : '-';
  }

  get getResource(): IntegrationResource {

    return this.commentThreadForm.controls['resource'].value;
  }

  private reset() {

    const { label, description, resourceUri, currentStatus, proposedStatus, proposedText }
      = this.commentThread;

    const integrationResource: IntegrationReourceType = <IntegrationReourceType> {
      uri: resourceUri,
      prefLabel: label,
      description: description,
      status: currentStatus
    };

    const resource: IntegrationResource = new IntegrationResource(integrationResource);

    this.commentThreadForm.reset({
      label: label,
      description: description,
      resource: resource,
      proposedStatus: proposedStatus == null ? 'NOSTATUS' : proposedStatus,
      proposedText: proposedText
    });
  }

  save(formData: any): Observable<any> {

    const { label, description, proposedText, proposedStatus, resource } = formData;

    const thisCommentThread = this.commentThread.clone();

    const updatedCommentThreadType: CommentThreadType = <CommentThreadType> {
      id: thisCommentThread.id,
      url: thisCommentThread.url,
      user: thisCommentThread.user.serialize(),
      label: label,
      description: description,
      proposedText: proposedText,
      currentStatus: thisCommentThread.currentStatus,
      proposedStatus: proposedStatus !== 'NOSTATUS' ? proposedStatus : null,
      resourceUri: resource.uri,
      created: null,
      commentRound: this.commentRound.serialize()
    };

    const updatedCommentThread: CommentThread = new CommentThread(updatedCommentThreadType);

    const save = () => {
      return this.dataService.updateCommentThread(updatedCommentThread.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    return save();
  }

  get editing() {

    return this.editableService.editing;
  }

  back() {

    this.location.back();
  }

  get hasComments(): boolean {

    return this.comments && this.comments.length > 0;
  }

  viewComment(comment: CommentSimple) {

    this.router.navigate([
      'comment',
      {
        commentRoundId: this.commentThread.commentRound.id,
        commentThreadId: this.commentThread.id,
        commentId: comment.id
      }
    ]);
  }

}
