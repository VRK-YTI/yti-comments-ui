import { Injectable } from '@angular/core';
import { UserService } from 'yti-common-ui/services/user.service';
import { EditableEntity } from '../entity/editable-entity';
import { CommentRound } from '../entity/commentround';

@Injectable()
export class AuthorizationManager {

  constructor(private userService: UserService) {
  }

  get user() {

    return this.userService.user;
  }

  canEdit(editableEntity: EditableEntity): boolean {

    if (this.user.superuser) {
      return true;
    }
    if (editableEntity.allowUserEdit() && this.user.email === editableEntity.getUser().email) {
      return true;
    }
    if (editableEntity.allowOrganizationEdit()) {
      return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(),
        ['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR']);
    }
    return false;
  }

  canCreateCommentRound() {

    return this.user.superuser ||
      (this.user.isInRoleInAnyOrganization(['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR']));
  }

  canCreateCommentThread() {

    return this.user.superuser ||
      (this.user.isInRoleInAnyOrganization(['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR']));
  }

  canCreateComment(editableEntity: EditableEntity) {

    if (this.user.superuser || this.user.email === editableEntity.getUser().email) {
      return true;
    }
    if (editableEntity.allowOrganizationComment()) {
      return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(),
        ['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR']);
    }
    return false;
  }

  canDeleteCommentRound(commentRound: CommentRound) {

    return this.user.superuser || this.user.email === commentRound.user.email;
  }
}
