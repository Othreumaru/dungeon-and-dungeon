@description('The Azure region into which the resources should be deployed.')
param location string = resourceGroup().location

@description('Container image to deploy. Should be of the form repoName/imagename:tag for images stored in public Docker Hub, or a fully qualified URI for other registries. Images from private registries require additional registry credentials.')
param image string = 'odrinwhite/dungeon-and-dungeon:latest'

@secure()
param containerRegistryPassword string = ''

@secure()
param authSecret string = ''

@secure()
param authGithubId string = ''

@secure()
param authGithubSecret string = ''


param webAppName string = uniqueString(resourceGroup().id) // Generate unique String for web app name
param sku string = 'B1' // The SKU of App Service Plan
param linuxFxVersion string = 'DOCKER|${image}' // The runtime stack of web app
param logAnalyticsWorkspace string = '${webAppName}la'

var appServicePlanName = toLower('dungeon-and-dungeon-plan-${webAppName}')
var webSiteName = toLower('dungeon-and-dungeon-${webAppName}')

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' existing = {
  name: logAnalyticsWorkspace
}

resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: appServicePlanName
  location: location
  properties: {
    reserved: true
  }
  sku: {
    name: sku
  }
  kind: 'linux'
}

resource appService 'Microsoft.Web/sites@2024-04-01' = {
  name: webSiteName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      numberOfWorkers: 1
      webSocketsEnabled: true
      http20Enabled: true
      alwaysOn: true
    }
    httpsOnly: true
  }
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
}

resource siteAppSettings 'Microsoft.Web/sites/config@2024-04-01' = {
  parent: appService
  name: 'appsettings'
  properties: {
    DOCKER_REGISTRY_SERVER_URL: 'https://index.docker.io'
    DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistryPassword
    DOCKER_REGISTRY_SERVER_USERNAME: 'odrinwhite'
    DOCKER_ENABLE_CI: 'true'
    WEBSOCKETS_ENABLED : 'true'
    WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
    AUTH_SECRET: authSecret
    AUTH_GITHUB_ID: authGithubId
    AUTH_GITHUB_SECRET: authGithubSecret
    AUTH_URL: '${webSiteName}.azurecontainer.io'
  }
}

resource diagnosticLogs 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: appServicePlan.name
  scope: appServicePlan
  properties: {
    workspaceId: logAnalytics.id
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true 
        }
      }
    ]
  }
}
