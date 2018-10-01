import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { CommentSimpleType, CommentType } from '../services/api-schema';
import { Location } from 'yti-common-ui/types/location';

export class CommentSimple extends AbstractResource {

  userId: string;
  content: string;
  proposedStatus: string;
  created: Moment | null = null;
  parentComment: CommentSimple;

  constructor(data: CommentSimpleType) {

    super(data);
    this.userId = data.userId;
    this.content = data.content;
    this.proposedStatus = data.proposedStatus;
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    if (data.parentComment) {
      this.parentComment = new CommentSimple(data.parentComment);
    }
  }

  // TODO: fix this to work with proper routing, needs round and thread ids
  get route(): any[] {

    return [
      'comment',
      {
        commentRoundId: this.id
      }
    ];
  }

  get location(): Location[] {

    return [
      {
        localizationKey: 'Comment',
        label: {},
        value: this.content,
        route: this.route
      }
    ];
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  serialize(): CommentSimpleType {
    return {
      id: this.id,
      url: this.url,
      content: this.content,
      proposedStatus: this.proposedStatus,
      userId: this.userId,
      created: formatDateTime(this.created)
    };
  }

  clone(): CommentSimple {
    return new CommentSimple(this.serialize());
  }
}
