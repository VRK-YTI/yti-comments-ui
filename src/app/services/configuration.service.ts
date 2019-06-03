import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { ServiceConfiguration } from '../entity/service-configuration';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {

  configuration: ServiceConfiguration;

  constructor(private dataService: DataService) {
  }

  fetchConfiguration(): Promise<ServiceConfiguration> {

    const promise = this.dataService.getServiceConfiguration().toPromise().then(configuration => {
      this.configuration = configuration;
      return configuration;
    });
    return promise;
  }

  get loading(): boolean {

    return this.configuration == null;
  }

  get env(): string {

    return this.configuration.env;
  }

  get groupManagementUrl(): string {

    return this.configuration.groupManagementConfig.url;
  }

  get terminologyUrl(): string {

    return this.configuration.terminologyConfig.url;
  }

  get dataModelUrl(): string {

    return this.configuration.dataModelConfig.url;
  }

  get codelistUrl(): string {

    return this.configuration.codelistConfig.url;
  }

  getUriWithEnv(uri: string): string | null {

    if (uri && this.env !== 'prod') {
      return this.encodeUriAndEscapeHashTag(uri) + '?env=' + this.env;
    }
    return uri ? this.encodeUriAndEscapeHashTag(uri) : null;
  }

  getEnvironmentIdentifier(style?: 'prefix' | 'postfix'): string {

    if (this.env && this.env !== 'prod') {
      let identifier;
      if (this.env === 'awsdev') {
        identifier = 'DEV';
      } else {
        identifier = this.env.toUpperCase();
      }
      if (!style) {
        return identifier;
      } else if (style === 'prefix') {
        return identifier + ' - ';
      } else if (style === 'postfix') {
        return ' - ' + identifier;
      }
    }
    return '';
  }

  encodeUriAndEscapeHashTag(uri: string): string {

    return encodeURI(uri).replace('#', '%23');
  }
}
