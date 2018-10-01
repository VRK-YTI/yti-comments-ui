import { AbstractResource } from './abstract-resource';
import { CommentThreadType } from '../services/api-schema';
import { CommentRound } from './commentround';
import { Localizable } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { Location } from 'yti-common-ui/types/location';

export class CommentThread extends AbstractResource {

  resourceUri: string;
  label: Localizable = {};
  definition: Localizable = {};
  proposedText: string;
  proposedStatus: string;
  userId: string;
  created: Moment | null = null;
  commentRound: CommentRound;

  constructor(data: CommentThreadType) {

    super(data);
    this.resourceUri = data.resourceUri;
    this.label = data.label || {};
    this.definition = data.definition || {};
    this.proposedText = data.proposedText;
    this.proposedStatus = data.proposedStatus;
    this.userId = data.userId;
    if (data.created) {
      this.created = parseDateTime(data.created);
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
        label: this.label,
        value: undefined,
        route: this.route
      }
    ];
  }

  serialize(): CommentThreadType {
    return {
      id: this.id,
      url: this.url,
      userId: this.userId,
      resourceUri: this.resourceUri,
      definition: this.definition,
      created: formatDateTime(this.created),
      label: this.label,
      proposedText: this.proposedText,
      proposedStatus: this.proposedStatus,
      commentRound: this.commentRound.serialize()
    };
  }

  clone(): CommentThread {
    return new CommentThread(this.serialize());
  }
}
