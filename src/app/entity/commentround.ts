import { CommentRoundType } from '../services/api-schema';
import { formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { Source } from './source';

export class CommentRound extends AbstractResource {

  userId: string;
  label: string;
  description?: string;
  source: Source;
  created: Moment | null = null;
  modified: Moment | null = null;
  startDate: Moment | null = null;
  endDate: Moment | null = null;

  constructor(data: CommentRoundType) {
    super(data);
    this.userId = data.userId;
    this.label = data.label;
    this.description = data.description;
    if (data.source) {
      this.source = new Source(data.source);
    }
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
  }

  get createdDisplayValue(): string {
    return formatDisplayDateTime(this.created);
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }
}
