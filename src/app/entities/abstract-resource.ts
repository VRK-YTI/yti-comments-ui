import { BaseResourceType } from '../services/api-schema';

export abstract class AbstractResource {

  id: string;
  url: string;
  uri: string;
  sequenceId: number;

  constructor(data: BaseResourceType) {
    this.id = data.id;
    this.url = data.url;
    this.uri = data.uri;
    this.sequenceId = data.sequenceId;
  }
}
