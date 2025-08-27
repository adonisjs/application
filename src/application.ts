/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Hooks from '@poppinss/hooks'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'
import { Container } from '@adonisjs/fold'
import Macroable from '@poppinss/macroable'
import { importDefault } from '@poppinss/utils'
import type { HookHandler } from '@poppinss/hooks/types'
import { RuntimeException } from '@poppinss/utils/exception'

import debug from './debug.ts'
import generators from './generators.ts'
import { ConfigManager } from './managers/config.ts'
import { RcFileManager } from './managers/rc_file.ts'
import { NodeEnvManager } from './managers/node_env.ts'
import { PreloadsManager } from './managers/preloads.ts'
import { ProvidersManager } from './managers/providers.ts'
import type {
  Importer,
  SemverNode,
  HooksState,
  AppEnvironments,
  ApplicationStates,
  ExperimentalFlagsList,
} from './types.ts'
import { FeatureFlags } from './feature_flags.ts'

/**
 * Application class manages the state of an AdonisJS application. It includes:
 *
 * - Setting up the base features like importing config and setting up logger.
 * - Parsing the "adonisrc.js" file
 * - Setting up the IoC container
 * - Registering and booting providers
 * - Invoking lifecycle methods on the providers and hooks
 *
 * The Application class extends Macroable to allow runtime extension of functionality.
 * It manages the entire lifecycle from creation to termination, providing hooks at
 * each stage for customization.
 *
 * @template ContainerBindings - Type definition for IoC container bindings
 * @extends {Macroable}
 * @class Application
 */
export class Application<ContainerBindings extends Record<any, any>> extends Macroable {
  /**
   * Importer function to import modules from the application context.
   * This function is used to dynamically import modules with proper
   * application context and error handling.
   *
   * @private
   * @type {Importer | undefined}
   * @memberof Application
   */
  #importer?: Importer

  /**
   * Flag to know if we have started the termination process.
   * Used to prevent multiple termination attempts and manage
   * graceful shutdown state.
   *
   * @private
   * @type {boolean}
   * @default false
   * @memberof Application
   */
  #terminating: boolean = false

