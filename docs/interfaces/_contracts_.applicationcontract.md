**[@poppinss/application](../README.md)**

[Globals](../README.md) › ["contracts"](../modules/_contracts_.md) › [ApplicationContract](_contracts_.applicationcontract.md)

# Interface: ApplicationContract

## Hierarchy

* **ApplicationContract**

## Implemented by

* [Application](../classes/_application_.application.md)

## Index

### Properties

* [adonisVersion](_contracts_.applicationcontract.md#adonisversion)
* [appName](_contracts_.applicationcontract.md#appname)
* [appRoot](_contracts_.applicationcontract.md#approot)
* [autoloadsMap](_contracts_.applicationcontract.md#autoloadsmap)
* [cliCwd](_contracts_.applicationcontract.md#optional-clicwd)
* [container](_contracts_.applicationcontract.md#container)
* [directoriesMap](_contracts_.applicationcontract.md#directoriesmap)
* [environment](_contracts_.applicationcontract.md#environment)
* [exceptionHandlerNamespace](_contracts_.applicationcontract.md#exceptionhandlernamespace)
* [inDev](_contracts_.applicationcontract.md#indev)
* [inProduction](_contracts_.applicationcontract.md#inproduction)
* [isReady](_contracts_.applicationcontract.md#isready)
* [isShuttingDown](_contracts_.applicationcontract.md#isshuttingdown)
* [preloads](_contracts_.applicationcontract.md#preloads)
* [version](_contracts_.applicationcontract.md#version)

### Methods

* [configPath](_contracts_.applicationcontract.md#configpath)
* [databasePath](_contracts_.applicationcontract.md#databasepath)
* [makePath](_contracts_.applicationcontract.md#makepath)
* [makePathFromCwd](_contracts_.applicationcontract.md#makepathfromcwd)
* [migrationsPath](_contracts_.applicationcontract.md#migrationspath)
* [publicPath](_contracts_.applicationcontract.md#publicpath)
* [resourcesPath](_contracts_.applicationcontract.md#resourcespath)
* [seedsPath](_contracts_.applicationcontract.md#seedspath)
* [startPath](_contracts_.applicationcontract.md#startpath)
* [tmpPath](_contracts_.applicationcontract.md#tmppath)
* [viewsPath](_contracts_.applicationcontract.md#viewspath)

## Properties

###  adonisVersion

• **adonisVersion**: *[SemverNode](../modules/_contracts_.md#semvernode) | null*

___

###  appName

• **appName**: *string*

___

###  appRoot

• **appRoot**: *string*

___

###  autoloadsMap

• **autoloadsMap**: *Map‹string, string›*

___

### `Optional` cliCwd

• **cliCwd**? : *undefined | string*

___

###  container

• **container**: *IocContract*

___

###  directoriesMap

• **directoriesMap**: *Map‹string, string›*

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

###  isReady

• **isReady**: *boolean*

___

###  isShuttingDown

• **isShuttingDown**: *boolean*

___

###  preloads

• **preloads**: *[PreloadNode](../modules/_contracts_.md#preloadnode)[]*

___

###  version

• **version**: *[SemverNode](../modules/_contracts_.md#semvernode) | null*

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

###  makePathFromCwd

▸ **makePathFromCwd**(...`paths`: string[]): *string*

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

###  tmpPath

▸ **tmpPath**(...`paths`: string[]): *string*

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