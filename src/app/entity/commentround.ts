import { CommentRoundType } from '../services/api-schema';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { AbstractResource } from './abstract-resource';
import { Source } from './source';
import { Location } from 'yti-common-ui/types/location';
import { Localizable } from 'yti-common-ui/types/localization';
import { OrganizationSimple } from './organization-simple';
import { User } from './user';
import { EditableEntity } from './editable-entity';
import { CommentThreadSimple } from './commentthread-simple';

export class CommentRound extends AbstractResource implements EditableEntity {

  user: User;
  label: string;
  sourceLabel: Localizable = {};
  description: string;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  source: Source;
  created: Moment | null = null;
  modified: Moment | null = null;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  organizations: OrganizationSimple[] = [];
  commentThreads: CommentThreadSimple[] = [];

  constructor(data: CommentRoundType) {

    super(data);
    if (data.user) {
      this.user = new User(data.user);
    }
    this.label = data.label;
    this.description = data.description;
    this.status = data.status;
    this.fixedThreads = data.fixedThreads;
    this.openThreads = data.openThreads;
    this.sourceLabel = data.sourceLabel || {};
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
    if (data.organizations) {
      this.organizations = (data.organizations || []).map(org => new OrganizationSimple(org));
    }
    if (data.commentThreads) {
      this.commentThreads = (data.commentThreads || []).map(commentThread => new CommentThreadSimple(commentThread));
    }
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  get modifiedDisplayValue(): string {

    return formatDisplayDateTime(this.modified);
  }

  get location(): Location[] {

    return [
      {
        localizationKey: 'Comment round',
        label: undefined,
        value: undefined,
        route: this.route
      }
    ];
  }

  get route(): any[] {

    return [
      'commentround',
      {
        commentRoundId: this.id
      }
    ];
  }

  serialize(): CommentRoundType {

    return {
      id: this.id,
      url: this.url,
      user: this.user ? this.user.serialize() : undefined,
      status: this.status,
      created: formatDateTime(this.created),
      modified: formatDateTime(this.modified),
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      label: this.label,
      description: this.description,
      sourceLabel: { ...this.sourceLabel },
      fixedThreads: this.fixedThreads,
      openThreads: this.openThreads,
      source: this.source.serialize(),
      organizations: this.organizations.map(org => org.serialize()),
      commentThreads: this.commentThreads.map(commentThread => commentThread.serialize())
    };
  }

  clone(): CommentRound {

    return new CommentRound(this.serialize());
  }

  allowUserEdit(): boolean {

    return true;
  }

  getUser(): User {

    return this.user;
  }

  allowOrganizationEdit(): boolean {

    return this.status === 'INPROGRESS' && !this.fixedThreads;
  }

  getOwningOrganizationIds(): string[] {

    return this.organizations.map(org => org.id);
  }
}
