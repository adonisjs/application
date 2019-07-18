> **[@poppinss/application](../README.md)**

[Globals](../README.md) / [@poppinss/application](../modules/_poppinss_application.md) / [Application](_poppinss_application.application.md) /

# Class: Application

The main application instance to know about the environment, filesystem
in which your AdonisJs app is running

## Hierarchy

* **Application**

## Implements

* [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)

## Index

### Constructors

* [constructor](_poppinss_application.application.md#constructor)

### Properties

* [adonisVersion](_poppinss_application.application.md#optional-adonisversion)
* [appName](_poppinss_application.application.md#appname)
* [appRoot](_poppinss_application.application.md#approot)
* [autoloadsMap](_poppinss_application.application.md#autoloadsmap)
* [container](_poppinss_application.application.md#container)
* [directoriesMap](_poppinss_application.application.md#directoriesmap)
* [environment](_poppinss_application.application.md#environment)
* [exceptionHandlerNamespace](_poppinss_application.application.md#exceptionhandlernamespace)
* [inDev](_poppinss_application.application.md#indev)
* [inProduction](_poppinss_application.application.md#inproduction)
* [preloads](_poppinss_application.application.md#preloads)
* [ready](_poppinss_application.application.md#ready)
* [version](_poppinss_application.application.md#version)

### Methods

* [configPath](_poppinss_application.application.md#configpath)
* [databasePath](_poppinss_application.application.md#databasepath)
* [makePath](_poppinss_application.application.md#makepath)
* [migrationsPath](_poppinss_application.application.md#migrationspath)
* [publicPath](_poppinss_application.application.md#publicpath)
* [resourcesPath](_poppinss_application.application.md#resourcespath)
* [seedsPath](_poppinss_application.application.md#seedspath)
* [startPath](_poppinss_application.application.md#startpath)
* [viewsPath](_poppinss_application.application.md#viewspath)

## Constructors

###  constructor

\+ **new Application**(`appRoot`: string, `container`: `IocContract`, `rcContents`: any, `adonisVersion`: string): *[Application](_poppinss_application.application.md)*

**Parameters:**

Name | Type |
------ | ------ |
`appRoot` | string |
`container` | `IocContract` |
`rcContents` | any |
`adonisVersion` | string |

**Returns:** *[Application](_poppinss_application.application.md)*

## Properties

### `Optional` adonisVersion

• **adonisVersion**? : *[SemverNode](../modules/_poppinss_application.md#semvernode)*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[adonisVersion](../interfaces/_poppinss_application.applicationcontract.md#optional-adonisversion)*

___

###  appName

• **appName**: *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[appName](../interfaces/_poppinss_application.applicationcontract.md#appname)*

___

###  appRoot

• **appRoot**: *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[appRoot](../interfaces/_poppinss_application.applicationcontract.md#approot)*

___

###  autoloadsMap

• **autoloadsMap**: *`Map<string, string>`* =  new Map()

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[autoloadsMap](../interfaces/_poppinss_application.applicationcontract.md#autoloadsmap)*

___

###  container

• **container**: *`IocContract`*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[container](../interfaces/_poppinss_application.applicationcontract.md#container)*

___

###  directoriesMap

• **directoriesMap**: *`Map<string, string>`* =  new Map()

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[directoriesMap](../interfaces/_poppinss_application.applicationcontract.md#directoriesmap)*

___

###  environment

• **environment**: *"web" | "console" | "test" | "unknown"* = "unknown"

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[environment](../interfaces/_poppinss_application.applicationcontract.md#environment)*

___

###  exceptionHandlerNamespace

• **exceptionHandlerNamespace**: *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[exceptionHandlerNamespace](../interfaces/_poppinss_application.applicationcontract.md#exceptionhandlernamespace)*

___

###  inDev

• **inDev**: *boolean* =  !this.inProduction

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[inDev](../interfaces/_poppinss_application.applicationcontract.md#indev)*

___

###  inProduction

• **inProduction**: *boolean* =  process.env.NODE_ENV === 'production'

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[inProduction](../interfaces/_poppinss_application.applicationcontract.md#inproduction)*

___

###  preloads

• **preloads**: *[PreloadNode](../modules/_poppinss_application.md#preloadnode)[]* =  []

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[preloads](../interfaces/_poppinss_application.applicationcontract.md#preloads)*

___

###  ready

• **ready**: *boolean* = false

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[ready](../interfaces/_poppinss_application.applicationcontract.md#ready)*

___

###  version

• **version**: *[SemverNode](../modules/_poppinss_application.md#semvernode)*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md).[version](../interfaces/_poppinss_application.applicationcontract.md#version)*

## Methods

###  configPath

▸ **configPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the config directory

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  databasePath

▸ **databasePath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the database path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  makePath

▸ **makePath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the application path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  migrationsPath

▸ **migrationsPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the migrations path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  publicPath

▸ **publicPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the public path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  resourcesPath

▸ **resourcesPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the resources path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  seedsPath

▸ **seedsPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the seeds path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  startPath

▸ **startPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Makes path to the start directory

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  viewsPath

▸ **viewsPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)*

Make path to a file or directory relative from
the views path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*