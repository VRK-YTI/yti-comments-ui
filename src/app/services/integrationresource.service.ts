import { IntegrationResource } from '../entities/integration-resource';

export class IntegrationResourceService {

  integrationResources: { [key: string]: IntegrationResource } = {};

  addIntegrationResource(integrationResource: IntegrationResource) {

    this.integrationResources[integrationResource.uri] = integrationResource;
  }

  getIntegrationResource(integrationResourceUri: string): IntegrationResource {

    return this.integrationResources[integrationResourceUri];
  }
}
