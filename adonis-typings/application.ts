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
   * Shape of directories object with known and unknown
   * directories
   */
  export interface DirectoriesNode {
    config: string,
    public: string,
    contracts: string,
    providers: string,
    database: string,
    migrations: string,
    seeds: string,
    resources: string,
    views: string,
    start: string,
    tmp: string,
    [key: string]: string,
  }

  /**
   * Shape of namespaces object with known and unknown
   * directories
   */
  export interface NamespacesNode {
    models: string,
    httpControllers: string,
    eventListeners: string,
    redisListeners: string,
    [key: string]: string,
  }

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
    toString (): string,
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
    directories: DirectoriesNode,
    aliases: {
      [key: string]: string,
    },
    namespaces: NamespacesNode,
    raw: any,
  }

  export interface ApplicationContract {
    /**
     * Readonly reference to the parsed rc file
     */
    readonly rcFile: RcFile,

    /**
     * Absolute path to the application root
     */
    readonly appRoot: string

    /**
     * Absolute path to the application source root. Only defined when
     * application is started using `ace` commands
     */
    readonly cliCwd?: string

    /**
     * Name of the application defined inside package.json file
     */
    readonly appName: string

    /**
     * Version of `@adonisjs/core` package
     */
    readonly adonisVersion: SemverNode | null

    /**
     * Version of the application defined inside package.json file
     */
    readonly version: SemverNode | null

    /**
     * A boolean to know if application source is written in Typescript.
     */
    readonly typescript: boolean

    /**
     * Global exception handler namespace
     */
    exceptionHandlerNamespace: string

    /**
     * Reference to IoC container
     */
    container: IocContract

    /**
     * Reference to preloads defined inside `.adonisrc.json` file
     */
    preloads: PreloadNode[]

    /**
     * Application environment.
     *
     * - `console` is when running ace commands
     * - `web` is when running http server
     * - `test` is when running tests
     */
    environment: 'web' | 'console' | 'test' | 'unknown'

    /**
     * A boolean to know if application is ready
     */
    isReady: boolean

    /**
     * A boolean to know if application is running in production
     * mode
     */
    inProduction: boolean

    /**
     * A boolean to know if application is running in dev mode
     */
    inDev: boolean

    /**
     * A boolean to know if application is tearing down
     */
    isShuttingDown: boolean

    /**
     * Reference to the relative paths of conventional and custom directories
     * defined inside `.adonisrc.json` file
     */
    directoriesMap: Map<string, string>

    /**
     * Reference to the alias directories.
     */
    aliasesMap: Map<string, string>

    /**
     * Reference to the base namespaces for certain pre-defined
     * directories
     */
    namespacesMap: Map<string, string>

    /**
     * Make path to a file or directory from the application root
     */
    makePath (...paths: string[]): string

    /**
     * Make path to a file or directory from the application source root
     */
    makePathFromCwd (...paths: string[]): string

    /**
     * Make path to a file or directory from the config directory root
     */
    configPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the public directory root
     */
    publicPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the database directory root
     */
    databasePath (...paths: string[]): string

    /**
     * Make path to a file or directory from the migrations directory root
     */
    migrationsPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the seeds path root
     */
    seedsPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the resources path root
     */
    resourcesPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the views path root
     */
    viewsPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the start path root
     */
    startPath (...paths: string[]): string

    /**
     * Make path to a file or directory from the tmp path root
     */
    tmpPath (...paths: string[]): string
  }

  const Application: ApplicationContract
  export default Application
}
