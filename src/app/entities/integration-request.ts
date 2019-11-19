export class IntegrationRequest {

  container: string[];
  pageFrom: number;
  pageSize: number;
  status: string[];
  filter: string[];
  includeIncomplete: boolean;
  includeIncompleteFrom: string[];
  language: string;
  searchTerm: string;
  type: string;
}
