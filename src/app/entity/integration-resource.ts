import { IntegrationResourceType } from '../services/api-schema';
import { Status } from 'yti-common-ui/entities/status';
import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { LanguageService } from '../services/language.service';

export class IntegrationResource {

  id: string;
  uri: string;
  prefLabel: Localizable = {};
  description: Localizable = {};
  status: Status;
  type?: string;
  modified: Moment | null = null;

  constructor(data: IntegrationResourceType) {

    this.id = data.id;
    this.uri = data.uri;
    this.prefLabel = data.prefLabel;
    this.description = data.description;
    this.status = data.status;
    if (data.type) {
      this.type = data.type;
    }
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
  }

  serialize(): IntegrationResourceType {

    return {
      id: this.id,
      uri: this.uri,
      prefLabel: this.prefLabel,
      description: this.description,
      status: this.status,
      modified: formatDateTime(this.modified),
      type: this.type
    };
  }

  getDisplayName(localizer: LanguageService, useUILanguage: boolean = false): string {

    if (!localizer.isLocalizableEmpty(this.prefLabel)) {
      return localizer.translate(this.prefLabel, useUILanguage);
    }
    return this.uri;
  }

  getDescription(localizer: Localizer, useUILanguage: boolean = false): string {

    return localizer.translate(this.description, useUILanguage);
  }

  get modifiedDisplayValue(): string {

    return formatDisplayDateTime(this.modified);
  }
}
