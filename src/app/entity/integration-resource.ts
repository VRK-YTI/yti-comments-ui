import { IntegrationReourceType, SourceType } from '../services/api-schema';
import { Status } from 'yti-common-ui/entities/status';
import { Localizable, Localizer } from 'yti-common-ui/types/localization';

export class IntegrationResource {

  id: string;
  uri: string;
  prefLabel: Localizable = {};
  description: Localizable = {};
  status: Status;

  constructor(data: IntegrationReourceType) {

    this.id = data.id;
    this.uri = data.uri;
    this.prefLabel = data.prefLabel;
    this.description = data.description;
    this.status = data.status;
  }

  serialize(): IntegrationReourceType {

    return {
      id: this.id,
      uri: this.uri,
      prefLabel: this.prefLabel,
      description: this.description,
      status: this.status
    };
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    if (this.prefLabel) {
      return localizer.translate(this.prefLabel, useUILanguage);
    }
    return this.uri;
  }

  getDescription(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.description, useUILanguage);
  }
}
