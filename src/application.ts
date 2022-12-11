/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import Hooks from '@poppinss/hooks'
import { fileURLToPath } from 'node:url'
import { Container } from '@adonisjs/fold'
import type { HookHandler } from '@poppinss/hooks/types'
import type { LoggerConfig } from '@adonisjs/logger/types'

import debug from './debug.js'
import { ConfigManager } from './managers/config.js'
import { RcFileManager } from './managers/rc_file.js'
import { LoggerManager } from './managers/logger.js'
import { NodeEnvManager } from './managers/node_env.js'
import { PreloadsManager } from './managers/preloads.js'
import { ProvidersManager } from './managers/providers.js'
import { MetaDataManager } from './managers/meta_data.js'
import { CannotSwitchEnvironmentException } from './exceptions/cannot_switch_environment.js'
import type { HooksState, SemverNode, AppEnvironments, ApplicationStates } from './types.js'

/**
 * Application class manages the state of an AdonisJS application. It includes
 *
 * - Setting up the base features like importing config and setting up logger.
 * - Parsing the ".adonisrc.json" file
 * - Setting up the IoC container
 * - Registering an booting providers
 * - Invoking lifecycle methods on the providers and hooks
 */
export class Application<
  ContainerBindings extends Record<any, any>,
  KnownLoggers extends Record<string, LoggerConfig>
