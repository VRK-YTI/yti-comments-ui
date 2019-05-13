import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommentSimple } from '../../entity/comment-simple';
import { DataService } from '../../services/data.service';
import { CommentThreadType, CommentType } from '../../services/api-schema';
import { v4 as uuid } from 'uuid';
import { CommentRoundErrorModalService } from './error-modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-hierarchical-comment',
  styleUrls: ['./hiararchical-comment-listitem.component.scss'],
  template: `
    <div>
      <div class="row">
        <div class="comment" x-ms-format-detection="none">
          <span class="name">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
          <span class="created">{{ comment.createdDisplayValue }}</span>
          <span *ngIf="comment.proposedStatus != null && comment.proposedStatus === comment.endStatus"
                class="proposedStatus">, {{ comment.endStatus | translate }}</span>
          <span *ngIf="comment.proposedStatus !== comment.endStatus"
                class="proposedStatus"
          >, <s>{{ comment.proposedStatus | translate }}</s> \t&#x2192; {{ comment.endStatus | translate }}</span>
          <span class="actions float-right"
                *ngIf="!this.commenting && canComment"
                [id]="'comment_' + this.comment.id + '_reply_button'"
                (click)="toggleCommenting()"
                translate>Reply</span>
          <br>
          <span class="content">{{ comment.content }}</span>
        </div>
      </div>
      <div class="row">
        <app-literal-input *ngIf="this.commenting"
                           class="input col-md-6"
                           [isEditing]="this.commenting"
                           [id]="'comment_' + this.comment.id + '_input'"
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
        <app-hierarchical-comment (refreshComments)="emitRefreshComments()"
                                  [id]="childComment.id"
                                  [comment]="childComment"
                                  [comments]="comments"
                                  [commentRoundId]="commentRoundId"
                                  [commentThreadId]="commentThreadId"
                                  [activeCommentId$]="activeCommentId$"
                                  [canComment]="canComment"></app-hierarchical-comment>
      </li>
    </ul>
  `
})
export class HierarchicalCommentListitemComponent implements OnInit {

  @Input() comment: CommentSimple;
  @Input() comments: CommentSimple[];
  @Input() commentRoundId: string;
  @Input() commentThreadId: string;
  @Input() canComment: boolean;
  @Input() activeCommentId$ = new BehaviorSubject<string | null>(null);
  @Output() refreshComments = new EventEmitter<string>();

  commenting = false;
  commentContent = '';

  constructor(public languageService: LanguageService,
              private dataService: DataService,
              private errorModalService: CommentRoundErrorModalService) {
  }

  ngOnInit() {

    this.activeCommentId$.subscribe(activeCommentId => {
      if (activeCommentId !== this.comment.id) {
        this.commentContent = '';
        this.commenting = false;
      }
    });
  }

  toggleCommenting() {

    if (this.commenting) {
      this.commentContent = '';
    }
    if (!this.commenting) {
      this.commentContent = '';
      this.activeCommentId$.next(this.comment.id);
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
      this.refreshComments.emit(this.commentThreadId);
    }, error => {
      this.errorModalService.openSubmitError(error);
    });
  }

  emitRefreshComments() {
    this.refreshComments.emit(this.commentThreadId);
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
