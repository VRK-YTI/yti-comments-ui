import { AbstractResource } from './abstract-resource';
import { SourceType } from '../services/api-schema';

export class Source extends AbstractResource {

  containerType: string;
  containerUri: string;

  constructor(data: SourceType) {
    super(data);
    this.containerType = data.containerType;
    this.containerUri = data.containerUri;
  }
}
