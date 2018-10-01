import { SourceType } from '../services/api-schema';

export class Source {

  id: string | null;
  url: string | null;
  containerType: string;
  containerUri: string;

  constructor(data: SourceType) {
    this.id = data.id ? data.id : null;
    this.url = data.url ? data.url : null;
    this.containerType = data.containerType;
    this.containerUri = data.containerUri;
  }

  serialize(): SourceType {
    return {
      id: this.id ? this.id : undefined,
      url: this.url ? this.url : undefined,
      containerType: this.containerType,
      containerUri: this.containerUri
    };
  }
}
