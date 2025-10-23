/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils/exception'

import debug from '../debug.ts'
import type { ProviderNode, AppEnvironments, ContainerProviderContract } from '../types.ts'
import {
  providerBoot,
  providerStart,
  providerReady,
  providerShutdown,
  providerRegister,
} from '../tracing_channels.ts'

/**
 * ProvidersManager handles the complete lifecycle of service providers in an AdonisJS application.
 * It manages provider registration, booting, starting, readying, and shutdown phases.
 *
 * Service providers are classes that register services, bind dependencies, and set up
 * application components during different phases of the application lifecycle.
 *
 * Lifecycle phases:
 * 1. **Register**: Bind services to the IoC container
 * 2. **Boot**: Initialize services after all providers are registered
 * 3. **Start**: Start services (e.g., HTTP server, background jobs)
 * 4. **Ready**: Notify services that application is ready to serve requests
 * 5. **Shutdown**: Gracefully shutdown services during app termination
 *
 * @example
 * const manager = new ProvidersManager({ environment: 'web', providersState: [app] })
 * manager.use([
 *   { file: () => import('./providers/app_provider'), environment: ['web', 'console'] }
 * ])
 * await manager.register()
 * await manager.boot()
 * await manager.start()
 * await manager.ready()
 */
export class ProvidersManager {
  /**
   * Array of instantiated provider instances used throughout the application lifecycle.
   * These instances are created during the register phase and reused for all subsequent phases.
   *
   * @private
   * @type {ContainerProviderContract[]}
   * @default []
   */
  #providers: ContainerProviderContract[] = []

  /**
   * Array of provider instances that implement the shutdown lifecycle method.
   * Kept separately to enable efficient shutdown processing without scanning all providers.
   * These providers are called during application termination for cleanup.
   *
   * @private
   * @type {ContainerProviderContract[]}
   * @default []
   */
  #providersWithShutdownListeners: ContainerProviderContract[] = []

  /**
   * Array of provider nodes from the adonisrc.js configuration.
   * Each node contains the import function and environment restrictions.
   * Cleared after providers are resolved and instantiated.
   *
   * @private
   * @type {ProviderNode[]}
   * @default []
   */
  #list: ProviderNode[] = []

