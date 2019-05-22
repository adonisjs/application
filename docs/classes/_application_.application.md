[@poppinss/application](../README.md) > ["Application"](../modules/_application_.md) > [Application](../classes/_application_.application.md)

# Class: Application

The main application instance to know about the environment, filesystem in which your AdonisJs app is running

## Hierarchy

**Application**

## Implements

* `ApplicationContract`

## Index

### Constructors

* [constructor](_application_.application.md#constructor)

### Properties

* [appName](_application_.application.md#appname)
* [appRoot](_application_.application.md#approot)
* [autoloadsMap](_application_.application.md#autoloadsmap)
* [container](_application_.application.md#container)
* [directoriesMap](_application_.application.md#directoriesmap)
* [environment](_application_.application.md#environment)
* [exceptionHandlerNamespace](_application_.application.md#exceptionhandlernamespace)
* [inDev](_application_.application.md#indev)
* [inProduction](_application_.application.md#inproduction)
* [preloads](_application_.application.md#preloads)
* [ready](_application_.application.md#ready)
* [version](_application_.application.md#version)

### Methods

* [configPath](_application_.application.md#configpath)
* [databasePath](_application_.application.md#databasepath)
* [makePath](_application_.application.md#makepath)
* [migrationsPath](_application_.application.md#migrationspath)
* [publicPath](_application_.application.md#publicpath)
* [resourcesPath](_application_.application.md#resourcespath)
* [seedsPath](_application_.application.md#seedspath)
* [viewsPath](_application_.application.md#viewspath)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Application**(version: *`string`*, appRoot: *`string`*, container: *`IocContract`*, rcContents: *`any`*): [Application](_application_.application.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| version | `string` |
| appRoot | `string` |
| container | `IocContract` |
| rcContents | `any` |

**Returns:** [Application](_application_.application.md)

___

## Properties

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

**● preloads**: *`PreloadNode`[]* =  []

___
<a id="ready"></a>

###  ready

**● ready**: *`boolean`* = false

___
<a id="version"></a>

###  version

**● version**: *`string`*

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

