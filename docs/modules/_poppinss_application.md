> **[@poppinss/application](../README.md)**

[Globals](../README.md) / [@poppinss/application](_poppinss_application.md) /

# External module: @poppinss/application

## Index

### Classes

* [Application](../classes/_poppinss_application.application.md)

### Interfaces

* [ApplicationContract](../interfaces/_poppinss_application.applicationcontract.md)

### Type aliases

* [PreloadNode](_poppinss_application.md#preloadnode)
* [RcFile](_poppinss_application.md#rcfile)
* [SemverNode](_poppinss_application.md#semvernode)

### Functions

* [parse](_poppinss_application.md#parse)

## Type aliases

###  PreloadNode

Ƭ **PreloadNode**: *object*

#### Type declaration:

___

###  RcFile

Ƭ **RcFile**: *object*

#### Type declaration:

___

###  SemverNode

Ƭ **SemverNode**: *object*

#### Type declaration:

## Functions

###  parse

▸ **parse**(`contents`: any): *[RcFile](_poppinss_application.md#rcfile)*

Parses the contents of `.adonisrc.json` file and merges it with the
defaults

**Parameters:**

Name | Type |
------ | ------ |
`contents` | any |

**Returns:** *[RcFile](_poppinss_application.md#rcfile)*