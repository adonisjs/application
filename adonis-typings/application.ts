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

  /**
   * Shape of preload files
   */
  export type PreloadNode = {
    file: string,
    environment: ('web' | 'console' | 'test')[],
    optional: boolean,
  }

  /**
   * Shape of semver node
   */
  export type SemverNode = {
    major: number,
    minor: number,
    patch: number,
    prerelease: (string | number)[],
    version: string,
  }

  /**
   * Shape of the meta file inside the `metaFiles` array inside
   * `.adonisrc.json` file.
   */
  export type MetaFileNode = {
    pattern: string,
    reloadServer: boolean,
  }

  /**
   * Shape of rc file
   */
  export type RcFile = {
    typescript: boolean,
    exceptionHandlerNamespace: string,
    preloads: PreloadNode[],
    metaFiles: MetaFileNode[],
    commands: string[],
    providers: string[],
    aceProviders: string[],
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
    readonly typescript: boolean
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

  const Application: ApplicationContract
  export default Application
}
