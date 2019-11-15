import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment, utc } from 'moment';
import { AbstractResource } from './abstract-resource';
import { CommentSimpleType } from '../services/api-schema';
import { User } from './user';

export class CommentSimple extends AbstractResource {

  user: User;
  content: string;
  proposedStatus: string;
  endStatus: string;
  created: Moment | null = null;
  modified: Moment | null = null;
  parentComment: CommentSimple;
  expanded: boolean;

  constructor(data: CommentSimpleType) {

    super(data);
    if (data.user) {
      this.user = new User(data.user);
    }
    this.content = data.content;
    this.proposedStatus = data.proposedStatus;
    this.endStatus = data.endStatus;
    if (data.created) {
      this.created = utc(data.created);
    }
    if (data.modified) {
      this.modified = utc(data.modified);
    }
    if (data.parentComment) {
      this.parentComment = new CommentSimple(data.parentComment);
    }
    this.expanded = true;
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  get modifiedDisplayValue(): string {

    return formatDisplayDateTime(this.modified);
  }

  serialize(): CommentSimpleType {
    return {
      id: this.id,
      url: this.url,
      uri: this.uri,
      sequenceId: this.sequenceId,
      user: this.user ? this.user.serialize() : undefined,
      content: this.content,
      proposedStatus: this.proposedStatus,
      endStatus: this.endStatus,
      created: formatDateTime(this.created),
      modified: formatDateTime(this.modified)
    };
  }

  clone(): CommentSimple {

    return new CommentSimple(this.serialize());
  }
}
