import { Localizable } from 'yti-common-ui/types/localization';
import { Status } from 'yti-common-ui/entities/status';

export interface BaseResourceType {

  id: string;
  url: string;
}

export interface CommentRoundSimpleType extends BaseResourceType {

  user: UserType;
  label: string;
  description: string;
  sourceLabel: Localizable;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  created?: string;
  modified?: string;
  startDate?: string;
  endDate?: string;
  source: SourceType;
}

export interface CommentRoundType extends BaseResourceType {

  user?: UserType;
  label: string;
  description: string;
  sourceLabel: Localizable;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  created?: string;
  modified?: string;
  startDate?: string;
  endDate?: string;
  source: SourceType;
  organizations: OrganizationSimpleType[];
}

export interface SourceType {

  id?: string;
  url?: string;
  containerType: string;
  containerUri: string;
}

export interface UserType {

  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CommentSimpleType extends BaseResourceType {

  content: string;
  user: UserType;
  proposedStatus: string;
  created?: string | null;
  modified?: string;
  parentComment?: CommentSimpleType;
}

export interface CommentType extends BaseResourceType {

  content: string;
  user?: UserType;
  proposedStatus: string;
  created?: string | null;
  modified?: string;
  commentThread: CommentThreadSimpleType;
  parentComment?: CommentSimpleType;
}

export interface CommentThreadType extends BaseResourceType {

  resourceUri: string;
  label: Localizable;
  definition: Localizable;
  proposedText: string;
  proposedStatus: string;
  user?: UserType;
  created?: string | null;
  commentRound: CommentRoundType;
}

export interface CommentThreadSimpleType extends BaseResourceType {

  resourceUri: string;
  label: Localizable;
  definition: Localizable;
  proposedText: string;
  proposedStatus: string;
  user: UserType;
  created?: string | null;
}

export interface OrganizationType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  url: string;
  commentRounds: CommentRoundSimpleType[];
}

export interface OrganizationSimpleType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  url: string;
}

export interface IntegrationReourceType {

  id: string;
  uri: string;
  prefLabel: Localizable;
  description: Localizable;
  status: Status;
}
