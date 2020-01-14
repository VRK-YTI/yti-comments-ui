import { TempUserType } from '../services/api-schema';

export class TempUser {

  id: string;
  firstName: string;
  lastName: string;
  email: string;
  commentRoundUri: string;

  constructor(data: TempUserType) {

    if (data.id) {
      this.id = data.id;
    }
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.commentRoundUri = data.commentRoundUri;
  }

  serialize(): TempUserType {

    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      commentRoundUri: this.commentRoundUri
    };
  }

  getDisplayName(): string {

    return this.firstName + ' ' + this.lastName;
  }

  clone(): TempUser {
    return new TempUser(this.serialize());
  }
}
