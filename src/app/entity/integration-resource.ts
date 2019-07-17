import { IntegrationResourceType } from '../services/api-schema';
import { Status } from 'yti-common-ui/entities/status';
import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment, utc } from 'moment';
import { LanguageService } from '../services/language.service';

export class IntegrationResource {

  id: string;
  uri: string;
  prefLabel: Localizable = {};
  description: Localizable = {};
  localName: string;
  status: Status;
  type?: string;
  modified: Moment | null = null;

  constructor(data: IntegrationResourceType) {

    this.id = data.id;
    this.uri = data.uri;
    this.prefLabel = data.prefLabel;
    this.description = data.description;
    this.localName = data.localName;
    this.status = data.status;
    if (data.type) {
      this.type = data.type;
    }
    if (data.modified) {
      this.modified = utc(data.modified);
    }
  }

  serialize(): IntegrationResourceType {

    return {
      id: this.id,
      uri: this.uri,
      prefLabel: this.prefLabel,
      description: this.description,
      localName: this.localName,
      status: this.status,
      modified: formatDateTime(this.modified),
      type: this.type
    };
  }

  getDisplayName(localizer: LanguageService, useUILanguage: boolean = false): string {

    if (!localizer.isLocalizableEmpty(this.prefLabel)) {
      return localizer.translate(this.prefLabel, useUILanguage);
    } else if (this.localName) {
      return this.localName;
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
