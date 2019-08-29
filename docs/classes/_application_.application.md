**[@poppinss/application](../README.md)**

[Globals](../README.md) › ["Application"](../modules/_application_.md) › [Application](_application_.application.md)

# Class: Application

The main application instance to know about the environment, filesystem
in which your AdonisJs app is running

## Hierarchy

* **Application**

## Implements

* [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)

## Index

### Constructors

* [constructor](_application_.application.md#constructor)

### Properties

* [adonisVersion](_application_.application.md#adonisversion)
* [appName](_application_.application.md#appname)
* [appRoot](_application_.application.md#approot)
* [autoloadsMap](_application_.application.md#autoloadsmap)
* [cliCwd](_application_.application.md#optional-clicwd)
* [container](_application_.application.md#container)
* [directoriesMap](_application_.application.md#directoriesmap)
* [environment](_application_.application.md#environment)
* [exceptionHandlerNamespace](_application_.application.md#exceptionhandlernamespace)
* [inDev](_application_.application.md#indev)
* [inProduction](_application_.application.md#inproduction)
* [isReady](_application_.application.md#isready)
* [isShuttingDown](_application_.application.md#isshuttingdown)
* [namespacesMap](_application_.application.md#namespacesmap)
* [preloads](_application_.application.md#preloads)
* [rcFile](_application_.application.md#rcfile)
* [version](_application_.application.md#version)

### Methods

* [configPath](_application_.application.md#configpath)
* [databasePath](_application_.application.md#databasepath)
* [makePath](_application_.application.md#makepath)
* [makePathFromCwd](_application_.application.md#makepathfromcwd)
* [migrationsPath](_application_.application.md#migrationspath)
* [publicPath](_application_.application.md#publicpath)
* [resourcesPath](_application_.application.md#resourcespath)
* [seedsPath](_application_.application.md#seedspath)
* [startPath](_application_.application.md#startpath)
* [tmpPath](_application_.application.md#tmppath)
* [viewsPath](_application_.application.md#viewspath)

## Constructors

###  constructor

\+ **new Application**(`appRoot`: string, `container`: IocContract, `rcContents`: any, `pkgFile`: Partial‹object & object›): *[Application](_application_.application.md)*

**Parameters:**

Name | Type |
------ | ------ |
`appRoot` | string |
`container` | IocContract |
`rcContents` | any |
`pkgFile` | Partial‹object & object› |

**Returns:** *[Application](_application_.application.md)*

## Properties

###  adonisVersion

• **adonisVersion**: *[SemverNode](../modules/_contracts_.md#semvernode) | null*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[adonisVersion](../interfaces/_contracts_.applicationcontract.md#adonisversion)*

`@adonisjs/core` version

___

###  appName

• **appName**: *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[appName](../interfaces/_contracts_.applicationcontract.md#appname)*

The name of the application picked from `.adonisrc.json` file. This can
be used to prefix logs.

___

###  appRoot

• **appRoot**: *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[appRoot](../interfaces/_contracts_.applicationcontract.md#approot)*

___

###  autoloadsMap

• **autoloadsMap**: *Map‹string, string›* =  new Map()

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[autoloadsMap](../interfaces/_contracts_.applicationcontract.md#autoloadsmap)*

A map of directories to autoload (aka alias)

___

### `Optional` cliCwd

• **cliCwd**? : *undefined | string* =  process.env.ADONIS_CLI_CWD

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[cliCwd](../interfaces/_contracts_.applicationcontract.md#optional-clicwd)*

Current working directory for the CLI and not the build directory
The `ADONIS_CLI_CWD` is set by the cli

___

###  container

• **container**: *IocContract*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[container](../interfaces/_contracts_.applicationcontract.md#container)*

___

###  directoriesMap

• **directoriesMap**: *Map‹string, string›* =  new Map()

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[directoriesMap](../interfaces/_contracts_.applicationcontract.md#directoriesmap)*

A map of pre-configured directories

___

###  environment

• **environment**: *"web" | "console" | "test" | "unknown"* = "unknown"

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[environment](../interfaces/_contracts_.applicationcontract.md#environment)*

The environment in which application is running

___

###  exceptionHandlerNamespace

• **exceptionHandlerNamespace**: *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[exceptionHandlerNamespace](../interfaces/_contracts_.applicationcontract.md#exceptionhandlernamespace)*

The namespace of exception handler that will handle exceptions

___

###  inDev

• **inDev**: *boolean* =  !this.inProduction

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[inDev](../interfaces/_contracts_.applicationcontract.md#indev)*

Inverse of `inProduction`

___

###  inProduction

• **inProduction**: *boolean* =  process.env.NODE_ENV === 'production'

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[inProduction](../interfaces/_contracts_.applicationcontract.md#inproduction)*

Is current environment production.

___

###  isReady

• **isReady**: *boolean* = false

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[isReady](../interfaces/_contracts_.applicationcontract.md#isready)*

A boolean to know if application has bootstrapped successfully

___

###  isShuttingDown

• **isShuttingDown**: *boolean* = false

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[isShuttingDown](../interfaces/_contracts_.applicationcontract.md#isshuttingdown)*

A boolean to know if application has received a shutdown signal
like `SIGINT` or `SIGTERM`.

___

###  namespacesMap

• **namespacesMap**: *Map‹string, string›* =  new Map()

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[namespacesMap](../interfaces/_contracts_.applicationcontract.md#namespacesmap)*

A map of namespaces that different parts of apps
can use

___

###  preloads

• **preloads**: *[PreloadNode](../modules/_contracts_.md#preloadnode)[]* =  []

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[preloads](../interfaces/_contracts_.applicationcontract.md#preloads)*

A array of files to be preloaded

___

###  rcFile

• **rcFile**: *[RcFile](../modules/_contracts_.md#rcfile)*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[rcFile](../interfaces/_contracts_.applicationcontract.md#rcfile)*

Reference to fully parser rcFile

___

###  version

• **version**: *[SemverNode](../modules/_contracts_.md#semvernode) | null*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md).[version](../interfaces/_contracts_.applicationcontract.md#version)*

The application version. Again picked from `.adonisrc.json` file

## Methods

###  configPath

▸ **configPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

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

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

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

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

Make path to a file or directory relative from
the application path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  makePathFromCwd

▸ **makePathFromCwd**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

Makes the path to a directory from `cliCwd` vs the `appRoot`. This is
helpful when we want path inside the project root and not the
build directory

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  migrationsPath

▸ **migrationsPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

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

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

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

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

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

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

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

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

Makes path to the start directory

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  tmpPath

▸ **tmpPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

Makes path to the tmp directory. Since the tmp path is used for
writing at the runtime, we use `cwd` path to the write to the
source and not the build directory.

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  viewsPath

▸ **viewsPath**(...`paths`: string[]): *string*

*Implementation of [ApplicationContract](../interfaces/_contracts_.applicationcontract.md)*

Make path to a file or directory relative from
the views path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*