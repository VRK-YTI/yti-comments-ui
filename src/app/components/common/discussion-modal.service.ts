import { Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';
import { CommentSimple } from '../../entity/comment-simple';

@Component({
  selector: 'app-discussion-modal',
  styleUrls: ['./discussion-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>

    <div class="modal-body full-height">
      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div *ngFor="let comment of comments">
              <div>
                <span class="commenter">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
                <span class="created">{{ comment.createdDisplayValue }}</span>
                <span class="proposedStatus">, {{ comment.proposedStatus | translate }}</span>
              </div>
              <div>
                <span class="content">{{ comment.content }}</span>
              </div>
              <div *ngIf="hasChildComments(comment.id)">
                <!-- TODO: proper recursion via new component here -->
                <span>Has child comments!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()">
        <span translate>Cancel</span>
      </button>
    </div>
  `
})
export class DiscussionModalComponent {

  @Input() comments: CommentSimple[];
  @Input() titleLabel: string;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService) {
  }

  hasChildComments(parentCommentId: string): boolean {
    const childComments = this.childComments(parentCommentId);
    return childComments != null && childComments.length > 0;
  }

  childComments(parentCommentId: string): CommentSimple[] {
    return this.comments.filter(comment => comment.parentComment != null && comment.parentComment.id === parentCommentId);
  }

  cancel() {

    this.modal.dismiss('cancel');
  }
}

@Injectable()
export class DiscussionModalService {

  constructor(private modalService: ModalService) {
  }

  open(comments: CommentSimple[],
       titleLabel: string) {

    const modalRef = this.modalService.open(DiscussionModalComponent, { size: 'lg' });
    const instance = modalRef.componentInstance as DiscussionModalComponent;
    instance.comments = comments;
    instance.titleLabel = titleLabel;
    return modalRef.result;
  }
}
