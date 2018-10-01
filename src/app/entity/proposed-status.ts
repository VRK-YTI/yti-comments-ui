export type ProposedStatus = 'NOSTATUS'
  | 'INCOMPLETE'
  | 'SUPERSEDED'
  | 'SUBMITTED'
  | 'RETIRED'
  | 'INVALID'
  | 'VALID'
  | 'SUGGESTED'
  | 'DRAFT';

export const allProposedStatuses =
  ['NOSTATUS', 'INCOMPLETE', 'DRAFT', 'SUGGESTED', 'SUBMITTED', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'] as ProposedStatus[];
export const selectableProposedStatuses =
  ['NOSTATUS', 'INCOMPLETE', 'DRAFT', 'SUBMITTED', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'] as ProposedStatus[];