  /**
   * The environment in which the app is running. Currently tracks
   * process managers like PM2 to adjust behavior accordingly.
   *
   * @private
   * @type {Object}
   * @property {boolean} pm2 - Whether the app is running under PM2
   * @memberof Application
   */
  #surroundedEnvironment = {
    pm2: false,
  }

  /**
   * Application root directory as a URL. This represents the base
   * path from which all other application paths are resolved.
   *
   * @private
   * @type {URL}
   * @memberof Application
   */
  #appRoot: URL

  /**
   * Current application environment (e.g., 'web', 'console', 'test').
   * Determines which providers and preloads are active.
   *
   * @private
   * @type {AppEnvironments}
   * @memberof Application
   */
  #environment: AppEnvironments

  /**
   * Current state of the application lifecycle. Tracks the progression
   * through states: created → initiated → booted → ready → terminated.
   *
   * @private
   * @type {ApplicationStates}
   * @default 'created'
   * @memberof Application
   */
  #state: ApplicationStates = 'created'

  /**
   * Configuration manager that handles loading and parsing of config files.
   *
   * @private
   * @type {ConfigManager}
   * @memberof Application
   */
  #configManager: ConfigManager

  /**
   * RC file manager that handles parsing of adonisrc.js file.
   *
   * @private
   * @type {RcFileManager}
   * @memberof Application
   */
  #rcFileManager: RcFileManager

  /**
   * Node environment manager that normalizes NODE_ENV values.
   *
   * @private
   * @type {NodeEnvManager}
   * @memberof Application
   */
  #nodeEnvManager: NodeEnvManager

  /**
   * Preloads manager that handles loading of preload files.
   *
   * @private
   * @type {PreloadsManager}
   * @memberof Application
   */
  #preloadsManager: PreloadsManager

  /**
   * Providers manager that handles registration and lifecycle of service providers.
   *
   * @private
   * @type {ProvidersManager}
   * @memberof Application
   */
  #providersManager: ProvidersManager

  /**
   * Lifecycle hooks manager that allows registering callbacks for different
   * application lifecycle events. Provides hooks for initiating, booting,
   * booted, starting, ready, and terminating phases.
   *
   * @private
   * @type {Hooks}
   * @memberof Application
   */
  #hooks = new Hooks<{
    initiating: HooksState<ContainerBindings>
    booting: HooksState<ContainerBindings>
    booted: HooksState<ContainerBindings>
    starting: HooksState<ContainerBindings>
    ready: HooksState<ContainerBindings>
    terminating: HooksState<ContainerBindings>
  }>()

  /**
   * Stores metadata information about the application including
   * app name, version, and AdonisJS version.
   *
   * @type {Map<string, any>}
   * @memberof Application
   */
  info: Map<'appName' | 'version' | 'adonisVersion' | string, any> = new Map()

  /**
   * Returns the application name from the info map.
   * Defaults to 'adonisjs_app' if not set.
   *
   * @readonly
   * @type {string}
   * @memberof Application
   */
  get appName() {
    return this.info.get('appName') || 'adonisjs_app'
  }

  /**
   * Returns the application version from the info map.
   * Returns null if no version is set.
   *
   * @readonly
   * @type {SemverNode | null}
   * @memberof Application
   */
  get version(): SemverNode | null {
    return this.info.get('version') || null
  }

  /**
   * The parsed version for the "@adonisjs/core" package.
   * Returns null if no version is available.
   *
   * @readonly
   * @type {SemverNode | null}
   * @memberof Application
   */
  get adonisVersion(): SemverNode | null {
    return this.info.get('adonisVersion') || null
  }

  /**
   * The URL for the root of the application directory.
   *
   * @readonly
   * @type {URL}
   * @memberof Application
   */
  get appRoot() {
    return this.#appRoot
  }

  /**
   * A boolean to know if the application has been booted.
   * Returns true when the application state is beyond 'initiated'.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get isBooted() {
    return this.#state !== 'created' && this.#state !== 'initiated'
  }

  /**
   * A boolean to know if the application is ready and fully started.
   * Returns true only when the application state is 'ready'.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get isReady() {
    return this.#state === 'ready'
  }

  /**
   * A boolean to know if the application has been terminated.
   * Returns true only when the application state is 'terminated'.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get isTerminated() {
    return this.#state === 'terminated'
  }

  /**
   * A boolean to know if the application is in the middle of
   * the termination process but not yet fully terminated.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get isTerminating() {
    return this.#terminating && this.#state !== 'terminated'
  }

  /**
   * Reference to the config instance. The value is available
   * after the "init" method has been called.
   *
   * @readonly
   * @type {any}
   * @memberof Application
   */
  get config() {
    return this.#configManager.config
  }

  /**
   * Reference to the parsed adonisrc.js file. The value is available
   * after the "init" method has been called.
   *
   * @readonly
   * @type {any}
   * @memberof Application
   */
  get rcFile() {
    return this.#rcFileManager.rcFile
  }

  /**
   * Normalized current NODE_ENV value. Converts common variations
   * to standard values (development, production, test).
   *
   * @readonly
   * @type {string}
   * @memberof Application
   */
  get nodeEnvironment() {
    return this.#nodeEnvManager.nodeEnvironment
  }

  /**
   * Returns true when the NODE_ENV is set to 'production'.
   * Useful for conditional logic based on production environment.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get inProduction(): boolean {
    return this.nodeEnvironment === 'production'
  }

  /**
   * Returns true when the NODE_ENV is set to 'development'.
   * Useful for enabling development-specific features.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get inDev(): boolean {
    return this.nodeEnvironment === 'development'
  }

  /**
   * Returns true when the NODE_ENV is set to 'test'.
   * Useful for enabling test-specific behavior.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get inTest(): boolean {
    return this.nodeEnvironment === 'test'
  }

  /**
   * Returns true if the process is managed and running under PM2.
   * Detected by checking for the pm2_id environment variable.
   *
   * @readonly
   * @type {boolean}
   * @memberof Application
   */
  get managedByPm2() {
    return this.#surroundedEnvironment.pm2
  }

  /**
   * Reference to scaffolding generators for creating application files.
   * Provides utilities for generating controllers, models, migrations, etc.
   *
   * @readonly
   * @type {any}
   * @memberof Application
   */
  get generators() {
    return generators
  }

  /**
   * Reference to the stubs module for scaffolding resources or ejecting stubs.
   * Provides functionality to create and manage code generation templates.
   *
   * @type {Object}
   * @property {Function} create - Factory function to create a StubsManager instance
   * @memberof Application
   */
  stubs = {
    create: async () => {
      const { StubsManager } = await import('./stubs/manager.js')
      return new StubsManager(this, this.makePath(this.rcFile.directories.stubs))
    },
  }

  /**
   * Feature flags manager for checking the status of experimental features.
   * Reads configuration from adonisrc.js experimental section.
   *
   * @type {FeatureFlags<ExperimentalFlagsList>}
   * @memberof Application
   */
  experimentalFlags = new FeatureFlags<ExperimentalFlagsList>(
    () => this.#rcFileManager.rcFile.experimental
  )

  /**
   * Flag indicating if VineJS provider is configured and available.
   * When true, the @vinejs/vine package can be safely imported.
   *
   * @type {boolean}
   * @default false
   * @memberof Application
   */
  usingVineJS: boolean = false

  /**
   * Flag indicating if Edge template engine provider is configured.
   * When true, the edge.js package can be safely imported.
   *
   * @type {boolean}
   * @default false
   * @memberof Application
   */
  usingEdgeJS: boolean = false

  /**
   * Reference to the AdonisJS IoC container. The container manages
   * dependency injection and service binding throughout the application.
   * Available after the "init" method has been called.
   *
   * @type {Container<ContainerBindings>}
   * @memberof Application
   */
  declare container: Container<ContainerBindings>

  /**
   * Creates an instance of Application.
   *
   * @param {URL} appRoot - The root URL of the application
   * @param {Object} options - Configuration options
   * @param {AppEnvironments} options.environment - The application environment
   * @param {Importer} [options.importer] - Optional module importer function
   * @memberof Application
   */
  constructor(appRoot: URL, options: { environment: AppEnvironments; importer?: Importer }) {
    super()

    this.#appRoot = appRoot
    this.#importer = options.importer
    this.#environment = options.environment
    this.#nodeEnvManager = new NodeEnvManager()
    this.#configManager = new ConfigManager(this.appRoot)
    this.#rcFileManager = new RcFileManager(this.appRoot)
    this.#providersManager = new ProvidersManager({
      environment: this.#environment,
      providersState: [this],
    })
    this.#preloadsManager = new PreloadsManager({
      environment: this.#environment,
    })
    this.#surroundedEnvironment.pm2 = !!process.env.pm2_id

    if (debug.enabled) {
      debug('app environment :%O', {
        pm2: this.#surroundedEnvironment.pm2,
        environment: this.#environment,
        nodeEnv: this.#nodeEnvManager.nodeEnvironment,
      })
    }
  }

  /**
   * Instantiate the application container
   *
   * @private
   * @memberof Application
   */
  #instantiateContainer() {
    this.container = new Container<ContainerBindings>()
  }

  /**
   * The current environment in which the application is running
   *
   * @returns {AppEnvironments} The current application environment
   * @memberof Application
   */
  getEnvironment(): AppEnvironments {
    return this.#environment
  }

  /**
   * Switch the environment in which the app is running. The
   * environment can only be changed before the app is booted.
   *
   * @param {AppEnvironments} environment - The new environment to set
   * @returns {this} Returns the application instance for method chaining
   * @throws {RuntimeException} When called after the app has been booted
   * @memberof Application
   */
  setEnvironment(environment: AppEnvironments): this {
    if (this.#state !== 'created' && this.#state !== 'initiated') {
      throw new RuntimeException('Cannot switch environment once the app has been booted')
    }

    debug('switching environment { from:"%s", to: "%s" }', this.#environment, environment)
    this.#environment = environment
    this.#preloadsManager.setEnvironment(environment)
    this.#providersManager.setEnvironment(environment)
    return this
  }

  /**
   * The current state of the application
   *
   * @returns {ApplicationStates} The current application state
   * @memberof Application
   */
  getState(): ApplicationStates {
    return this.#state
  }

  /**
   * Specify the contents of the "adonisrc.js" file as
   * an object. Calling this method will disable loading
   * the "adonisrc.js" file from the disk.
   *
   * @param {Record<string, any>} value - The RC file contents as an object
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  rcContents(value: Record<string, any>): this {
    this.#rcFileManager.rcContents(value)
    return this
  }

  /**
   * Define the config values to use when booting the
   * config provider. Calling this method disables
   * reading files from the config directory.
   *
   * @param {Record<any, any>} values - The config values to use
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  useConfig(values: Record<any, any>): this {
    this.#configManager.useConfig(values)
    return this
  }

  /**
   * Notify the parent process when the Node.js process is spawned with an IPC channel.
   * The arguments accepted are same as "process.send"
   *
   * @param {any} message - The message to send to the parent process
   * @param {any} [sendHandle] - Optional handle to send with the message
   * @param {Object} [options] - Options for sending the message
   * @param {boolean} [options.swallowErrors] - Whether to swallow errors
   * @param {boolean} [options.keepOpen] - Whether to keep the connection open
   * @param {function} [callback] - Callback function to handle send result
   * @memberof Application
   */
  notify(
    message: any,
    sendHandle?: any,
    options?: {
      swallowErrors?: boolean | undefined
      keepOpen?: boolean | undefined
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
   *
   * @param {NodeJS.Signals} signal - The signal to listen for
   * @param {NodeJS.SignalsListener} callback - The callback to execute when signal is received
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  listen(signal: NodeJS.Signals, callback: NodeJS.SignalsListener): this {
    process.on(signal, callback)
    return this
  }

  /**
   * Listen for a process signal once. This method is same as calling
   * "process.once(signal)"
   *
   * @param {NodeJS.Signals} signal - The signal to listen for
   * @param {NodeJS.SignalsListener} callback - The callback to execute when signal is received
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  listenOnce(signal: NodeJS.Signals, callback: NodeJS.SignalsListener): this {
    process.once(signal, callback)
    return this
  }

  /**
   * Listen for a process signal conditionally.
   *
   * @param {boolean} conditional - Whether to register the listener
   * @param {NodeJS.Signals} signal - The signal to listen for
   * @param {NodeJS.SignalsListener} callback - The callback to execute when signal is received
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  listenIf(conditional: boolean, signal: NodeJS.Signals, callback: NodeJS.SignalsListener): this {
    if (conditional) {
      process.on(signal, callback)
    }

    return this
  }

  /**
   * Listen for a process signal once conditionally.
   *
   * @param {boolean} conditional - Whether to register the listener
   * @param {NodeJS.Signals} signal - The signal to listen for
   * @param {NodeJS.SignalsListener} callback - The callback to execute when signal is received
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
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
   *
   * @param {HookHandler} handler - The hook handler function to register
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  initiating(
    handler: HookHandler<[Application<ContainerBindings>], [Application<ContainerBindings>]>
  ): this {
    this.#hooks.add('initiating', handler)
    return this
  }

  /**
   * Initiate the application. Calling this method performs following
   * operations:
   *
   * - Parses the "adonisrc.js" file
   * - Validate and set environment variables
   * - Loads the application config from the configured config dir.
   * - Configures the logger
   * - Instantiates the IoC container
   *
   * @returns {Promise<void>} Promise that resolves when initiation is complete
   * @memberof Application
   */
  async init(): Promise<void> {
    if (this.#state !== 'created') {
      debug('cannot initiate app from state "%s"', this.#state)
      return
    }

    debug('initiating app')

    /**
     * Metadata management is not considering part
     * of initiating the app
     */
    this.#instantiateContainer()

    /**
     * Notify we are about to initiate the app
     */
    await this.#hooks.runner('initiating').run(this)

    /**
     * Initiate essentials
     */
    await this.#rcFileManager.process()

    /**
     * Cleanup registered hooks
     */
    this.#hooks.clear('initiating')
    this.#state = 'initiated'
  }

  /**
   * Register hooks that are called before the app boot
   * process starts
   *
   * @param {HookHandler} handler - The hook handler function to register
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  booting(
    handler: HookHandler<[Application<ContainerBindings>], [Application<ContainerBindings>]>
  ): this {
    this.#hooks.add('booting', handler)
    return this
  }

  /**
   * Boot the application. Calling this method performs the following
   * operations:
   *
   * - Resolve providers and call the "register" method on them.
   * - Call the "boot" method on providers
   * - Run the "booted" hooks
   *
   * @returns {Promise<void>} Promise that resolves when boot is complete
   * @memberof Application
   */
  async boot(): Promise<void> {
    if (this.#state !== 'initiated') {
      debug('cannot boot app from state "%s"', this.#state)
      return
    }

    debug('booting app')

    /**
     * Execute booting hooks
     */
    await this.#hooks.runner('booting').run(this)
    this.#hooks.clear('booting')

    /**
     * Process node env and config files
     */
    this.#nodeEnvManager.process()
    await this.#configManager.process(this.rcFile.directories.config)

    /**
     * Boot providers
     */
    this.#providersManager.use(this.rcFile.providers)
    await this.#providersManager.register()
    await this.#providersManager.boot()

    /**
     * Notify the app is booted
     */
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
   *
   * @param {HookHandler} handler - The hook handler function to register
   * @returns {Promise<void>} Promise that resolves after the handler is executed
   * @memberof Application
   */
  async booted(
    handler: HookHandler<[Application<ContainerBindings>], [Application<ContainerBindings>]>
  ): Promise<void> {
    if (this.isBooted) {
      await handler(this)
    } else {
      this.#hooks.add('booted', handler)
    }
  }

  /**
   * Register hooks that are called when the app is starting
   *
   * @param {HookHandler} handler - The hook handler function to register
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  starting(
    handler: HookHandler<[Application<ContainerBindings>], [Application<ContainerBindings>]>
  ): this {
    this.#hooks.add('starting', handler)
    return this
  }

  /**
   * Start the application. Calling this method performs the following
   * operations:
   *
   * - Run the "start" lifecycle hooks on all the providers
   * - Start the application by invoking the supplied callback
   * - Run the "ready" lifecycle hooks on all the providers
   * - Run the "ready" application hooks
   *
   * @param {function} callback - The callback function to invoke when starting the app
   * @returns {Promise<void>} Promise that resolves when start is complete
   * @memberof Application
   */
  async start(callback: (app: this) => void | Promise<void>): Promise<void> {
    if (this.#state !== 'booted') {
      debug('cannot start app from state "%s"', this.#state)
      return
    }

    debug('starting app')

    /**
     * Pre start phase
     */
    await this.#providersManager.start()
    await this.#hooks.runner('starting').run(this)
    this.#hooks.clear('starting')

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
   * Register hooks that are called when the app is ready.
   *
   * The hook will be called immediately if the app is already ready.
   *
   * @param {HookHandler} handler - The hook handler function to register
   * @returns {Promise<void>} Promise that resolves after the handler is executed
   * @memberof Application
   */
  async ready(
    handler: HookHandler<[Application<ContainerBindings>], [Application<ContainerBindings>]>
  ): Promise<void> {
    if (this.isReady) {
      await handler(this)
    } else {
      this.#hooks.add('ready', handler)
    }
  }

  /**
   * Register hooks that are called before the app is terminated.
   *
   * @param {HookHandler} handler - The hook handler function to register
   * @returns {this} Returns the application instance for method chaining
   * @memberof Application
   */
  terminating(
    handler: HookHandler<[Application<ContainerBindings>], [Application<ContainerBindings>]>
  ): this {
    this.#hooks.add('terminating', handler)
    return this
  }

  /**
   * Terminate application gracefully. Calling this method performs
   * the following operations:
   *
   * - Run "shutdown" hooks on all the providers
   * - Run "terminating" app lifecycle hooks
   *
   * @returns {Promise<void>} Promise that resolves when termination is complete
   * @memberof Application
   */
  async terminate(): Promise<void> {
    if (this.#state === 'created' || this.#state === 'terminated') {
      debug('cannot terminate app from state "%s"', this.#state)
      return
    }

    if (this.#terminating) {
      debug('app is already being terminated')
      return
    }

    debug('terminating app')

    this.#terminating = true
    await this.#hooks.runner('terminating').runReverse(this)
    await this.#providersManager.shutdown(true)
    this.#hooks.clear('terminating')
    this.#state = 'terminated'
  }

  /**
   * Returns relative path to a file from the app root
   *
   * @param {string} absolutePath - The absolute path to convert
   * @returns {string} The relative path from app root
   * @memberof Application
   */
  relativePath(absolutePath: string): string {
    return relative(fileURLToPath(this.appRoot), absolutePath)
  }

  /**
   * Returns URL to a path from the application root.
   *
   * @param {...string} paths - Path segments to join
   * @returns {URL} The constructed URL
   * @memberof Application
   */
  makeURL(...paths: string[]): URL {
    return new URL(join(...paths), this.#appRoot)
  }

  /**
   * Returns file system path from the application root.
   *
   * @param {...string} paths - Path segments to join
   * @returns {string} The constructed file system path
   * @memberof Application
   */
  makePath(...paths: string[]): string {
    return fileURLToPath(this.makeURL(...paths))
  }

  /**
   * Makes path to the config directory
   *
   * @param {...string} paths - Path segments to append to config directory
   * @returns {string} The constructed config directory path
   * @memberof Application
   */
  configPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.config, ...paths)
  }

  /**
   * Makes path to the public directory
   *
   * @param {...string} paths - Path segments to append to public directory
   * @returns {string} The constructed public directory path
   * @memberof Application
   */
  publicPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.public, ...paths)
  }

  /**
   * Makes path to the providers directory
   *
   * @param {...string} paths - Path segments to append to providers directory
   * @returns {string} The constructed providers directory path
   * @memberof Application
   */
  providersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.providers, ...paths)
  }

  /**
   * Makes path to the factories directory
   *
   * @param {...string} paths - Path segments to append to factories directory
   * @returns {string} The constructed factories directory path
   * @memberof Application
   */
  factoriesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.factories, ...paths)
  }

  /**
   * Makes path to the migrations directory
   *
   * @param {...string} paths - Path segments to append to migrations directory
   * @returns {string} The constructed migrations directory path
   * @memberof Application
   */
  migrationsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.migrations, ...paths)
  }

  /**
   * Makes path to the seeders directory
   *
   * @param {...string} paths - Path segments to append to seeders directory
   * @returns {string} The constructed seeders directory path
   * @memberof Application
   */
  seedersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.seeders, ...paths)
  }

  /**
   * Makes path to the language files directory
   *
   * @param {...string} paths - Path segments to append to language files directory
   * @returns {string} The constructed language files directory path
   * @memberof Application
   */
  languageFilesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.languageFiles, ...paths)
  }

  /**
   * Makes path to the views directory
   *
   * @param {...string} paths - Path segments to append to views directory
   * @returns {string} The constructed views directory path
   * @memberof Application
   */
  viewsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.views, ...paths)
  }

  /**
   * Makes path to the start directory
   *
   * @param {...string} paths - Path segments to append to start directory
   * @returns {string} The constructed start directory path
   * @memberof Application
   */
  startPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.start, ...paths)
  }

  /**
   * Makes path to the tmp directory
   *
   * @param {...string} paths - Path segments to append to tmp directory
   * @returns {string} The constructed tmp directory path
   * @memberof Application
   */
  tmpPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.tmp, ...paths)
  }

  /**
   * Makes path to the contracts directory
   *
   * @param {...string} paths - Path segments to append to contracts directory
   * @returns {string} The constructed contracts directory path
   * @deprecated Use "types" directory instead
   * @memberof Application
   */
  contractsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.contracts, ...paths)
  }

  /**
   * Makes path to the http controllers directory
   *
   * @param {...string} paths - Path segments to append to http controllers directory
   * @returns {string} The constructed http controllers directory path
   * @memberof Application
   */
  httpControllersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.httpControllers, ...paths)
  }

  /**
   * Makes path to the models directory
   *
   * @param {...string} paths - Path segments to append to models directory
   * @returns {string} The constructed models directory path
   * @memberof Application
   */
  modelsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.models, ...paths)
  }

  /**
   * Makes path to the services directory
   *
   * @param {...string} paths - Path segments to append to services directory
   * @returns {string} The constructed services directory path
   * @memberof Application
   */
  servicesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.services, ...paths)
  }

  /**
   * Makes path to the exceptions directory
   *
   * @param {...string} paths - Path segments to append to exceptions directory
   * @returns {string} The constructed exceptions directory path
   * @memberof Application
   */
  exceptionsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.exceptions, ...paths)
  }

  /**
   * Makes path to the mailers directory
   *
   * @param {...string} paths - Path segments to append to mailers directory
   * @returns {string} The constructed mailers directory path
   * @memberof Application
   */
  mailersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.mailers, ...paths)
  }

  /**
   * Makes path to the mails directory
   *
   * @param {...string} paths - Path segments to append to mails directory
   * @returns {string} The constructed mails directory path
   * @memberof Application
   */
  mailsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.mails, ...paths)
  }

  /**
   * Makes path to the middleware directory
   *
   * @param {...string} paths - Path segments to append to middleware directory
   * @returns {string} The constructed middleware directory path
   * @memberof Application
   */
  middlewarePath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.middleware, ...paths)
  }

  /**
   * Makes path to the policies directory
   *
   * @param {...string} paths - Path segments to append to policies directory
   * @returns {string} The constructed policies directory path
   * @memberof Application
   */
  policiesPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.policies, ...paths)
  }

  /**
   * Makes path to the validators directory
   *
   * @param {...string} paths - Path segments to append to validators directory
   * @returns {string} The constructed validators directory path
   * @memberof Application
   */
  validatorsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.validators, ...paths)
  }

  /**
   * Makes path to the commands directory
   *
   * @param {...string} paths - Path segments to append to commands directory
   * @returns {string} The constructed commands directory path
   * @memberof Application
   */
  commandsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.commands, ...paths)
  }

  /**
   * Makes path to the events directory
   *
   * @param {...string} paths - Path segments to append to events directory
   * @returns {string} The constructed events directory path
   * @memberof Application
   */
  eventsPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.events, ...paths)
  }

  /**
   * Makes path to the listeners directory
   *
   * @param {...string} paths - Path segments to append to listeners directory
   * @returns {string} The constructed listeners directory path
   * @memberof Application
   */
  listenersPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.listeners, ...paths)
  }

  /**
   * Makes path to the client directory for writing generated
   * output
   *
   * @param {...string} paths - Path segments to append to events directory
   * @returns {string} The constructed directory path
   * @memberof Application
   */
  generatedClientPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.generatedClient, ...paths)
  }

  /**
   * Makes path to the server directory for writing generated
   * output
   *
   * @param {...string} paths - Path segments to append to events directory
   * @returns {string} The constructed directory path
   * @memberof Application
   */
  generatedServerPath(...paths: string[]): string {
    return this.makePath(this.rcFile.directories.generatedServer, ...paths)
  }

  /**
   * Import a module by identifier. This method uses the importer function
   * defined at the time of creating the application instance and throws
   * an error if no importer was defined.
   *
   * @param {string} moduleIdentifier - The module identifier to import
   * @returns {any} The imported module
   * @throws {RuntimeException} When no importer function is defined
   * @memberof Application
   */
  import(moduleIdentifier: string) {
    if (!this.#importer) {
      throw new RuntimeException(
        `Cannot import "${moduleIdentifier}". Register a module importer with the application first.`
      )
    }
    return this.#importer(moduleIdentifier)
  }

  /**
   * Import a module by identifier and return its default export. This method uses the importer function
   * defined at the time of creating the application instance and throws
   * an error if no importer was defined.
   *
   * @template T - The type of the default export
   * @param {string} moduleIdentifier - The module identifier to import
   * @returns The default export of the imported module
   * @throws {RuntimeException} When no importer function is defined
   * @memberof Application
   */
  importDefault<T extends object>(moduleIdentifier: string) {
    if (!this.#importer) {
      throw new RuntimeException(
        `Cannot import "${moduleIdentifier}". Register a module importer with the application first.`
      )
    }

    return importDefault<T>(() => this.#importer!(moduleIdentifier))
  }

  /**
   * JSON representation of the application
   *
   * @returns The application state as a JSON object
   * @memberof Application
   */
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
