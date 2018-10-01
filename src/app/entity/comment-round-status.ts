export type CommentRoundStatus = 'AWAIT'
  | 'INPROGRESS'
  | 'ENDED'
  | 'CLOSED';

export const allCommentRoundStatuses = ['AWAIT', 'INPROGRESS', 'ENDED', 'CLOSED'] as CommentRoundStatus[];
