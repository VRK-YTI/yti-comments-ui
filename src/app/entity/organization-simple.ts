import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { OrganizationSimpleType } from '../services/api-schema';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

export class OrganizationSimple {

  id: string;
  url: string;
  prefLabel: Localizable;
  description: Localizable;

  constructor(data: OrganizationSimpleType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.description = data.description || {};
    this.url = data.url;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.prefLabel, useUILanguage);
  }

  getIdIdentifier(localizer: Localizer): string {
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  serialize(): OrganizationSimpleType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      description: { ...this.description }
    };
  }

  clone(): OrganizationSimple {
    return new OrganizationSimple(this.serialize());
  }
}
