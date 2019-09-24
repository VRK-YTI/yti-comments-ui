export class IntegrationRequest {

  container: string;
  pageFrom: number;
  pageSize: number;
  status: string[];
  filter: string[];
  includeIncompleteFrom: string[];
  language: string;
  searchTerm: string;
}