  /**
   * Configuration options for the providers manager.
   *
   * @private
   * @type {Object}
   * @property {AppEnvironments} environment - Current application environment for filtering providers
   * @property {any[]} providersState - Arguments passed to provider constructors (typically [app])
   */
  #options: {
    environment: AppEnvironments
    providersState: any[]
  }

  /**
   * Creates a new ProvidersManager instance.
   *
   * @param {Object} options - Configuration options
   * @param {AppEnvironments} options.environment - Current application environment
   * @param {any[]} options.providersState - Arguments to pass to provider constructors
   */
  constructor(options: { environment: AppEnvironments; providersState: any[] }) {
    this.#options = options
  }

  /**
   * Filters providers based on the current application environment.
   * Returns false for 'unknown' environments for security.
   *
   * @private
   * @param {ProviderNode} provider - The provider node to filter
   * @returns {boolean} Whether the provider should be included in the current environment
   */
  #filterByEnvironment(provider: ProviderNode): boolean {
    if (this.#options.environment === 'unknown') {
      return false
    }

    return provider.environment.includes(this.#options.environment)
  }

  /**
   * Checks if a value is a class constructor by examining its string representation.
   * Used to validate that provider exports are proper class constructors.
   *
   * @private
   * @param {any} providerClass - The value to check
   * @returns {boolean} Whether the value is a class constructor
   */
  #isAClass(providerClass: any): boolean {
    return typeof providerClass === 'function' && providerClass.toString().startsWith('class ')
  }

  /**
   * Imports and validates a provider module from its import function.
   * Ensures the provider exports a default class constructor.
   *
   * @private
   * @param {ProviderNode} provider - The provider node to resolve
   * @returns {Promise<new (...args: any[]) => ContainerProviderContract | null>} The provider class constructor or null
   * @throws {RuntimeException} When provider has invalid exports or non-class default export
   */
  async #resolveProvider(provider: ProviderNode): Promise<{
    new (...args: any[]): ContainerProviderContract
  } | null> {
    const providerExports = await provider.file()
    const exportsLength = Object.keys(providerExports).length

    /**
     * Return null when there are no exports
     */
    if (exportsLength === 0) {
      return null
    }

    /**
     * If there are exports and not a default export, then we consider
     * it to be an invalid provider
     */
    if (!providerExports.default) {
      throw new RuntimeException(
        `Invalid exports from "${provider.file.toString()}" provider. It must have a default export`
      )
    }

    /**
     * If the default export is not a class, then also we consider it
     * to be an invalid provider
     */
    if (!this.#isAClass(providerExports.default)) {
      throw new RuntimeException(
        `Default export from module "${provider.file.toString()}" is not a class`
      )
    }

    return providerExports.default
  }

  /**
   * Resolves all providers that match the current environment.
   * Filters by environment and imports provider modules in parallel.
   *
   * @private
   * @returns {Promise<Array<new (...args: any[]) => ContainerProviderContract | null>>} Promise that resolves to array of provider classes
   */
  #resolve() {
    const providers = this.#list.filter((provider) => this.#filterByEnvironment(provider))
    debug('loading providers %O', providers)

    return Promise.all(providers.map((provider) => this.#resolveProvider(provider)))
  }

  /**
   * Registers an array of provider nodes to be processed later.
   * Replaces any previously registered providers.
   *
   * @param {ProviderNode[]} list - Array of provider nodes to register
   * @returns {this} Returns the ProvidersManager instance for method chaining
   */
  use(list: ProviderNode[]): this {
    this.#list = list
    return this
  }

  /**
   * Changes the environment context for filtering providers.
   * Used when the application environment changes after manager creation.
   *
   * @param {AppEnvironments} environment - The new environment to set
   * @returns {this} Returns the ProvidersManager instance for method chaining
   */
  setEnvironment(environment: AppEnvironments): this {
    debug(
      'switching environment for providers { from:"%s", to: "%s" }',
      this.#options.environment,
      environment
    )
    this.#options.environment = environment
    return this
  }

  /**
   * Phase 1: Resolves, instantiates, and calls register() on all providers.
   * Creates provider instances and invokes their register methods to bind services to the IoC container.
   * Sets up tracking for providers with shutdown methods.
   *
   * @returns {Promise<void>} Promise that resolves when all providers are registered
   */
  async register() {
    const providers = await this.#resolve()
    this.#list = []

    providers.forEach((provider) => {
      if (provider) {
        debug('registering "%s"', provider.name)
        const providerInstance = new provider(...this.#options.providersState)
        this.#providers.push(providerInstance)

        if (providerInstance.shutdown) {
          this.#providersWithShutdownListeners.push(providerInstance)
        }

        if (providerInstance.register) {
          providerRegister.traceSync(
            providerInstance.register,
            providerRegister.hasSubscribers ? { provider: providerInstance } : undefined,
            providerInstance
          )
        }
      }
    })
  }

  /**
   * Phase 2: Calls boot() method on all registered providers.
   * Boot phase occurs after all providers have registered their services,
   * allowing providers to use services from other providers.
   *
   * @returns {Promise<void>} Promise that resolves when all providers are booted
   */
  async boot() {
    for (let provider of this.#providers) {
      if (provider.boot) {
        debug('booting "%s"', provider.constructor.name)
        await providerBoot.tracePromise(
          provider.boot as () => Promise<void>,
          providerBoot.hasSubscribers ? { provider } : undefined,
          provider
        )
      }
    }
  }

  /**
   * Phase 3: Calls start() method on all providers.
   * Start phase is for launching services like HTTP servers, background workers, etc.
   *
   * @returns {Promise<void>} Promise that resolves when all providers are started
   */
  async start() {
    for (let provider of this.#providers) {
      if (provider.start) {
        debug('invoking "%s" start method', provider.constructor.name)
        await providerStart.tracePromise(
          provider.start as () => Promise<void>,
          providerStart.hasSubscribers ? { provider } : undefined,
          provider
        )
      }
    }
  }

  /**
   * Phase 4: Calls ready() method on all providers.
   * Ready phase indicates the application is fully started and ready to serve requests.
   * Clears the providers array after completion as they're no longer needed.
   *
   * @returns {Promise<void>} Promise that resolves when all providers are ready
   */
  async ready() {
    for (let provider of this.#providers) {
      if (provider.ready) {
        debug('invoking "%s" ready method', provider.constructor.name)
        await providerReady.tracePromise(
          provider.ready as () => Promise<void>,
          providerReady.hasSubscribers ? { provider } : undefined,
          provider
        )
      }
    }

    this.#providers = []
  }

  /**
   * Phase 5: Calls shutdown() method on providers that implement it.
   * Shutdown phase allows providers to perform cleanup during graceful app termination.
   * Only providers with shutdown methods are called.
   *
   * @param {boolean} inReverseOrder - Whether to shutdown providers in reverse order (recommended for cleanup)
   * @returns {Promise<void>} Promise that resolves when all providers are shutdown
   */
  async shutdown(inReverseOrder: boolean) {
    const providersWithShutdownListeners = inReverseOrder
      ? Array.from(this.#providersWithShutdownListeners).reverse()
      : Array.from(this.#providersWithShutdownListeners)

    this.#providersWithShutdownListeners = []

    for (let provider of providersWithShutdownListeners) {
      if (provider.shutdown) {
        debug('shutting down "%s"', provider.constructor.name)
        await providerShutdown.tracePromise(
          provider.shutdown as () => Promise<void>,
          providerShutdown.hasSubscribers ? { provider } : undefined,
          provider
        )
      }
    }
  }
}
