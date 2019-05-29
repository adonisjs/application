[@poppinss/application](../README.md) > [@poppinss/application](../modules/_poppinss_application.md) > [Application](../classes/_poppinss_application.application.md)

# Class: Application

The main application instance to know about the environment, filesystem in which your AdonisJs app is running

## Hierarchy

**Application**

## Implements

* [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)

## Index

### Constructors

* [constructor](_poppinss_application.application.md#constructor)

### Properties

* [adonisVersion](_poppinss_application.application.md#adonisversion)
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

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Application**(appRoot: *`string`*, container: *`IocContract`*, rcContents: *`any`*, adonisVersion: *`string`*): [Application](_poppinss_application.application.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| appRoot | `string` |
| container | `IocContract` |
| rcContents | `any` |
| adonisVersion | `string` |

**Returns:** [Application](_poppinss_application.application.md)

___

## Properties

<a id="adonisversion"></a>

### `<Optional>` adonisVersion

**● adonisVersion**: *[SemverNode](../modules/_poppinss_application.md#semvernode)*

___
<a id="appname"></a>

###  appName

**● appName**: *`string`*

___
<a id="approot"></a>

###  appRoot

**● appRoot**: *`string`*

___
<a id="autoloadsmap"></a>

###  autoloadsMap

**● autoloadsMap**: *`Map`<`string`, `string`>* =  new Map()

___
<a id="container"></a>

###  container

**● container**: *`IocContract`*

___
<a id="directoriesmap"></a>

###  directoriesMap

**● directoriesMap**: *`Map`<`string`, `string`>* =  new Map()

___
<a id="environment"></a>

###  environment

**● environment**: *"web" \| "console" \| "test" \| "unknown"* = "unknown"

___
<a id="exceptionhandlernamespace"></a>

###  exceptionHandlerNamespace

**● exceptionHandlerNamespace**: *`string`*

___
<a id="indev"></a>

###  inDev

**● inDev**: *`boolean`* =  !this.inProduction

___
<a id="inproduction"></a>

###  inProduction

**● inProduction**: *`boolean`* =  process.env.NODE_ENV === 'production'

___
<a id="preloads"></a>

###  preloads

**● preloads**: *[PreloadNode](../modules/_poppinss_application.md#preloadnode)[]* =  []

___
<a id="ready"></a>

###  ready

**● ready**: *`boolean`* = false

___
<a id="version"></a>

###  version

**● version**: *[SemverNode](../modules/_poppinss_application.md#semvernode)*

___

## Methods

<a id="configpath"></a>

###  configPath

▸ **configPath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the config directory

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="databasepath"></a>

###  databasePath

▸ **databasePath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the database path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="makepath"></a>

###  makePath

▸ **makePath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the application path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="migrationspath"></a>

###  migrationsPath

▸ **migrationsPath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the migrations path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="publicpath"></a>

###  publicPath

▸ **publicPath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the public path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="resourcespath"></a>

###  resourcesPath

▸ **resourcesPath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the resources path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="seedspath"></a>

###  seedsPath

▸ **seedsPath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the seeds path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="startpath"></a>

###  startPath

▸ **startPath**(...paths: *`string`[]*): `string`

Makes path to the start directory

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="viewspath"></a>

###  viewsPath

▸ **viewsPath**(...paths: *`string`[]*): `string`

Make path to a file or directory relative from the views path

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___

