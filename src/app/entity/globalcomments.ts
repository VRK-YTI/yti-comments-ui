import { GlobalCommentsType } from '../services/api-schema';
import { formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { Source } from './source';

export class GlobalComments extends AbstractResource {

  created: Moment | null = null;
  source: Source;

  constructor(data: GlobalCommentsType) {
    super(data);
    if (data.source) {
      this.source = new Source(data.source);
    }
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
  }

  get createdDisplayValue(): string {
    return formatDisplayDateTime(this.created);
  }
}
