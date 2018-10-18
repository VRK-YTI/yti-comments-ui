import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { CommentSimpleType } from '../services/api-schema';
import { User } from './user';

export class CommentSimple extends AbstractResource {

  user: User;
  content: string;
  proposedStatus: string;
  created: Moment | null = null;
  parentComment: CommentSimple;

  constructor(data: CommentSimpleType) {

    super(data);
    if (data.user) {
      this.user = new User(data.user);
    }
    this.content = data.content;
    this.proposedStatus = data.proposedStatus;
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    if (data.parentComment) {
      this.parentComment = new CommentSimple(data.parentComment);
    }
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  serialize(): CommentSimpleType {
    return {
      id: this.id,
      user: this.user ? this.user.serialize() : undefined,
      url: this.url,
      content: this.content,
      proposedStatus: this.proposedStatus,
      created: formatDateTime(this.created)
    };
  }

  clone(): CommentSimple {
    return new CommentSimple(this.serialize());
  }
}