import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { CommentThread } from '../../entity/commentthread';
import { CommentRound } from '../../entity/commentround';

@Component({
  selector: 'app-comment-thread-listitem',
  styleUrls: ['./comment-thread-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier() + '_view_commentround'}}"
         class="commentThread"
         (click)="viewCommentThread()">
      <span class="title">{{commentThread.label | translateValue}}</span>
    </div>
  `
})

export class CommentThreadListitemComponent {

  @Input() commentRound: CommentRound;
  @Input() commentThread: CommentThread;

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  viewCommentThread() {
    this.router.navigate([
      'commentthread',
      {
        commentRoundId: this.commentRound.id,
        commentThreadId: this.commentThread.id
      }
    ]);
  }

  getIdIdentifier() {
    return `${this.commentThread.id}`;
  }
}
