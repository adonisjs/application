/*
 * @adonisjs/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/application.ts" />

import {
  RcFile,
  SemverNode,
  PreloadNode,
  AppEnvironments,
  ApplicationStates,
  ApplicationContract,
} from '@ioc:Adonis/Core/Application'

import { join } from 'path'
import { Logger } from '@adonisjs/logger'
import { Config } from '@adonisjs/config'
import { Profiler } from '@adonisjs/profiler'
import { Exception } from '@poppinss/utils'
import { Ioc, Registrar } from '@adonisjs/fold'
import { Env, envLoader, EnvParser } from '@adonisjs/env'
import * as helpers from '@poppinss/utils/build/helpers'
import { parse as semverParse, satisfies as semverSatisfies } from 'semver'

import { parse } from './rcParser'

/**
 * Aliases for different environments
 */
const DEV_ENVS = ['dev', 'develop', 'development']
const PROD_ENVS = ['prod', 'production']
const TEST_ENVS = ['test', 'testing']

/**
 * The main application instance to know about the environment, filesystem
 * in which your AdonisJs app is running
 */
export class Application implements ApplicationContract {
  public helpers = helpers

  /**
   * Available after setup call
   */
  public logger: Logger
  public profiler: Profiler
  public env: Env
  public config: Config

  /**
   * Available after registerProviders call
   */
  private registrar: Registrar

  /**
   * An array of providers with ready and shutdown hooks.
   */
  private providersWithReadyHook: { ready: () => Promise<void> }[] = []
  private providersWithShutdownHook: { shutdown: () => Promise<void> }[] = []

  public state: ApplicationStates = 'initiated'

  /**
   * Current working directory for the CLI and not the build directory
   * The `ADONIS_CLI_CWD` is set by the cli
   */
  public readonly cliCwd?: string = process.env.ADONIS_ACE_CWD

  /**
   * The name of the application picked from `.adonisrc.json` file. This can
   * be used to prefix logs.
   */
  public readonly appName: string

  /**
   * The application version. Again picked from `.adonisrc.json` file
   */
  public readonly version: SemverNode | null

  /**
   * `@adonisjs/core` version
   */
  public readonly adonisVersion: SemverNode | null

  /**
   * Reference to fully parser rcFile
   */
  public readonly rcFile: RcFile

  /**
   * The typescript flag indicates a couple of things, which can help tweak the tooling
   * and runtime behavior of the application as well.
   *
   * 1. When `typescript=true`, it means that the project is written using typescript.
   * 2. After compiling to Javascript, AdonisJs will set this value to `false` in the build folder.
   * 3. At runtime when `typescript=true`, it means the app is using ts-node to start.
   */
  public readonly typescript: boolean

  /**
   * A boolean to know if application has bootstrapped successfully
   */
  public get isReady() {
    return this.state === 'ready' && !this.isShuttingDown
  }

  /**
   * A boolean to know if app is preparing to shutdown
   */
  public isShuttingDown = false

  /**
   * The namespace of exception handler that will handle exceptions
   */
  public exceptionHandlerNamespace?: string

  /**
   * It is unknown until the `setup` method is called
   */
  public nodeEnvironment: 'unknown' | 'development' | 'production' | 'test' | string = 'unknown'

  /**
   * An array of files to be preloaded
   */
  public preloads: PreloadNode[] = []

  /**
   * A map of pre-configured directories
   */
  public directoriesMap: Map<string, string> = new Map()

  /**
   * A map of directories aliases
   */
  public aliasesMap: Map<string, string> = new Map()

  /**
   * A map of namespaces that different parts of apps
   * can use
   */
  public namespacesMap: Map<string, string> = new Map()

  /**
   * Reference to the IoC container for the application
   */
  public container: ApplicationContract['container'] = new Ioc()

  constructor(
    public readonly appRoot: string,
    public environment: AppEnvironments,
    rcContents?: any
  ) {
    this.rcFile = parse(rcContents || this.loadRcFile())
    this.typescript = this.rcFile.typescript

    /**
     * Loads the package.json files to collect optional
     * info about the app.
     */
    const pkgFile = this.loadAppPackageJson()
    const corePkgFile = this.loadCorePackageJson()
    this.verifyNodeEngine(pkgFile.engines)

    /**
     * Fetching following info from the package file
     */
    this.appName = pkgFile.name
    this.version = this.parseVersion(pkgFile.version)
    this.adonisVersion = corePkgFile.version ? this.parseVersion(corePkgFile.version) : null

    /**
     * Fetching following info from the `.adonisrc.json` file.
     */
    this.preloads = this.rcFile.preloads
    this.exceptionHandlerNamespace = this.rcFile.exceptionHandlerNamespace
    this.directoriesMap = new Map(Object.entries(this.rcFile.directories))
    this.aliasesMap = new Map(Object.entries(this.rcFile.aliases))
    this.namespacesMap = new Map(Object.entries(this.rcFile.namespaces))

    this.setEnvVars()
    this.setupGlobals()
    this.registerItselfToTheContainer()
    this.setupHelpers()
  }

