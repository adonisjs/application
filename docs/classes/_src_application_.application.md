[@adonisjs/application](../README.md) › ["src/Application"](../modules/_src_application_.md) › [Application](_src_application_.application.md)

# Class: Application

The main application instance to know about the environment, filesystem
in which your AdonisJs app is running

## Hierarchy

* **Application**

## Implements

* ApplicationContract

## Index

### Constructors

* [constructor](_src_application_.application.md#constructor)

### Properties

* [adonisVersion](_src_application_.application.md#adonisversion)
* [aliasesMap](_src_application_.application.md#aliasesmap)
* [appName](_src_application_.application.md#appname)
* [appRoot](_src_application_.application.md#approot)
* [cliCwd](_src_application_.application.md#optional-clicwd)
* [container](_src_application_.application.md#container)
* [directoriesMap](_src_application_.application.md#directoriesmap)
* [environment](_src_application_.application.md#environment)
* [exceptionHandlerNamespace](_src_application_.application.md#exceptionhandlernamespace)
* [inDev](_src_application_.application.md#indev)
* [inProduction](_src_application_.application.md#inproduction)
* [isReady](_src_application_.application.md#isready)
* [isShuttingDown](_src_application_.application.md#isshuttingdown)
* [namespacesMap](_src_application_.application.md#namespacesmap)
* [preloads](_src_application_.application.md#preloads)
* [rcFile](_src_application_.application.md#rcfile)
* [typescript](_src_application_.application.md#typescript)
* [version](_src_application_.application.md#version)

### Methods

* [configPath](_src_application_.application.md#configpath)
* [databasePath](_src_application_.application.md#databasepath)
* [makePath](_src_application_.application.md#makepath)
* [makePathFromCwd](_src_application_.application.md#makepathfromcwd)
* [migrationsPath](_src_application_.application.md#migrationspath)
* [publicPath](_src_application_.application.md#publicpath)
* [resolveNamespaceDirectory](_src_application_.application.md#resolvenamespacedirectory)
* [resourcesPath](_src_application_.application.md#resourcespath)
* [seedsPath](_src_application_.application.md#seedspath)
* [startPath](_src_application_.application.md#startpath)
* [tmpPath](_src_application_.application.md#tmppath)
* [viewsPath](_src_application_.application.md#viewspath)

## Constructors

###  constructor

\+ **new Application**(`appRoot`: string, `container`: IocContract, `rcContents`: object, `pkgFile`: Partial‹object & object›): *[Application](_src_application_.application.md)*

**Parameters:**

Name | Type |
------ | ------ |
`appRoot` | string |
`container` | IocContract |
`rcContents` | object |
`pkgFile` | Partial‹object & object› |

**Returns:** *[Application](_src_application_.application.md)*

## Properties

###  adonisVersion

• **adonisVersion**: *SemverNode | null*

`@adonisjs/core` version

___

###  aliasesMap

• **aliasesMap**: *Map‹string, string›* = new Map()

A map of directories aliases

___

###  appName

• **appName**: *string*

The name of the application picked from `.adonisrc.json` file. This can
be used to prefix logs.

___

###  appRoot

• **appRoot**: *string*

___

### `Optional` cliCwd

• **cliCwd**? : *undefined | string* = process.env.ADONIS_ACE_CWD

Current working directory for the CLI and not the build directory
The `ADONIS_CLI_CWD` is set by the cli

___

###  container

• **container**: *IocContract*

___

###  directoriesMap

• **directoriesMap**: *Map‹string, string›* = new Map()

A map of pre-configured directories

___

###  environment

• **environment**: *"web" | "console" | "test" | "unknown"* = "unknown"

The environment in which application is running

___

###  exceptionHandlerNamespace

• **exceptionHandlerNamespace**: *string*

The namespace of exception handler that will handle exceptions

___

###  inDev

• **inDev**: *boolean* = !this.inProduction

Inverse of `inProduction`

___

###  inProduction

• **inProduction**: *boolean* = process.env.NODE_ENV === 'production'

Is current environment production.

___

###  isReady

• **isReady**: *boolean* = false

A boolean to know if application has bootstrapped successfully

___

###  isShuttingDown

• **isShuttingDown**: *boolean* = false

A boolean to know if application has received a shutdown signal
like `SIGINT` or `SIGTERM`.

___

###  namespacesMap

• **namespacesMap**: *Map‹string, string›* = new Map()

A map of namespaces that different parts of apps
can use

___

###  preloads

• **preloads**: *PreloadNode[]* = []

A array of files to be preloaded

___

###  rcFile

• **rcFile**: *RcFile*

Reference to fully parser rcFile

___

###  typescript

• **typescript**: *boolean*

The typescript flag indicates a couple of things, which can help tweak the tooling
and runtime behavior of the application as well.

1. When `typescript=true`, it means that the project is written using typescript.
2. After compiling to Javascript, AdonisJs will set this value to `false` in the build folder.
3. At runtime when `typescript=true`, it means the app is using ts-node to start.

___

###  version

• **version**: *SemverNode | null*

The application version. Again picked from `.adonisrc.json` file

## Methods

###  configPath

▸ **configPath**(...`paths`: string[]): *string*

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

Make path to a file or directory relative from
the public path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  resolveNamespaceDirectory

▸ **resolveNamespaceDirectory**(`namespaceFor`: string): *string | null*

Returns path for a given namespace by replacing the base namespace
with the defined directories map inside the rc file.

**Parameters:**

Name | Type |
------ | ------ |
`namespaceFor` | string |

**Returns:** *string | null*

___

###  resourcesPath

▸ **resourcesPath**(...`paths`: string[]): *string*

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

Makes path to the start directory

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*

___

###  tmpPath

▸ **tmpPath**(...`paths`: string[]): *string*

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

Make path to a file or directory relative from
the views path

**Parameters:**

Name | Type |
------ | ------ |
`...paths` | string[] |

**Returns:** *string*
