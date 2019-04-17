import { CommentType } from '../services/api-schema';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { CommentSimple } from './comment-simple';
import { Location } from 'yti-common-ui/types/location';
import { User } from './user';
import { EditableEntity } from './editable-entity';
import { CommentThread } from './commentthread';

export class Comment extends AbstractResource implements EditableEntity {

  user: User;
  content: string;
  proposedStatus: string;
  created: Moment | null = null;
  commentThread: CommentThread;
  parentComment: CommentSimple;

  constructor(data: CommentType) {

    super(data);
    if (data.user) {
      this.user = new User(data.user);
    }
    this.content = data.content;
    if (data.proposedStatus) {
      this.proposedStatus = data.proposedStatus;
    }
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    this.commentThread = new CommentThread(data.commentThread);
    if (data.parentComment) {
      this.parentComment = new CommentSimple(data.parentComment);
    }
  }

  get route(): any[] {

    return [
      ...this.commentThread.location,
      'comment',
      {
        commentRoundId: this.commentThread.commentRound.id,
        commentThreadId: this.commentThread.id,
        commentId: this.id
      }
    ];
  }

  get location(): Location[] {

    return [
      ...this.commentThread.location,
      {
        localizationKey: 'Comment',
        label: undefined,
        value: undefined,
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
      user: this.user ? this.user.serialize() : undefined,
      proposedStatus: this.proposedStatus,
      created: formatDateTime(this.created),
      parentComment: this.parentComment ? this.parentComment.serialize() : undefined,
      commentThread: this.commentThread.serialize()
    };
  }

  clone(): Comment {

    return new Comment(this.serialize());
  }

  allowUserEdit(): boolean {

    return true;
  }

  getUser(): User {

    return this.user;
  }

  allowOrganizationEdit(): boolean {

    // TODO: Implement backend support for comment commentthread commentround, returning true for now.
    // return this.commentThread.commentRound.organizations.map(org => org.id);
    return true;
  }

  getOwningOrganizationIds(): string[] {

    return [];
  }
}