  /**
   * Verify the node version when defined under "engines" object in
   * "packages.json" file.
   */
  private verifyNodeEngine(engines?: { node?: string }) {
    const nodeEngine = engines?.node
    if (!nodeEngine) {
      return
    }

    if (!semverSatisfies(process.version, nodeEngine)) {
      throw new Exception(
        `The installed Node.js version "${process.version}" does not satisfy the expected version "${nodeEngine}" defined inside package.json file`,
        500
      )
    }
  }

  /**
   * Resolve a given module from the application root. The callback is invoked
   * when the module is missing
   */
  private resolveModule(modulePath: string, onMissingCallback: (error: any) => void) {
    let filePath: string | undefined

    try {
      filePath = helpers.resolveFrom(this.appRoot, modulePath)
      return require(filePath)
    } catch (error) {
      if (
        ['ENOENT', 'MODULE_NOT_FOUND'].includes(error.code) &&
        (!filePath || filePath === error.path)
      ) {
        return onMissingCallback(error)
      } else {
        throw error
      }
    }
  }

  /**
   * Loads the rc file from the application root
   */
  private loadRcFile() {
    return this.resolveModule('./.adonisrc.json', () => {
      throw new Error('AdonisJS expects ".adonisrc.json" file to exist in the application root')
    })
  }

  /**
   * Loads the package.json file from the application root. Swallows
   * the exception when file is missing
   */
  private loadAppPackageJson(): {
    name: string
    engines?: { node?: string }
    version: string
  } {
    const pkgFile = this.resolveModule('./package.json', () => {
      return {}
    })
    return {
      name: pkgFile.name || 'adonis-app',
      version: pkgFile.version || '0.0.0',
      engines: pkgFile.engines,
    }
  }

  /**
   * Loads the package.json file for the "@adonisjs/core" package. Swallows
   * the exception when file is missing
   */
  private loadCorePackageJson(): { version?: string } {
    const pkgFile = this.resolveModule('@adonisjs/core/package.json', () => {
      return {}
    })

    return {
      version: pkgFile.version,
    }
  }

  /**
   * Parses version string to an object.
   */
  private parseVersion(version: string): SemverNode | null {
    const parsed = semverParse(version)
    if (!parsed) {
      return null
    }

    return {
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease.map((release) => release),
      version: parsed.version,
      toString() {
        return this.version
      },
    }
  }

  /**
   * Sets env variables based upon the provided application info.
   */
  private setEnvVars() {
    process.env.APP_NAME = this.appName
    if (this.version) {
      process.env.APP_VERSION = this.version.toString()
    }

    if (this.adonisVersion) {
      process.env.ADONIS_VERSION = this.adonisVersion.toString()
    }
  }

  /**
   * Setup container globals to easily resolve bindings
   */
  private setupGlobals() {
    global[Symbol.for('ioc.use')] = this.container.use.bind(this.container)
    global[Symbol.for('ioc.make')] = this.container.make.bind(this.container)
    global[Symbol.for('ioc.call')] = this.container.call.bind(this.container)
  }

  /**
   * Registering itself to the container
   */
  private registerItselfToTheContainer() {
    this.container.singleton('Adonis/Core/Application', () => this)
  }

  /**
   * Normalizes node env
   */
  private normalizeNodeEnv(env: string) {
    if (!env || typeof env !== 'string') {
      return 'unknown'
    }

    env = env.toLowerCase()
    if (DEV_ENVS.includes(env)) {
      return 'development'
    }

    if (PROD_ENVS.includes(env)) {
      return 'production'
    }

    if (TEST_ENVS.includes(env)) {
      return 'test'
    }

    return env
  }

  /**
   * Registering directory aliases
   */
  private registerAliases() {
    this.aliasesMap.forEach((toPath, alias) => {
      this.container.alias(join(this.appRoot, toPath), alias)
    })
  }

