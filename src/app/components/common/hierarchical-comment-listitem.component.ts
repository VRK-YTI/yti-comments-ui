import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../services/language.service';
import { CommentSimple } from '../../entity/comment-simple';

@Component({
  selector: 'app-hierarchical-comment',
  styleUrls: ['./hiararchical-comment-listitem.component.scss'],
  template: `
    <div>
      <span class="name">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
      <span class="created">{{ comment.createdDisplayValue }}</span>
      <span class="proposedStatus" *ngIf="comment.proposedStatus">, {{ comment.proposedStatus | translate }}</span>
    </div>
    <div>
      <span class="content">{{ comment.content }}</span>
    </div>
    <ul *ngIf="hasChildComments">
      <li class="child-comment" *ngFor="let childComment of childComments; trackBy: commentIdentity">
        <app-hierarchical-comment [comment]="childComment" [comments]="comments"></app-hierarchical-comment>
      </li>
    </ul>
  `
})
export class HierarchicalCommentListitemComponent {

  @Input() comment: CommentSimple;
  @Input() comments: CommentSimple[];

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService) {
  }

  get hasChildComments(): boolean {

    const childComments = this.childComments;
    return childComments != null && childComments.length > 0;
  }

  get childComments(): CommentSimple[] {

    return this.comments.filter(comment => comment.parentComment != null && comment.parentComment.id === this.comment.id);
  }

  cancel() {

    this.modal.dismiss('cancel');
  }

  commentIdentity(index: number, item: CommentSimple) {
    return item.id;
  }
}
