export interface ServiceConfiguration {

  groupManagementConfig: { url: string };
  dataModelConfig: { url: string };
  terminologyConfig: { url: string };
  codelistConfig: { url: string };
  messagingConfig: { enabled: boolean };
  env: string;
}
