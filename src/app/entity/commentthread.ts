import { AbstractResource } from './abstract-resource';
import { CommentThreadType } from '../services/api-schema';
import { CommentRound } from './commentround';
import { Localizable } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime } from '../utils/date';
import { Moment, utc } from 'moment';
import { Location } from 'yti-common-ui/types/location';
import { User } from './user';
import { CommentThreadResult } from './commentthreadresult';

export class CommentThread extends AbstractResource {

  resourceUri: string;
  label: Localizable = {};
  description: Localizable = {};
  proposedText: string;
  currentStatus: string | undefined;
  proposedStatus: string;
  user: User;
  created: Moment | null = null;
  commentRound: CommentRound;
  results: CommentThreadResult[];
  commentCount: number;

  constructor(data: CommentThreadType) {

    super(data);
    this.resourceUri = data.resourceUri;
    this.label = data.label || {};
    this.description = data.description || {};
    this.proposedText = data.proposedText;
    this.currentStatus = data.currentStatus;
    this.proposedStatus = data.proposedStatus;
    this.commentCount = data.commentCount;
    if (data.user) {
      this.user = new User(data.user);
    }
    if (data.created) {
      this.created = utc(data.created);
    }
    if (data.results) {
      this.results = (data.results || []).map(result => new CommentThreadResult(result));
    }
    this.commentRound = new CommentRound(data.commentRound);
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  get route(): any[] {

    return [
      'commentthread',
      {
        commentRoundId: this.commentRound.id,
        commentThreadId: this.id
      }
    ];
  }

  get location(): Location[] {

    return [
      ...this.commentRound.location,
      {
        localizationKey: 'Comment thread',
        label: undefined,
        value: undefined,
        route: this.route
      }
    ];
  }

  serialize(): CommentThreadType {

    return {
      id: this.id,
      url: this.url,
      user: this.user ? this.user.serialize() : undefined,
      resourceUri: this.resourceUri,
      description: this.description,
      created: formatDateTime(this.created),
      label: this.label,
      proposedText: this.proposedText,
      currentStatus: this.currentStatus,
      proposedStatus: this.proposedStatus,
      commentRound: this.commentRound.serialize(),
      results: this.results.map(result => result.serialize()),
      commentCount: this.commentCount
    };
  }

  clone(): CommentThread {

    return new CommentThread(this.serialize());
  }
}
