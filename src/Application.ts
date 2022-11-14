/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Hooks from '@poppinss/hooks'
import { Container } from '@adonisjs/fold'
import type { HookHandler } from '@poppinss/hooks/types'
import type { LoggerConfig } from '@adonisjs/logger/types'

import { EnvManager } from './managers/env.js'
import { ConfigManager } from './managers/config.js'
import { RcFileManager } from './managers/rc_file.js'
import { LoggerManager } from './managers/logger.js'
import { NodeEnvManager } from './managers/node_env.js'
import { PreloadsManager } from './managers/preloads.js'
import { ProvidersManager } from './managers/providers.js'
import { CannotSwitchEnvironmentException } from './exceptions/cannot_switch_environment.js'
import type {
  HooksState,
  SemverNode,
  AppEnvironments,
  ApplicationStates,
  EnvValidatorFunction,
} from './types.js'
import { MetaDataManager } from './managers/meta_data.js'

/**
 * Application class manages the state of an AdonisJS application. It includes
 *
 * - Setting up the base features like logger and env variables.
 * - Parsing the ".adonisrc.json" file
 * - Setting up the IoC container
 * - Registering an booting providers
 * - Invoking lifecycle methods on the providers and hooks
 */
export class Application<
  ContainerBindings extends Record<any, any>,
  Validator extends EnvValidatorFunction,
  KnownLoggers extends Record<string, LoggerConfig>
> {
  #terminating: boolean = false

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
  #envManager: EnvManager<Validator>
  #providersManager: ProvidersManager
  #loggerManager: LoggerManager<KnownLoggers>

  /**
   * Lifecycle hooks
   */
  #hooks = new Hooks<{
    booted: HooksState<ContainerBindings, Validator, KnownLoggers>
    ready: HooksState<ContainerBindings, Validator, KnownLoggers>
    terminating: HooksState<ContainerBindings, Validator, KnownLoggers>
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
   * Reference to parsed environment variables. The value is defined
   * after the "init" method call
   */
  get env() {
    return this.#envManager.env
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
   * Reference to the AdonisJS IoC container. The value is defined
   * after the "init" method call
   */
  container!: Container<ContainerBindings>

  constructor(appRoot: URL, options: { environment: AppEnvironments; envValidator?: Validator }) {
    this.#appRoot = appRoot
    this.#environment = options.environment
    this.#loggerManager = new LoggerManager()
    this.#nodeEnvManager = new NodeEnvManager()
    this.#configManager = new ConfigManager(this.appRoot)
    this.#rcFileManager = new RcFileManager(this.appRoot)
    this.#metaDataManager = new MetaDataManager(this.appRoot)
    this.#envManager = new EnvManager(this.appRoot, options.envValidator)
    this.#providersManager = new ProvidersManager(this.appRoot, {
      environment: this.#environment,
      providersState: [this],
    })
    this.#preloadsManager = new PreloadsManager(this.appRoot, {
      environment: this.#environment,
    })

    this.#nodeEnvManager.process()
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
   * Specify the contents for environment variables as
   * a string. Calling this method will disable
   * reading .env files from the disk
   */
  envContents(contents: string): this {
    this.#envManager.envContents(contents)
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
      return
    }

    this.#instantiateContainer()
    await this.#metaDataManager.process()
    await this.#rcFileManager.process()
    await this.#envManager.process()
    await this.#configManager.process(this.rcFile.directories.config)
    this.#loggerManager.configure()
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
      return
    }

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
      [Application<ContainerBindings, Validator, KnownLoggers>],
      [Application<ContainerBindings, Validator, KnownLoggers>]
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
      return
    }

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
  }

  /**
   * Register hooks that are called when the app is
   * ready
   */
  ready(
    handler: HookHandler<
      [Application<ContainerBindings, Validator, KnownLoggers>],
      [Application<ContainerBindings, Validator, KnownLoggers>]
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
      [Application<ContainerBindings, Validator, KnownLoggers>],
      [Application<ContainerBindings, Validator, KnownLoggers>]
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
      return
    }

    this.#terminating = true
    await this.#hooks.runner('terminating').run(this)
    await this.#providersManager.shutdown()
    this.#hooks.clear('terminating')
    this.#state = 'terminated'
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
