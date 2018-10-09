import { ConfirmationModalService } from 'yti-common-ui/components/confirmation-modal.component';
import { Injectable } from '@angular/core';

@Injectable()
export class CommentsConfirmationModalService {

  constructor(private confirmationModalService: ConfirmationModalService) {
  }

  startCommentRound() {
    return this.confirmationModalService.open('START COMMENT ROUND?', '');
  }

  closeCommentRound() {
    return this.confirmationModalService.open('CLOSE COMMENT ROUND?', '');
  }
}
