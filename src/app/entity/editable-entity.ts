import { User } from './user';

export interface EditableEntity {
  getOwningOrganizationIds(): string[];

  allowOrganizationEdit(): boolean;

  getUser(): User;

  allowUserEdit(): boolean;
}
