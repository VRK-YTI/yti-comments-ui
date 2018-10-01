import { CommentType } from '../services/api-schema';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { CommentSimple } from './comment-simple';
import { Location } from 'yti-common-ui/types/location';
import { CommentThreadSimple } from './commentthread-simple';

export class Comment extends AbstractResource {

  userId: string;
  content: string;
  proposedStatus: string;
  created: Moment | null = null;
  commentThread: CommentThreadSimple;
  parentComment: CommentSimple;

  constructor(data: CommentType) {
    super(data);
    this.userId = data.userId;
    this.content = data.content;
    this.proposedStatus = data.proposedStatus;
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    this.commentThread = new CommentThreadSimple(data.commentThread);
    if (data.parentComment) {
      this.parentComment = new CommentSimple(data.parentComment);
    }
  }

  // TODO: fix this to work with proper routing, needs round
  get route(): any[] {
    return [
      ...this.commentThread.location,
      'comment',
      {
        commentThreadId: this.commentThread.id,
        commentId: this.id
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

  serialize(): CommentType {
    return {
      id: this.id,
      url: this.url,
      content: this.content,
      userId: this.userId,
      proposedStatus: this.proposedStatus,
      created: formatDateTime(this.created),
      parentComment: this.parentComment ? this.parentComment.serialize() : undefined,
      commentThread: this.commentThread.serialize()
    };
  }

  clone(): Comment {
    return new Comment(this.serialize());
  }
}
