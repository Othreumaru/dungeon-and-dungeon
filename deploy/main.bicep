@description('The Azure region into which the resources should be deployed.')
param location string = resourceGroup().location

@description('Name for the container group')
param name string = 'dungeonanddungeoncontainergroup'

@description('Container image to deploy. Should be of the form repoName/imagename:tag for images stored in public Docker Hub, or a fully qualified URI for other registries. Images from private registries require additional registry credentials.')
param image string = 'odrinwhite/dungeon-and-dungeon:latest'

@description('Port to open on the container and the public IP address.')
param port int = 8080

@secure()
param containerRegistryPassword string = ''

@secure()
param authSecret string = ''

@secure()
param authGithubId string = ''

@secure()
param authGithubSecret string = ''


resource containerGroup 'Microsoft.ContainerInstance/containerGroups@2024-10-01-preview' = {
  name: name
  location: location
  properties: {
    containers: [
      {
        name: name
        
        properties: {
          image: image
          ports: [
            {
              port: port
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: 1
              memoryInGB: 1
            }
          }
          environmentVariables: [
            {
              name: 'AUTH_SECRET'
              secureValue: authSecret
            }
            {
              name: 'AUTH_GITHUB_ID'
              secureValue: authGithubId
            }
            {
              name: 'AUTH_GITHUB_SECRET'
              secureValue: authGithubSecret
            }
            {
              name: 'AUTH_URL'
              value: 'http://dungeonanddungeon.westeurope.azurecontainer.io/'
            }
          ]
        }
      }
    ]
    imageRegistryCredentials: [
      {
        server: 'index.docker.io'
        username: 'odrinwhite'
        password: containerRegistryPassword
      }
    ]
    osType: 'Linux'
    restartPolicy: 'Always'
    ipAddress: {
      type: 'Public'
      dnsNameLabel: 'dungeonanddungeon'
      ports: [
        {
          port: 80
          protocol: 'TCP'
        }
      ]
    }
  }
}
