import { Component, Input } from '@angular/core';
import { CommentRoundStatus } from '../../entity/comment-round-status';

@Component({
  selector: 'app-commentround-status',
  styleUrls: ['./comment-round-status.component.scss'],
  template: `
    <span [class.bg-danger]="danger"
          [class.bg-pending]="awaitOrIncomplete"
          [class.bg-warning]="warning"
          [class.bg-success]="success">{{status | translate}}</span>
  `
})
export class CommentRoundStatusComponent {

  @Input() status: string;

  get incomplete() {
    return this.status === 'INCOMPLETE' as CommentRoundStatus;
  }

  get awaitOrIncomplete() {
    return this.status === 'AWAIT' || this.status === 'INCOMPLETE' as CommentRoundStatus;
  }

  get danger() {
    return this.status === 'ENDED' as CommentRoundStatus;
  }

  get warning() {
    return this.status === 'CLOSED' as CommentRoundStatus;
  }

  get success() {
    return this.status === 'INPROGRESS' as CommentRoundStatus;
  }
}
