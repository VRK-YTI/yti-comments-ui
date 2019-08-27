import { ConfirmationModalService } from 'yti-common-ui/components/confirmation-modal.component';
import { Injectable } from '@angular/core';

@Injectable()
export class CommentsConfirmationModalService {

  constructor(private confirmationModalService: ConfirmationModalService) {
  }

  openEditInProgress() {
    return this.confirmationModalService.openEditInProgress();
  }

  startCommentRound() {
    return this.confirmationModalService.open('START COMMENT ROUND?', '');
  }

  closeCommentRound() {
    return this.confirmationModalService.open('CLOSE COMMENT ROUND?', '');
  }

  deleteCommentRound() {
    return this.confirmationModalService.open('DELETE COMMENT ROUND?', '');
  }

  deleteCommentThread() {
    return this.confirmationModalService.open('DELETE COMMENT THREAD?', '');
  }

  deleteComment() {
    return this.confirmationModalService.open('DELETE COMMENT?', '');
  }

  sendPartialComments() {
    return this.confirmationModalService.open('SEND COMMENTS?',
      '', 'You have not commented all resources. Are you sure you want to send partial comments?');
  }
}
