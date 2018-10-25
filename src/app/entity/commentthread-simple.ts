import { CommentThreadSimpleType } from '../services/api-schema';
import { Localizable } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { User } from './user';
import { CommentThreadResult } from './commentthreadresult';

export class CommentThreadSimple {

  id: string;
  url: string;
  resourceUri: string;
  label: Localizable = {};
  description: Localizable = {};
  proposedText: string;
  currentStatus: string | undefined;
  proposedStatus: string;
  user: User;
  created: Moment | null = null;
  results: CommentThreadResult[];

  constructor(data: CommentThreadSimpleType) {

    if (data.id) {
      this.id = data.id;
    }
    if (data.url) {
      this.url = data.url;
    }
    if (data.resourceUri) {
      this.resourceUri = data.resourceUri;
    }
    this.label = data.label || {};
    this.description = data.description || {};
    if (data.proposedText) {
      this.proposedText = data.proposedText;
    }
    if (data.currentStatus) {
      this.currentStatus = data.currentStatus;
    }
    if (data.proposedStatus) {
      this.proposedStatus = data.proposedStatus;
    }
    if (data.user) {
      this.user = new User(data.user);
    }
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    if (data.results) {
      this.results = (data.results || []).map(result => new CommentThreadResult(result));
    }
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  serialize(): CommentThreadSimpleType {

    return {
      id: this.id ? this.id : undefined,
      url: this.url ? this.url : undefined,
      user: this.user ? this.user.serialize() : undefined,
      resourceUri: this.resourceUri ? this.resourceUri : undefined,
      label: this.label,
      description: this.description ? this.description : undefined,
      created: formatDateTime(this.created),
      proposedText: this.proposedText,
      currentStatus: this.currentStatus,
      proposedStatus: this.proposedStatus,
      results: this.results.map(result => result.serialize())
    };
  }

  clone(): CommentThreadSimple {

    return new CommentThreadSimple(this.serialize());
  }
}
