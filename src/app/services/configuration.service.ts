import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { ServiceConfiguration } from '../entities/service-configuration';

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

  get isMessagingEnabled(): boolean {

    return this.configuration.messagingConfig.enabled;
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

    uri = uri.replace('#', '%23');
    if (uri && this.env !== 'prod') {
      return uri + '?env=' + this.env;
    }
    return uri ? uri : null;
  }

  getEnvironmentIdentifier(style?: 'prefix' | 'postfix'): string {

    if (this.env && this.env !== 'prod') {
      const identifier = this.env.toUpperCase();
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

  get showUnfinishedFeature(): boolean {

    return this.env === 'awsdev' || this.env === 'local';
  }
}
