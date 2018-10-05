import { AbstractResource } from './abstract-resource';
import { CommentThreadType } from '../services/api-schema';
import { CommentRound } from './commentround';
import { Localizable } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { Location } from 'yti-common-ui/types/location';
import { User } from './user';
import { EditableEntity } from './editable-entity';

export class CommentThread extends AbstractResource implements EditableEntity {

  resourceUri: string;
  label: Localizable = {};
  description: Localizable = {};
  proposedText: string;
  proposedStatus: string;
  user: User;
  created: Moment | null = null;
  commentRound: CommentRound;

  constructor(data: CommentThreadType) {

    super(data);
    this.resourceUri = data.resourceUri;
    this.label = data.label || {};
    this.description = data.description || {};
    this.proposedText = data.proposedText;
    this.proposedStatus = data.proposedStatus;
    if (data.user) {
      this.user = new User(data.user);
    }
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
      proposedStatus: this.proposedStatus,
      commentRound: this.commentRound.serialize()
    };
  }

  clone(): CommentThread {
    return new CommentThread(this.serialize());
  }

  allowOrganizationEdit(): boolean {

    return true;
  }

  getOwningOrganizationIds(): string[] {

    return this.commentRound.organizations.map(org => org.id);
  }
}
