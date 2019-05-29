[@poppinss/application](../README.md) > [@poppinss/application](../modules/_poppinss_application.md) > [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)

# Interface: ApplicationContract

## Hierarchy

**ApplicationContract**

## Implemented by

* [Application](../classes/_poppinss_application.application.md)

## Index

### Properties

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

---

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

**● autoloadsMap**: *`Map`<`string`, `string`>*

___
<a id="container"></a>

###  container

**● container**: *`IocContract`*

___
<a id="directoriesmap"></a>

###  directoriesMap

**● directoriesMap**: *`Map`<`string`, `string`>*

___
<a id="environment"></a>

###  environment

**● environment**: *"web" \| "console" \| "test" \| "unknown"*

___
<a id="exceptionhandlernamespace"></a>

###  exceptionHandlerNamespace

**● exceptionHandlerNamespace**: *`string`*

___
<a id="indev"></a>

###  inDev

**● inDev**: *`boolean`*

___
<a id="inproduction"></a>

###  inProduction

**● inProduction**: *`boolean`*

___
<a id="preloads"></a>

###  preloads

**● preloads**: *[PreloadNode](../modules/_poppinss_application.md#preloadnode)[]*

___
<a id="ready"></a>

###  ready

**● ready**: *`boolean`*

___
<a id="version"></a>

###  version

**● version**: *`string`*

___

## Methods

<a id="configpath"></a>

###  configPath

▸ **configPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="databasepath"></a>

###  databasePath

▸ **databasePath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="makepath"></a>

###  makePath

▸ **makePath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="migrationspath"></a>

###  migrationsPath

▸ **migrationsPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="publicpath"></a>

###  publicPath

▸ **publicPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="resourcespath"></a>

###  resourcesPath

▸ **resourcesPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="seedspath"></a>

###  seedsPath

▸ **seedsPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="startpath"></a>

###  startPath

▸ **startPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___
<a id="viewspath"></a>

###  viewsPath

▸ **viewsPath**(...paths: *`string`[]*): `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` paths | `string`[] |

**Returns:** `string`

___

