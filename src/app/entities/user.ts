import { UserType } from '../services/api-schema';

export class User {

  id: string;
  email: string;
  firstName: string;
  lastName: string;

  constructor(data: UserType) {
    this.id = data.id;
    if (data.email) {
      this.email = data.email;
    }
    if (data.firstName) {
      this.firstName = data.firstName;
    }
    if (data.lastName) {
      this.lastName = data.lastName;
    }
  }

  serialize(): UserType {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    };
  }

  getDisplayName(): string {
    if (this.firstName != null && this.lastName != null) {
      return this.firstName + ' ' + this.lastName;
    } else {
      return '';
    }
  }

  getDisplayNameWithEmail(): string {
    return this.firstName + ' ' + this.lastName + ', ' + this.email;
  }
}
