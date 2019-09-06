/**
 * @module @adonisjs/application
 */

/*
* @adonisjs/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

declare module '@ioc:Adonis/Core/Application' {
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
    },
    autoloads: {
      [key: string]: string,
    },
    namespaces: {
      [key: string]: string,
    },
  }

  export interface ApplicationContract {
    readonly rcFile: RcFile,
    readonly appRoot: string
    readonly cliCwd?: string
    readonly appName: string
    readonly adonisVersion: SemverNode | null
    readonly version: SemverNode | null
    exceptionHandlerNamespace: string
    container: IocContract
    preloads: PreloadNode[]
    environment: 'web' | 'console' | 'test' | 'unknown'
    isReady: boolean
    inProduction: boolean
    inDev: boolean
    isShuttingDown: boolean
    directoriesMap: Map<string, string>
    autoloadsMap: Map<string, string>
    namespacesMap: Map<string, string>
    makePath (...paths: string[]): string
    makePathFromCwd (...paths: string[]): string
    configPath (...paths: string[]): string
    publicPath (...paths: string[]): string
    databasePath (...paths: string[]): string
    migrationsPath (...paths: string[]): string
    seedsPath (...paths: string[]): string
    resourcesPath (...paths: string[]): string
    viewsPath (...paths: string[]): string
    startPath (...paths: string[]): string
    tmpPath (...paths: string[]): string
  }
}