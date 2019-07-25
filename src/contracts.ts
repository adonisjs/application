/**
 * @module @poppinss/application
 */

/*
* @poppinss/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { IocContract } from '@adonisjs/fold'

export type PreloadNode = {
  file: string,
  environment: ('web' | 'console' | 'test')[],
  optional: boolean,
}

export type SemverNode = {
  major: number,
  minor: number,
  patch: number,
  prerelease: (string | number)[],
  version: string,
}

export type RcFile = {
  exceptionHandlerNamespace: string,
  preloads: PreloadNode[],
  copyToBuild: string[],
  directories: {
    [key: string]: string,
  }
  autoloads: {
    [key: string]: string,
  },
}

export interface ApplicationContract {
  readonly appRoot: string
  readonly appName: string
  exceptionHandlerNamespace: string
  container: IocContract
  adonisVersion?: SemverNode
  version: SemverNode
  environment: 'web' | 'console' | 'test' | 'unknown'
  ready: boolean
  preloads: PreloadNode[]
  inProduction: boolean
  inDev: boolean
  directoriesMap: Map<string, string>
  autoloadsMap: Map<string, string>
  makePath (...paths: string[]): string
  configPath (...paths: string[]): string
  publicPath (...paths: string[]): string
  databasePath (...paths: string[]): string
  migrationsPath (...paths: string[]): string
  seedsPath (...paths: string[]): string
  resourcesPath (...paths: string[]): string
  viewsPath (...paths: string[]): string
  startPath (...paths: string[]): string
}
