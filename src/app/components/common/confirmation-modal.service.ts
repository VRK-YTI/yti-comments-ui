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
}
