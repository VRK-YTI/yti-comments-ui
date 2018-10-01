import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { Comment } from '../../entity/comment';
import { CommentRound } from '../../entity/commentround';
import { CommentThread } from '../../entity/commentthread';

@Component({
  selector: 'app-comment-listitem',
  styleUrls: ['./comment-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier() + '_view_comment'}}"
         class="comment"
         (click)="viewComment()">
      <span class="title">{{comment.content}}</span>
    </div>
  `
})

export class CommentListitemComponent {

  @Input() commentRound: CommentRound;
  @Input() commentThread: CommentThread;
  @Input() comment: Comment;

  constructor(private router: Router,
              public languageService: LanguageService) {
  }

  viewComment() {
    this.router.navigate([
      'comment',
      {
        commentRoundId: this.commentRound.id,
        commentThreadId: this.commentThread.id,
        commentId: this.comment.id
      }
    ]);
  }

  getIdIdentifier() {
    return `${this.comment.id}`;
  }
}
