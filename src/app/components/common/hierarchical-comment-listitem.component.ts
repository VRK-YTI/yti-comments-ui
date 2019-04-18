import { Component, Input } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommentSimple } from '../../entity/comment-simple';
import { DataService } from '../../services/data.service';
import { CommentThreadType, CommentType } from '../../services/api-schema';
import { v4 as uuid } from 'uuid';
import { CommentRoundErrorModalService } from './error-modal.service';
import { comparingPrimitive } from 'yti-common-ui/utils/comparator';

@Component({
  selector: 'app-hierarchical-comment',
  styleUrls: ['./hiararchical-comment-listitem.component.scss'],
  template: `
    <div>
      <div class="row">
        <div class="comment">
          <span class="name">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
          <span class="created" x-ms-format-detection="none">{{ comment.createdDisplayValue }}</span>
          <span class="proposedStatus" *ngIf="comment.proposedStatus === comment.endStatus">, {{ comment.endStatus | translate }}</span>
          <span class="proposedStatus" *ngIf="comment.proposedStatus !== comment.endStatus">
            , <s>{{ comment.proposedStatus | translate }}</s> \t&#x2192; {{ comment.endStatus | translate }}</span>
          <br>
          <span class="content">{{ comment.content }}</span>
        </div>
        <div class="actions float-right">
          <button *ngIf="!this.commenting && canComment"
                  [id]="'comment_' + this.comment.id + '_reply_button'"
                  class="btn btn-secondary-action"
                  type="button"
                  (click)="toggleCommenting()">
            <span translate>Reply</span>
          </button>
        </div>
      </div>
      <div class="row">
        <app-literal-input *ngIf="this.commenting"
                           class="input col-md-6"
                           [isEditing]="this.commenting"
                           [id]="'comment' + this.comment.id + '_input'"
                           [(ngModel)]="this.commentContent"></app-literal-input>
        <div class="col-md-6">
          <button *ngIf="this.commenting && canComment"
                  [id]="'comment_' + this.comment.id + '_send_button'"
                  class="btn btn-secondary-action"
                  [disabled]="commentContent.trim().length == 0"
                  type="button"
                  (click)="sendComment()">
            <span translate>Send</span>
          </button>
          <button *ngIf="this.commenting"
                  [id]="'comment_' + this.comment.id + '_cancel_button'"
                  class="btn btn-link cancel"
                  type="button"
                  (click)="toggleCommenting()">
            <span translate>Cancel</span>
          </button>
        </div>
      </div>
    </div>
    <ul *ngIf="hasChildComments">
      <li class="child-comment" *ngFor="let childComment of childComments; trackBy: commentIdentity">
        <app-hierarchical-comment [comment]="childComment"
                                  [comments]="comments"
                                  [commentRoundId]="commentRoundId"
                                  [commentThreadId]="commentThreadId"
                                  [canComment]="canComment"></app-hierarchical-comment>
      </li>
    </ul>
  `
})
export class HierarchicalCommentListitemComponent {

  @Input() comment: CommentSimple;
  @Input() comments: CommentSimple[];
  @Input() commentRoundId: string;
  @Input() commentThreadId: string;
  @Input() canComment: boolean;

  commenting = false;
  commentContent = '';

  constructor(public languageService: LanguageService,
              private dataService: DataService,
              private errorModalService: CommentRoundErrorModalService) {
  }

  toggleCommenting() {

    if (this.commenting) {
      this.commentContent = '';
    }
    this.commenting = !this.commenting;
  }

  sendComment() {

    const id: string = uuid();
    const newComment: CommentType = <CommentType>{
      commentThread: <CommentThreadType>{ id: this.commentThreadId },
      content: this.commentContent,
      parentComment: this.comment.serialize(),
      id: id
    };

    this.dataService.createComment(this.commentRoundId, newComment).subscribe(createdComment => {
      this.toggleCommenting();
      this.comments.push(createdComment as CommentSimple);
      this.refreshComments();
    }, error => {
      this.errorModalService.openSubmitError(error);
    });
  }

  refreshComments() {

    this.dataService.getCommentRoundCommentThreadComments(this.commentRoundId, this.commentThreadId).subscribe(comments => {
      this.comments = comments;
      this.comments.sort(comparingPrimitive<CommentSimple>(comment => comment.created ? comment.created.toString() : undefined));
    }, error => {
      this.errorModalService.openSubmitError(error);
    });
  }

  get hasChildComments(): boolean {

    const childComments = this.childComments;
    return childComments != null && childComments.length > 0;
  }

  get childComments(): CommentSimple[] {

    return this.comments.filter(comment => comment.parentComment != null && comment.parentComment.id === this.comment.id);
  }

  commentIdentity(index: number, item: CommentSimple) {

    return item.id;
  }
}
