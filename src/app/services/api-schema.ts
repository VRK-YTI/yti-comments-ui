export interface BaseResourceType {

  id: string;
  url: string;
}

export interface CommentRoundType extends BaseResourceType {

  userId: string;
  label: string;
  description?: string;
  status: string;
  fixedComments: boolean;
  openComments: boolean;
  created: string;
  modified: string;
  startDate: string;
  endDate: string;
  source: SourceType;
}

export interface GlobalCommentsType extends BaseResourceType {

  created: string;
  source: SourceType;
}

export interface SourceType extends BaseResourceType {

  containerType: string;
  containerUri: string;
}

export interface CommentType extends BaseResourceType {

  content: string;
  userId: string;
  proposedStatus: string;
  resourceUri: string;
  resourceSuggestion: string;
  created: string;
  modified: string;
}
