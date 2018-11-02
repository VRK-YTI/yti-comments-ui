import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { LocationService } from '../../services/location.service';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { CommentType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { Comment } from '../../entity/comment';
import { AuthorizationManager } from '../../services/authorization-manager';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  providers: [EditableService]
})
export class CommentComponent implements OnInit, OnChanges, OnDestroy {

  comment: Comment;

  cancelSubscription: Subscription;

  commentForm = new FormGroup({
    content: new FormControl(''),
    proposedStatus: new FormControl(''),
    parentComment: new FormControl(null)
  }, null);

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService,
              private locationService: LocationService,
              private location: Location,
              private authorizationManager: AuthorizationManager,
              private configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {
    const commentRoundId = this.route.snapshot.params.commentRoundId;
    const commentThreadId = this.route.snapshot.params.commentThreadId;
    const commentId = this.route.snapshot.params.commentId;

    if (!commentRoundId || !commentThreadId || !commentId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}', commentThread: '${commentThreadId}', comment: '${commentId}'`);
    }

    this.dataService.getCommentRoundCommentThreadComment(commentRoundId, commentThreadId, commentId).subscribe(comment => {
      this.comment = comment;
      this.locationService.atCommentPage(comment);
      this.reset();
    });
  }

  canCreateComment() {

    return this.authorizationManager.canCreateComment(this.comment.commentThread.commentRound);
  }

  createNewComment() {

    this.router.navigate(
      ['createcomment',
        {
          commentRoundId: this.comment.commentThread.commentRound.id,
          commentThreadId: this.comment.commentThread.id,
          parentCommentId: this.comment.id
        }
      ]
    );
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.reset();
  }

  private reset() {

    const { content, proposedStatus, parentComment }
      = this.comment;

    this.commentForm.reset({
      content: content,
      proposedStatus: proposedStatus == null ? 'NOSTATUS' : proposedStatus,
      parentComment: parentComment,
      commentThread: this.comment.commentThread
    });
  }

  save(formData: any): Observable<any> {

    const { content, proposedStatus, parentComment } = formData;

    const thisComment = this.comment.clone();

    const updatedCommentType: CommentType = <CommentType> {
      id: thisComment.id,
      url: thisComment.url,
      user: thisComment.user.serialize(),
      content: content,
      proposedStatus: proposedStatus !== 'NOSTATUS' ? proposedStatus : null,
      parentComment: parentComment,
      commentThread: this.comment.commentThread.serialize()
    };

    const updatedComment: Comment = new Comment(updatedCommentType);

    const save = () => {
      return this.dataService.updateComment(this.comment.commentThread.commentRound.id,
        updatedComment.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    return save();
  }

  get loading(): boolean {

    return this.comment == null;
  }

  get resourceUri(): string | null {

    return this.configurationService.getUriWithEnv(this.comment.commentThread.resourceUri);
  }
}
