import { CommentType } from '../services/api-schema';
import { formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';

export class Comment extends AbstractResource {

  userId: string;
  resourceUri: string;
  resourceSuggestion: string;
  content: string;
  proposedStatus: string;
  created: Moment | null = null;

  constructor(data: CommentType) {
    super(data);
    this.userId = data.userId;
    this.resourceUri = data.resourceUri;
    this.resourceSuggestion = data.resourceSuggestion;
    this.content = data.content;
    this.proposedStatus = data.proposedStatus;
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
  }

  get createdDisplayValue(): string {
    return formatDisplayDateTime(this.created);
  }
}
