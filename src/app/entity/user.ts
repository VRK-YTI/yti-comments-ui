import { UserType } from '../services/api-schema';

export class User {

  id: string;
  email: string;
  firstName: string;
  lastName: string;

  constructor(data: UserType) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
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
    return this.firstName + ' ' + this.lastName + ', ' + this.email;
  }
}
