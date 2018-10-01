import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Comment } from '../../entity/comment';
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

  commentThreadForm = new FormGroup({
    label: new FormControl({}),
    definition: new FormControl({}),
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
              private locationService: LocationService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

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

    return this.authorizationManager.canCreateComment();
  }

  createNewComment() {

    this.router.navigate(
      ['createcomment',
        {
          commentRoundId: this.commentRound.id,
          commentThreadId: this.commentThread.id
        }
      ]
    );
  }

  viewComment(comment: Comment) {
    this.router.navigate([
      'comment',
      {
        commentRoundId: this.commentRound.id,
        commentThreadId: this.commentThread.id,
        commentId: comment.id
      }
    ]);
  }

  private reset() {

    const { label, definition, resourceUri, proposedStatus, proposedText }
      = this.commentThread;

    const integrationResource: IntegrationReourceType = <IntegrationReourceType> {
      uri: resourceUri
    };

    const resource: IntegrationResource = new IntegrationResource(integrationResource);

    this.commentThreadForm.reset({
      label: label,
      definition: definition,
      resource: resource,
      proposedStatus: proposedStatus == null ? 'NOSTATUS' : proposedStatus,
      proposedText: proposedText
    });
  }

  save(formData: any): Observable<any> {

    const { label, proposedText, proposedStatus, definition, resource } = formData;

    const thisCommentThread = this.commentThread.clone();

    const updatedCommentThreadType: CommentThreadType = <CommentThreadType> {
      id: thisCommentThread.id,
      url: thisCommentThread.url,
      userId: thisCommentThread.userId,
      label: label,
      definition: definition,
      proposedText: proposedText,
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
}
