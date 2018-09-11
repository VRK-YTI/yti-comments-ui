import * as moment from 'moment';
import { Moment } from 'moment';

export function assertValid(value: Moment): Moment {
  if (value.isValid()) {
    return value;
  } else {
    console.log(value);
    throw new Error('Not a valid moment object');
  }
}

const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
const displayDateTimeFormat = 'DD.MM.YYYY HH:mm';

export function formatDisplayDateTime(dateTime: Moment | null): string {
  return dateTime ? dateTime.format(displayDateTimeFormat) : '-';
}

export function parseDateTime(dateTime: string): Moment {
  return assertValid(moment(dateTime, dateTimeFormat));
}

export function parseDate(dateStr: string): Moment {
  return assertValid(moment(dateStr, dateFormat));
}
