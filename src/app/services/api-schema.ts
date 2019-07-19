import { Localizable } from 'yti-common-ui/types/localization';
import { Status } from 'yti-common-ui/entities/status';

export interface BaseResourceType {

  id: string;
  url: string;
}

export interface ApiResponseType {

  meta: {
    message: string,
    code: number,
    entityIdentifier?: string
  };
}

export interface CommentRoundSimpleType extends BaseResourceType {

  user?: UserType;
  label: string;
  description: string;
  sourceLocalName?: string | null;
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
  sourceLocalName?: string | null;
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
  commentThreads?: CommentThreadSimpleType[] | null;
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
  user?: UserType;
  proposedStatus: string;
  endStatus: string;
  created?: string | null;
  modified?: string;
  parentComment?: CommentSimpleType;
}

export interface CommentType extends BaseResourceType {

  content: string;
  user?: UserType;
  proposedStatus?: string;
  endStatus?: string;
  created?: string | null;
  modified?: string;
  commentThread: CommentThreadType;
  parentComment?: CommentSimpleType;
}

export interface CommentThreadType extends BaseResourceType {

  resourceUri: string;
  label: Localizable;
  description: Localizable;
  localName?: string | null;
  proposedText: string;
  currentStatus?: string;
  proposedStatus: string;
  user?: UserType;
  created?: string | null;
  commentRound: CommentRoundType;
  results?: CommentThreadResultType[];
  commentCount: number;
}

export interface CommentThreadSimpleType {

  id?: string;
  url?: string;
  resourceUri?: string;
  label?: Localizable;
  description?: Localizable;
  localName?: string | null;
  proposedText?: string;
  currentStatus?: string;
  proposedStatus?: string;
  user?: UserType;
  created?: string | null;
  results?: CommentThreadResultType[];
  commentCount: number;
}

export interface CommentThreadResultType {

  status: string;
  count: number;
  percentage: string;
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

export interface IntegrationResourceType {

  id: string;
  uri: string;
  prefLabel: Localizable;
  description: Localizable;
  localName?: string | null;
  status: Status;
  type?: string;
  modified?: string;
}