> {
  /**
   * Flag to know when we have started the termination
   * process
   */
  #terminating: boolean = false

  /**
   * The environment in which the app is running. Currently we track
   * pm2 only
   */
  #surroundedEnvironment = {
    pm2: false,
  }

  /**
   * Application root. The path must end with '/'
   */
  #appRoot: URL

  /**
   * Current application environment
   */
  #environment: AppEnvironments

  /**
   * Current state of the application
   */
  #state: ApplicationStates = 'created'

  /**
   * Managers for sub-features
   */
  #configManager: ConfigManager
  #rcFileManager: RcFileManager
  #nodeEnvManager: NodeEnvManager
  #metaDataManager: MetaDataManager
  #preloadsManager: PreloadsManager
  #providersManager: ProvidersManager
  #loggerManager: LoggerManager<KnownLoggers>

  /**
   * Lifecycle hooks
   */
  #hooks = new Hooks<{
    initiating: HooksState<ContainerBindings, KnownLoggers>
    booted: HooksState<ContainerBindings, KnownLoggers>
    ready: HooksState<ContainerBindings, KnownLoggers>
    terminating: HooksState<ContainerBindings, KnownLoggers>
  }>()

  /**
   * The name of the application defined inside "package.json" file.
   */
  get appName() {
    return this.#metaDataManager.appName
  }

  /**
   * The parsed version of the application defined inside "package.json" file.
   */
  get version(): SemverNode | null {
    return this.#metaDataManager.version
  }

  /**
   * The parsed version for the "@adonisjs/core" package.
   */
  get adonisVersion(): SemverNode | null {
    return this.#metaDataManager.adonisVersion
  }

  /**
   * The URL for the root of the application
   */
  get appRoot() {
    return this.#appRoot
  }

  /**
   * A boolean to know if the application has been booted
   */
  get isBooted() {
    return this.#state !== 'created' && this.#state !== 'initiated'
  }

  /**
   * A boolean to know if the application is ready
   */
  get isReady() {
    return this.#state === 'ready'
  }

  /**
   * A boolean to know if the application has been terminated
   */
  get isTerminated() {
    return this.#state === 'terminated'
  }

  /**
   * A boolean to know if the application is in the middle of getting
   * terminating
   */
  get isTerminating() {
    return this.#terminating
  }

  /**
   * Reference to the config class. The value is defined
   * after the "init" method call
   */
  get config() {
    return this.#configManager.config
  }

  /**
   * Reference to application logger. The value is defined
   * after the "init" method call
   */
  get logger() {
    return this.#loggerManager.logger
  }

  /**
   * Reference to the parsed rc file. The value is defined
   * after the "init" method call
   */
  get rcFile() {
    return this.#rcFileManager.rcFile
  }

  /**
   * Normalized current NODE_ENV
   */
  get nodeEnvironment() {
    return this.#nodeEnvManager.nodeEnvironment
  }

  /**
   * Return true when `this.nodeEnvironment === 'production'`
   */
  get inProduction(): boolean {
    return this.nodeEnvironment === 'production'
  }

  /**
   * Return true when `this.nodeEnvironment === 'development'`
   */
  get inDev(): boolean {
    return this.nodeEnvironment === 'development'
  }

  /**
   * Returns true when `this.nodeEnvironment === 'test'`
   */
  get inTest(): boolean {
    return this.nodeEnvironment === 'test'
  }

  /**
   * Find if the process is managed and run under
   * pm2
   */
  get managedByPm2() {
    return this.#surroundedEnvironment.pm2
  }

  /**
   * Reference to the AdonisJS IoC container. The value is defined
   * after the "init" method call
   */
  container!: Container<ContainerBindings>

  constructor(appRoot: URL, options: { environment: AppEnvironments }) {
    this.#appRoot = appRoot
    this.#environment = options.environment
    this.#loggerManager = new LoggerManager()
    this.#nodeEnvManager = new NodeEnvManager()
    this.#configManager = new ConfigManager(this.appRoot)
    this.#rcFileManager = new RcFileManager(this.appRoot)
    this.#metaDataManager = new MetaDataManager(this.appRoot)
    this.#providersManager = new ProvidersManager(this.appRoot, {
      environment: this.#environment,
      providersState: [this],
    })
    this.#preloadsManager = new PreloadsManager(this.appRoot, {
      environment: this.#environment,
    })

    this.#nodeEnvManager.process()
    this.#surroundedEnvironment.pm2 = !!process.env.pm2_id

    this.#debugState()
  }

  #debugState() {
    if (!debug.enabled) {
      return
    }

    debug('app environment :%O', {
      pm2: this.#surroundedEnvironment.pm2,
      environment: this.#environment,
      nodeEnv: this.#nodeEnvManager.nodeEnvironment,
    })
  }

  /**
   * Instantiate the application container
   */
  #instantiateContainer() {
    this.container = new Container<ContainerBindings>()
  }

  /**
   * The current environment in which the application
   * is running
   */
  getEnvironment() {
    return this.#environment
  }

  /**
   * Switch the environment in which the app is running. The
   * environment can only be changed before the app is
   * booted.
   */
  setEnvironment(environment: AppEnvironments): this {
    if (this.#state !== 'created' && this.#state !== 'initiated') {
      throw new CannotSwitchEnvironmentException()
    }

    debug('switching environment { from:"%s", to: "%s" }', this.#environment, environment)
    this.#environment = environment
    return this
  }

  /**
   * The current state of the application.
   */
  getState() {
    return this.#state
  }

  /**
   * Specify the contents of the ".adonisrc.json" file as
   * an object. Calling this method will disable loading
   * the ".adonisrc.json" file from the disk.
   */
  rcContents(value: Record<string, any>): this {
    this.#rcFileManager.rcContents(value)
    return this
  }

  /**
   * Define the config values to use when booting the
   * config provider. Calling this method disables
   * reading files from the config directory.
   */
  useConfig(values: Record<any, any>): this {
    this.#configManager.useConfig(values)
    return this
  }

  /**
   * Notify the parent process when the Node.js process is spawned with an IPC channel.
   * The arguments accepted are same as "process.send"
   */
  notify(
    message: any,
    sendHandle?: any,
    options?: {
      swallowErrors?: boolean | undefined
    },
    callback?: (error: Error | null) => void
  ) {
    if (process.send) {
      process.send(message, sendHandle, options, callback)
    }
  }

  /**
   * Listen for a process signal. This method is same as calling
   * "process.on(signal)"
   */
  listen(signal: NodeJS.Signals, callback: NodeJS.SignalsListener): this {
    process.on(signal, callback)
    return this
  }

  /**
   * Listen for a process signal once. This method is same as calling
   * "process.once(signal)"
   */
  listenOnce(signal: NodeJS.Signals, callback: NodeJS.SignalsListener): this {
    process.once(signal, callback)
    return this
  }

  /**
   * Listen for a process signal conditionally.
   */
  listenIf(conditional: boolean, signal: NodeJS.Signals, callback: NodeJS.SignalsListener): this {
    if (conditional) {
      process.on(signal, callback)
    }

    return this
  }

  /**
   * Listen for a process signal once conditionally.
   */
  listenOnceIf(
    conditional: boolean,
    signal: NodeJS.Signals,
    callback: NodeJS.SignalsListener
  ): this {
    if (conditional) {
      process.once(signal, callback)
    }

    return this
  }

  /**
   * Register hooks that are called before the app starts
   * the initiating process
   */
  initiating(
    handler: HookHandler<
      [Application<ContainerBindings, KnownLoggers>],
      [Application<ContainerBindings, KnownLoggers>]
    >
  ): this {
    this.#hooks.add('initiating', handler)
    return this
  }

  /**
   * Initiate the application. Calling this method performs following
   * operations.
   *
   * - Parses the ".adonisrc.json" file
   * - Validate and set environment variables
   * - Loads the application config from the configured config dir.
   * - Configures the logger
   * - Instantiates the IoC container
   */
  async init() {
    if (this.#state !== 'created') {
      debug('cannot initiate app from state "%s"', this.#state)
      return
    }

    debug('initiating app')
    this.#instantiateContainer()

    /**
     * Metadata management is not considering part
     * of initiating the app
     */
    await this.#metaDataManager.process()
    await this.#metaDataManager.verifyNodeEngine()
    this.#metaDataManager.addMetaDataToEnv()

    /**
     * Notify we are about to initiate the app
     */
    await this.#hooks.runner('initiating').run(this)

    await this.#rcFileManager.process()
    await this.#configManager.process(this.rcFile.directories.config)
    this.#loggerManager.configure()

    this.#hooks.clear('initiating')
    this.#state = 'initiated'
  }

  /**
   * Boot the application. Calling this method performs the following
   * operations.
   *
   * - Resolve providers and call the "register" method on them.
   * - Call the "boot" method on providers
   * - Run the "booted" hooks
   */
  async boot() {
    if (this.#state !== 'initiated') {
      debug('cannot boot app from state "%s"', this.#state)
      return
    }

    debug('booting app')
    this.#providersManager.use(this.rcFile.providers)
    await this.#providersManager.register()
    await this.#providersManager.boot()

    await this.#hooks.runner('booted').run(this)
    this.#hooks.clear('booted')
    this.#state = 'booted'
  }

  /**
   * Register a hook to get notified when the application has
   * been booted.
   *
   * The hook will be called immediately if the app has already
   * been booted.
   */
  booted(
    handler: HookHandler<
      [Application<ContainerBindings, KnownLoggers>],
      [Application<ContainerBindings, KnownLoggers>]
    >
  ): this {
    if (this.isBooted) {
      handler(this)
    } else {
      this.#hooks.add('booted', handler)
    }

    return this
  }

  /**
   * Start the application. Calling this method performs the following
   * operations.
   *
   * - Run the "start" lifecycle hooks on all the providers
   * - Start the application by invoking the supplied callback
   * - Run the "ready" lifecycle hooks on all the providers
   * - Run the "ready" application hooks
   */
  async start(callback: (app: this) => void | Promise<void>) {
    if (this.#state !== 'booted') {
      debug('cannot start app from state "%s"', this.#state)
      return
    }

    debug('starting app')

    /**
     * Pre start phase
     */
    await this.#providersManager.start()
    await this.#preloadsManager.use(this.rcFile.preloads).import()

    /**
     * Callback to perform start of the application
     */
    await callback(this)

    /**
     * Post start phase
     */
    await this.#providersManager.ready()
    await this.#hooks.runner('ready').run(this)
    this.#hooks.clear('ready')

    /**
     * App ready
     */
    this.#state = 'ready'

    /**
     * Notify process is ready
     */
    debug('application ready')
    this.notify('ready')
  }

  /**
   * Register hooks that are called when the app is
   * ready
   */
  ready(
    handler: HookHandler<
      [Application<ContainerBindings, KnownLoggers>],
      [Application<ContainerBindings, KnownLoggers>]
    >
  ): this {
    if (this.isReady) {
      handler(this)
    } else {
      this.#hooks.add('ready', handler)
    }

    return this
  }

  /**
   * Register hooks that are called before the app is
   * terminated.
   */
  terminating(
    handler: HookHandler<
      [Application<ContainerBindings, KnownLoggers>],
      [Application<ContainerBindings, KnownLoggers>]
    >
  ): this {
    this.#hooks.add('terminating', handler)
    return this
  }

  /**
   * Terminate application gracefully. Calling this method performs
   * the following operations.
   *
   * - Run "shutdown" hooks on all the providers
   * - Run "terminating" app lifecycle hooks
   */
  async terminate() {
    if (!this.isBooted || this.#state === 'terminated') {
      debug('cannot terminate app from state "%s"', this.#state)
      return
    }

    debug('terminating app')
    this.#terminating = true
    await this.#hooks.runner('terminating').run(this)
    await this.#providersManager.shutdown()
    this.#hooks.clear('terminating')
    this.#state = 'terminated'
  }

  /**
   * Returns URL to a path from the application root.
   */
  makeURL(...paths: string[]): URL {
    return new URL(join(...paths), this.#appRoot)
  }

  /**
   * Returns file system path from the application root.
   */
  makePath(...paths: string[]): string {
    return fileURLToPath(this.makeURL(...paths))
  }

  /**
   * Makes path to the config directory
   */
  configPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.config, ...paths)
  }

  /**
   * Makes path to the public directory
   */
  publicPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.public, ...paths)
  }

  /**
   * Makes path to the providers directory
   */
  providersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.providers, ...paths)
  }

  /**
   * Makes path to the factories directory
   */
  factoriesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.factories, ...paths)
  }

  /**
   * Makes path to the migrations directory
   */
  migrationsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.migrations, ...paths)
  }

  /**
   * Makes path to the seeders directory
   */
  seedersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.seeders, ...paths)
  }

  /**
   * Makes path to the language files directory
   */
  languageFilesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.languageFiles, ...paths)
  }

  /**
   * Makes path to the views directory
   */
  viewsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.views, ...paths)
  }

  /**
   * Makes path to the start directory
   */
  startPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.start, ...paths)
  }

  /**
   * Makes path to the tests directory
   */
  testsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.tests, ...paths)
  }

  /**
   * Makes path to the tmp directory
   */
  tmpPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.tmp, ...paths)
  }

  /**
   * Makes path to the contracts directory
   */
  contractsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.contracts, ...paths)
  }

  /**
   * Makes path to the http controllers directory
   */
  httpControllersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.httpControllers, ...paths)
  }

  /**
   * Makes path to the models directory
   */
  modelsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.models, ...paths)
  }

  /**
   * Makes path to the services directory
   */
  servicesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.services, ...paths)
  }

  /**
   * Makes path to the exceptions directory
   */
  exceptionsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.exceptions, ...paths)
  }

  /**
   * Makes path to the mailers directory
   */
  mailersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.mailers, ...paths)
  }

  /**
   * Makes path to the middleware directory
   */
  middlewarePath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.middleware, ...paths)
  }

  /**
   * Makes path to the policies directory
   */
  policiesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.policies, ...paths)
  }

  /**
   * Makes path to the validators directory
   */
  validatorsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.validators, ...paths)
  }

  /**
   * Makes path to the commands directory
   */
  commandsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.commands, ...paths)
  }

  toJSON() {
    return {
      isReady: this.isReady,
      isTerminating: this.isTerminating,
      environment: this.#environment,
      nodeEnvironment: this.nodeEnvironment,
      appName: this.appName,
      version: this.version ? this.version.toString() : null,
      adonisVersion: this.adonisVersion ? this.adonisVersion.toString() : null,
    }
  }
}
