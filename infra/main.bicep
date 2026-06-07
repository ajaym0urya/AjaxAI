targetScope = 'resourceGroup'

@description('Unique suffix used to keep Azure resource names globally unique.')
param suffix string = uniqueString(resourceGroup().id)

@description('Azure region where the AjaxAI foundation resources are deployed.')
param location string = resourceGroup().location

@description('Common tags applied to all Azure resources created by this template.')
param tags object = {
  project: 'AjaxAI'
  managedBy: 'Bicep'
  deployedBy: 'GitHubActions'
}

var namePrefix = 'ajaxai'
var acrName = toLower('${namePrefix}${suffix}')
var logAnalyticsName = toLower('law-${namePrefix}-${suffix}')
var containerAppsEnvName = toLower('cae-${namePrefix}-${suffix}')
var cosmosName = toLower('cosmos-${namePrefix}-${suffix}')
var keyVaultName = toLower('kv-${namePrefix}-${suffix}')
var serviceBusName = toLower('sb-${namePrefix}-${suffix}')

// Centralized logging for Container Apps revisions and workflow troubleshooting.
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-07-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Container image registry used by GitHub Actions to publish new revisions.
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-11-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// Container Apps environment hosting the frontend, backend, and agent runtime.
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppsEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: listKeys(logAnalytics.id, '2025-07-01').primarySharedKey
      }
    }
  }
}

// Cosmos DB backs the shared repository layer used by both the Node and Python services.
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' = {
  name: cosmosName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
    disableKeyBasedMetadataWriteAccess: false
  }
}

// Key Vault stores runtime secrets if the deployment is extended beyond GitHub Actions secrets.
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enablePurgeProtection: true
    enableRbacAuthorization: true
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    softDeleteRetentionInDays: 90
  }
}

// Service Bus remains available for asynchronous workflows and future event-driven extensions.
resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2025-05-01-preview' = {
  name: serviceBusName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    disableLocalAuth: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

output acrName string = containerRegistry.name
output acrLoginServer string = containerRegistry.properties.loginServer
output containerAppsEnvironmentName string = containerAppsEnvironment.name
output containerAppsEnvironmentId string = containerAppsEnvironment.id
output cosmosAccountName string = cosmosDbAccount.name
output cosmosEndpoint string = cosmosDbAccount.properties.documentEndpoint
output keyVaultName string = keyVault.name
output serviceBusNamespaceName string = serviceBusNamespace.name