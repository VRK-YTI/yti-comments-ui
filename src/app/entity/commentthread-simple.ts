import { AbstractResource } from './abstract-resource';
import { CommentThreadSimpleType } from '../services/api-schema';
import { Localizable } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { Location } from 'yti-common-ui/types/location';

export class CommentThreadSimple extends AbstractResource {

  resourceUri: string;
  label: Localizable = {};
  definition: Localizable = {};
  proposedText: string;
  proposedStatus: string;
  userId: string;
  created: Moment | null = null;

  constructor(data: CommentThreadSimpleType) {

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
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  // TODO: fix this to work with proper routing, needs round id
  get route(): any[] {

    return [
      'commentthread',
      {
        commentThreadId: this.id
      }
    ];
  }

  // TODO: fix this to work with proper routing, needs round location
  get location(): Location[] {

    return [
      {
        localizationKey: 'Comment thread',
        label: this.label,
        value: undefined,
        route: this.route
      }
    ];
  }

  serialize(): CommentThreadSimpleType {
    return {
      id: this.id,
      url: this.url,
      userId: this.userId,
      resourceUri: this.resourceUri,
      definition: this.definition,
      created: formatDateTime(this.created),
      label: this.label,
      proposedText: this.proposedText,
      proposedStatus: this.proposedStatus
    };
  }

  clone(): CommentThreadSimple {
    return new CommentThreadSimple(this.serialize());
  }
}
