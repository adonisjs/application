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
  import { EnvContract } from '@ioc:Adonis/Core/Env'
  import { ConfigContract } from '@ioc:Adonis/Core/Config'
  import { LoggerContract } from '@ioc:Adonis/Core/Logger'
  import { ProfilerContract } from '@ioc:Adonis/Core/Profiler'

  /**
   * The interface that is meant to be extended in
   * the user land and other packages
   */
  export interface ContainerBindings {
    'Adonis/Core/Application': ApplicationContract
    'Adonis/Core/Profiler': ProfilerContract
    'Adonis/Core/Logger': LoggerContract
    'Adonis/Core/Config': ConfigContract
    'Adonis/Core/Env': EnvContract
  }

  export type ApplicationStates =
    | 'initiated'
    | 'setup'
    | 'registered'
    | 'booted'
    | 'ready'
    | 'shutdown'

  /**
   * Shape of directories object with known and unknown
   * directories
   */
  export interface DirectoriesNode {
    config: string
    public: string
    contracts: string
    providers: string
    database: string
    migrations: string
    seeds: string
    resources: string
    views: string
    start: string
    tmp: string
    tests: string
    [key: string]: string
  }

  /**
   * Shape of namespaces object with known and unknown
   * directories
   */
  export interface NamespacesNode {
    models: string
    exceptions: string
    middleware: string
    httpControllers: string
    eventListeners: string
    redisListeners: string
    validators: string
    [key: string]: string
  }

  /**
   * Application environments
   */
  export type AppEnvironments = 'web' | 'console' | 'test' | 'repl' | 'unknown'

  /**
   * Shape of preload files
   */
  export type PreloadNode = {
    file: string
    environment: Exclude<AppEnvironments, 'unknown'>[]
    optional: boolean
  }

  /**
   * Shape of semver node
   */
  export type SemverNode = {
    major: number
    minor: number
    patch: number
    prerelease: (string | number)[]
    version: string
    toString(): string
  }

  /**
   * Shape of the meta file inside the `metaFiles` array inside
   * `.adonisrc.json` file.
   */
  export type MetaFileNode = {
    pattern: string
    reloadServer: boolean
  }

  /**
   * Shape of rc file
   */
  export type RcFile = {
    typescript: boolean
    exceptionHandlerNamespace?: string
    preloads: PreloadNode[]
    metaFiles: MetaFileNode[]
    commands: string[]
    providers: string[]
    aceProviders: string[]
    directories: DirectoriesNode
    aliases: {
      [key: string]: string
    }
    namespaces: NamespacesNode
    raw: any
  }

  export interface ApplicationContract {
    state: ApplicationStates

    /**
     * Readonly reference to the parsed rc file
     */
    readonly rcFile: RcFile

    /**
     * Absolute path to the application root
     */
    readonly appRoot: string

    /**
     * Absolute path to the current working directory
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
     * Application environment.
     *
     * - `console` is when running ace commands
     * - `web` is when running http server
     * - `test` is when running tests
     */
    readonly environment: AppEnvironments

    /**
     * Global exception handler namespace
     */
    exceptionHandlerNamespace?: string

    /**
     * Reference to the IoC container
     */
    container: IocContract<ContainerBindings>

    /**
     * Available after the [[setup]] call
     */
    logger: LoggerContract
    profiler: ProfilerContract
    env: EnvContract
    config: ConfigContract

    /**
     * Reference to preloads defined inside `.adonisrc.json` file
     */
    preloads: PreloadNode[]

    /**
     * Value of `NODE_ENV`. But normalized in certain cases.
     *
     * - `development` - We normalize `dev`, `develop` to "development"
     * - `staging` - We normalize `stage` to "staging"
     * - `production` - We normalize `prod` to "production"
     * - `testing` - We normalize `test` to "testing"
     *
     * Rest of the values remains untouched
     */
    nodeEnvironment: string

    /**
     * A boolean to know if application is ready
     */
    readonly isReady: boolean

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
     * Returns path for a given namespace by replacing the base namespace
     * with the defined directories map inside the .adonisrc file.
     */
    resolveNamespaceDirectory(namespaceFor: string): string | null

    /**
     * Make path to a file or directory from the application root
     */
    makePath(...paths: string[]): string

    /**
     * Switch application environment. Only allowed before the setup
     * is called
     */
    switchEnvironment(environment: AppEnvironments): this

    /**
     * Make path to a file or directory from the application source root
     */
    makePathFromCwd(...paths: string[]): string

    /**
     * Make path to a file or directory from the config directory root
     */
    configPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the public directory root
     */
    publicPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the database directory root
     */
    databasePath(...paths: string[]): string

    /**
     * Make path to a file or directory from the migrations directory root
     */
    migrationsPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the seeds path root
     */
    seedsPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the resources path root
     */
    resourcesPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the views path root
     */
    viewsPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the start path root
     */
    startPath(...paths: string[]): string

    /**
     * Make path to a file or directory from the tmp path root
     */
    tmpPath(...paths: string[]): string

    /**
     * Serialized output
     */
    toJSON(): {
      isReady: boolean
      isShuttingDown: boolean
      environment: AppEnvironments
      nodeEnvironment: string
      appName: string
      version: string | null
      adonisVersion: string | null
    }

    /**
     * Performs the initial setup. This is the time, when we configure the
     * app to be able to boot itself. For example:
     *
     * - Loading environment variables
     * - Loading config
     * - Setting up the logger
     * - Registering directory aliases
     *
     * Apart from the providers, most of the app including the container
     * is ready at this stage
     */
    setup(): void

    /**
     * Register providers
     */
    registerProviders(): void

    /**
     * Booted providers
     */
    bootProviders(): Promise<void>

    /**
     * Registers the providers
     */
    requirePreloads(): void

    /**
     * Start the application. At this time we execute the provider's
     * ready hooks
     */
    start(): Promise<void>

    /**
     * Prepare the application for shutdown. At this time we execute the
     * provider's shutdown hooks
     */
    shutdown(): Promise<void>
  }

  const Application: ApplicationContract
  export default Application

  /**
   * Export Ioc Container static types
   */
  export * from '@adonisjs/fold/build/src/Contracts'
}
