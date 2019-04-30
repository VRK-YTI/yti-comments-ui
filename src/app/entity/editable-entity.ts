import { User } from './user';

export interface EditableEntity {
  getOwningOrganizationIds(): string[];

  allowOrganizationEdit(): boolean;

  allowOrganizationComment(): boolean;

  getUser(): User;

  allowUserEdit(): boolean;
}
