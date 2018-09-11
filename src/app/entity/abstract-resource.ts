import { BaseResourceType } from '../services/api-schema';

export abstract class AbstractResource {

  id: string;
  url: string;

  constructor(data: BaseResourceType) {
    this.id = data.id;
    this.url = data.url;
  }
}