  /**
   * Loads the environment variables by reading and parsing the
   * `.env` and `.env.testing` files.
   */
  private loadEnvironmentVariables() {
    /**
     * Load `.env` and `.env.testing` files from the application root. The
     * env loader handles the additional flags like
     *
     * ENV_SILENT = 'do not load the .env file'
     * ENV_PATH = 'load .env file from given path'
     * NODE_ENV = 'testing' will trigger optional loading of `.env.testing` file
     */
    const { envContents, testEnvContent } = envLoader(this.appRoot)

    /**
     * Create instance of the Env class
     */
    this.env = new Env([
      { values: new EnvParser(true).parse(envContents), overwriteExisting: false },
      { values: new EnvParser(false).parse(testEnvContent), overwriteExisting: true },
    ])
    this.container.singleton('Adonis/Core/Env', () => this.env)

    /**
     * Attempt to load `env.(ts|js)` files to setup the validation rules
     */
    this.resolveModule('./env', () => {})

    /**
     * Process environment variables. This will trigger validations as well
     */
    this.env.process()

    /**
     * Update node environment
     */
    this.nodeEnvironment = this.normalizeNodeEnv(this.env.get('NODE_ENV'))
  }

  /**
   * Load config and define the container binding
   */
  private loadConfig() {
    this.config = new Config(helpers.requireAll(this.configPath()))
    this.container.singleton('Adonis/Core/Config', () => this.config)
  }

  /**
   * Setup logger
   */
  private setupLogger() {
    const config = this.container.resolveBinding('Adonis/Core/Config').get('app.logger', {})
    this.logger = new Logger(config)
    this.container.singleton('Adonis/Core/Logger', () => this.logger)
  }

  /**
   * Setup profiler
   */
  private setupProfiler() {
    const config = this.container.resolveBinding('Adonis/Core/Config').get('app.profiler', {})
    const logger = this.container.resolveBinding('Adonis/Core/Logger')
    this.profiler = new Profiler(this.appRoot, logger, config)
    this.container.singleton('Adonis/Core/Profiler', () => this.profiler)
  }

  /**
   * Setup helpers
   */
  private setupHelpers() {
    this.container.bind('Adonis/Core/Helpers', () => helpers)
  }

  /**
   * Return true when `this.nodeEnvironment === 'production'`
   */
  public get inProduction(): boolean {
    return this.nodeEnvironment === 'production'
  }

  /**
   * Opposite of [[this.isProduction]]
   */
  public get inDev(): boolean {
    return !this.inProduction
  }

  /**
   * Returns true when `this.nodeEnvironment === 'test'`
   */
  public get inTest(): boolean {
    return this.nodeEnvironment === 'test'
  }

  /**
   * Returns path for a given namespace by replacing the base namespace
   * with the defined directories map inside the rc file.
   *
   * The method returns a relative path from the application root. You can
   * use join it with the [[this.appRoot]] to make the absolute path
   */
  public resolveNamespaceDirectory(namespaceFor: string): string | null {
    /**
     * Return null when rcfile doesn't have a special
     * entry for namespaces
     */
    if (!this.rcFile.namespaces[namespaceFor]) {
      return null
    }

    let output: string | null = null

    Object.keys(this.rcFile.aliases).forEach((baseNamespace) => {
      const autoloadPath = this.rcFile.aliases[baseNamespace]
      if (
        this.rcFile.namespaces[namespaceFor].startsWith(`${baseNamespace}/`) ||
        this.rcFile.namespaces[namespaceFor] === baseNamespace
      ) {
        output = this.rcFile.namespaces[namespaceFor].replace(baseNamespace, autoloadPath)
      }
    })

    return output
  }

  /**
   * Make path to a file or directory relative from
   * the application path
   */
  public makePath(...paths: string[]): string {
    return join(this.appRoot, ...paths)
  }

