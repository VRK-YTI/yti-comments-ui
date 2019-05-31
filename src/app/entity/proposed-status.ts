export type ProposedStatus = 'NOSTATUS'
  | 'INCOMPLETE'
  | 'SUPERSEDED'
  | 'RETIRED'
  | 'INVALID'
  | 'VALID'
  | 'SUGGESTED'
  | 'DRAFT';

export const allProposedStatuses =
  ['NOSTATUS', 'INCOMPLETE', 'DRAFT', 'SUGGESTED', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'] as ProposedStatus[];

export const selectableProposedStatuses =
  ['DRAFT', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'] as ProposedStatus[];
