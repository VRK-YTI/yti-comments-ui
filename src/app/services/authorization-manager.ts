import { Injectable } from '@angular/core';
import { UserService } from 'yti-common-ui/services/user.service';
import { EditableEntity } from '../entities/editable-entity';
import { CommentRound } from '../entities/commentround';

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
      if (this.user.tokenRole === 'MEMBER' && this.user.containerUri === editableEntity.getContainerUri()) {
        return true;
      }
      return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(),
        ['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR', 'MEMBER']);
    }
    return false;
  }

  canCreateCommentRound() {

    return this.user.superuser ||
      this.user.isInRoleInAnyOrganization(['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR']);
  }

  canCreateCommentThread(editableEntity: EditableEntity) {

    if (this.user.superuser || this.user.email === editableEntity.getUser().email) {
      return true;
    }
    if (editableEntity.allowOrganizationEdit()) {
      if (this.user.tokenRole === 'MEMBER' && this.user.containerUri === editableEntity.getContainerUri()) {
        return true;
      }
      return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(),
        ['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR', 'MEMBER']);
    }
    return false;
  }

  canCreateComment(editableEntity: EditableEntity) {

    if (this.user.superuser || this.user.email === editableEntity.getUser().email) {
      return true;
    }
    if (editableEntity.allowOrganizationComment()) {
      if (this.user.tokenRole === 'MEMBER' && this.user.containerUri === editableEntity.getContainerUri()) {
        return true;
      }
      return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(),
        ['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR', 'MEMBER']);
    }
    return false;
  }

  canDeleteCommentRound(commentRound: CommentRound) {

    return this.user.superuser || this.user.email === commentRound.user.email;
  }
}