  /**
   * Makes the path to a directory from `cliCwd` vs the `appRoot`. This is
   * helpful when we want path inside the project root and not the
   * build directory
   * @deprecated Use `makePath` instead
   */
  public makePathFromCwd(...paths: string[]): string {
    process.emitWarning(
      'DeprecationWarning',
      'application.makePathFromCwd() is deprecated. Use application.makePath() instead'
    )
    return join(this.cliCwd || this.appRoot, ...paths)
  }
  /**
   * Make path to a file or directory relative from
   * the config directory
   */
  public configPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('config')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the public path
   */
  public publicPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('public')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the providers path
   */
  public providersPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('providers')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the database path
   */
  public databasePath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('database')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the migrations path
   */
  public migrationsPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('migrations')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the seeds path
   */
  public seedsPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('seeds')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the resources path
   */
  public resourcesPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('resources')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the views path
   */
  public viewsPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('views')!, ...paths)
  }

  /**
   * Makes path to the start directory
   */
  public startPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('start')!, ...paths)
  }

  /**
   * Makes path to the tests directory
   */
  public testsPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('tests')!, ...paths)
  }

  /**
   * Makes path to the tmp directory. Since the tmp path is used for
   * writing at the runtime, we use `cwd` path to the write to the
   * source and not the build directory.
   */
  public tmpPath(...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('tmp')!, ...paths)
  }

  /**
   * Serialized output
   */
  public toJSON() {
    return {
      isReady: this.isReady,
      isShuttingDown: this.isShuttingDown,
      environment: this.environment,
      nodeEnvironment: this.nodeEnvironment,
      appName: this.appName,
      version: this.version ? this.version.toString() : null,
      adonisVersion: this.adonisVersion ? this.adonisVersion.toString() : null,
    }
  }

  /**
   * Switch application environment. Only allowed before the setup
   * is called
   */
  public switchEnvironment(environment: AppEnvironments): this {
    if (this.state !== 'initiated') {
      throw new Error(`Cannot switch application environment in "${this.state}" state`)
    }

    this.environment = environment
    return this
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
  public async setup(): Promise<void> {
    if (this.state !== 'initiated') {
      return
    }

    this.state = 'setup'
    this.registerAliases()
    this.loadEnvironmentVariables()
    this.loadConfig()
    this.setupLogger()
    this.setupProfiler()
  }

  /**
   * Register providers
   */
  public async registerProviders(): Promise<void> {
    if (this.state !== 'setup') {
      return
    }

    this.state = 'registered'

    await this.profiler.profile('providers:register', {}, async () => {
      const providers = this.rcFile.providers.concat(this.rcFile.aceProviders)

      this.logger.trace('registering providers', providers)
      this.registrar = new Registrar([this], this.appRoot)

      const registeredProviders = await this.registrar
        .useProviders(providers, (provider) => {
          return new provider(this)
        })
        .register()

      /**
       * Keep reference of providers that are using ready or shutdown hooks
       */
      registeredProviders.forEach((provider: any) => {
        if (typeof provider.shutdown === 'function') {
          this.providersWithShutdownHook.push(provider)
        }

        if (typeof provider.ready === 'function') {
          this.providersWithReadyHook.push(provider)
        }
      })
    })
  }

  /**
   * Booted providers
   */
  public async bootProviders(): Promise<void> {
    if (this.state !== 'registered') {
      return
    }

    this.state = 'booted'

    await this.profiler.profileAsync('providers:boot', {}, async () => {
      this.logger.trace('booting providers')
      await this.registrar.boot()
    })
  }

  /**
   * Require files registered as preloads inside `.adonisrc.json` file
   */
  public async requirePreloads(): Promise<void> {
    this.preloads
      .filter((node) => {
        if (!node.environment || this.environment === 'unknown') {
          return true
        }

        return node.environment.indexOf(this.environment) > -1
      })
      .forEach((node) => {
        this.profiler.profile('file:preload', node, () => {
          this.logger.trace(node, 'file:preload')
          this.resolveModule(node.file, (error) => {
            if (!node.optional) {
              throw error
            }
          })
        })
      })
  }

  /**
   * Start the application. At this time we execute the provider's
   * ready hooks
   */
  public async start(): Promise<void> {
    if (this.state !== 'booted') {
      return
    }

    this.state = 'ready'
    await this.profiler.profileAsync('providers:ready', {}, async () => {
      this.logger.trace('executing providers ready hook')
      await Promise.all(this.providersWithReadyHook.map((provider) => provider.ready()))
    })

    this.providersWithReadyHook = []
  }

  /**
   * Prepare the application for shutdown. At this time we execute the
   * provider's shutdown hooks
   */
  public async shutdown(): Promise<void> {
    if (['initiated', 'setup'].includes(this.state)) {
      return
    }

    this.isShuttingDown = true
    this.state = 'shutdown'
    await this.profiler.profileAsync('providers:shutdown', {}, async () => {
      this.logger.trace('executing providers shutdown hook')
      await Promise.all(this.providersWithShutdownHook.map((provider) => provider.shutdown()))
    })

    this.providersWithShutdownHook = []
  }
}
