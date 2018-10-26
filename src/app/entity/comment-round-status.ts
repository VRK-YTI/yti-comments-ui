export type CommentRoundStatus = 'INCOMPLETE'
  | 'AWAIT'
  | 'INPROGRESS'
  | 'ENDED'
  | 'CLOSED';

export const allCommentRoundStatuses = ['INCOMPLETE', 'AWAIT', 'INPROGRESS', 'ENDED', 'CLOSED'] as CommentRoundStatus[];
