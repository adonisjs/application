> **[@poppinss/application](../README.md)**

[Globals](../README.md) / [@poppinss/application](../modules/_poppinss_application.md) / [ApplicationContract](_poppinss_application.applicationcontract.md) /

# Interface: ApplicationContract

## Hierarchy

* **ApplicationContract**

## Implemented by

* [Application](../classes/_poppinss_application.application.md)

## Index

### Properties

* [adonisVersion](_poppinss_application.applicationcontract.md#optional-adonisversion)
* [appName](_poppinss_application.applicationcontract.md#appname)
* [appRoot](_poppinss_application.applicationcontract.md#approot)
* [autoloadsMap](_poppinss_application.applicationcontract.md#autoloadsmap)
* [container](_poppinss_application.applicationcontract.md#container)
* [directoriesMap](_poppinss_application.applicationcontract.md#directoriesmap)
* [environment](_poppinss_application.applicationcontract.md#environment)
* [exceptionHandlerNamespace](_poppinss_application.applicationcontract.md#exceptionhandlernamespace)
* [inDev](_poppinss_application.applicationcontract.md#indev)
* [inProduction](_poppinss_application.applicationcontract.md#inproduction)
* [preloads](_poppinss_application.applicationcontract.md#preloads)
* [ready](_poppinss_application.applicationcontract.md#ready)
* [version](_poppinss_application.applicationcontract.md#version)

### Methods

* [configPath](_poppinss_application.applicationcontract.md#configpath)
* [databasePath](_poppinss_application.applicationcontract.md#databasepath)
* [makePath](_poppinss_application.applicationcontract.md#makepath)
* [migrationsPath](_poppinss_application.applicationcontract.md#migrationspath)
* [publicPath](_poppinss_application.applicationcontract.md#publicpath)
* [resourcesPath](_poppinss_application.applicationcontract.md#resourcespath)
* [seedsPath](_poppinss_application.applicationcontract.md#seedspath)
* [startPath](_poppinss_application.applicationcontract.md#startpath)
* [viewsPath](_poppinss_application.applicationcontract.md#viewspath)

## Properties

### `Optional` adonisVersion

• **adonisVersion**? : *[SemverNode](../modules/_poppinss_application.md#semvernode)*

___

###  appName

• **appName**: *string*

___

###  appRoot

• **appRoot**: *string*

___

###  autoloadsMap

• **autoloadsMap**: *`Map<string, string>`*

___

###  container

• **container**: *`IocContract`*

___

###  directoriesMap

• **directoriesMap**: *`Map<string, string>`*

___

###  environment

• **environment**: *"web" | "console" | "test" | "unknown"*

___

###  exceptionHandlerNamespace

• **exceptionHandlerNamespace**: *string*

___

###  inDev

• **inDev**: *boolean*

___

###  inProduction

• **inProduction**: *boolean*

___

###  preloads

• **preloads**: *[PreloadNode](../modules/_poppinss_application.md#preloadnode)[]*

___

###  ready

• **ready**: *boolean*

___

###  version

• **version**: *[SemverNode](../modules/_poppinss_application.md#semvernode)*

## Methods

###  configPath

▸ **configPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  databasePath

▸ **databasePath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  makePath

▸ **makePath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  migrationsPath

▸ **migrationsPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  publicPath

▸ **publicPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  resourcesPath

▸ **resourcesPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  seedsPath

▸ **seedsPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  startPath

▸ **startPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  viewsPath

▸ **viewsPath**(...`paths`: string[]): *string*

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*