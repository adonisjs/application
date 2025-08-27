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
 * The ProvidersManager class is used to resolve, import and execute lifecycle
 * methods on registered providers.
 *
 * The class relies on "import.meta.resolve" to resolve the provider modules from
 * the root of the application.
 *
 * Also, a single instance of the provider is used to execute all the hooks.
 */
export class ProvidersManager {
  /**
   * An array of collected providers
   */
  #providers: ContainerProviderContract[] = []

  /**
   * An array of providers with the `shutdown` method. We release the
   * values from the providers array and only keep the once with
   * shutdown method
   */
  #providersWithShutdownListeners: ContainerProviderContract[] = []

  /**
   * An array of providers modules picked from the ".adonisrc.ts"
   * file.
   */
  #list: ProviderNode[] = []

  /**
   * The options accepted by the manager
   */
  #options: {
    environment: AppEnvironments
    providersState: any[]
  }

  /**
   * Creates a new ProvidersManager instance
   *
   * @param options - Configuration options including environment and provider state
   */
  constructor(options: { environment: AppEnvironments; providersState: any[] }) {
    this.#options = options
  }

  /**
   * Filters the providers by the current environment.
   *
   * @param provider - The provider node to filter
   * @returns Whether the provider should be included in the current environment
   */
  #filterByEnvironment(provider: ProviderNode) {
    if (this.#options.environment === 'unknown') {
      return false
    }

    return provider.environment.includes(this.#options.environment)
  }

  /**
   * Check if value is a class
   *
   * @param providerClass - The value to check
   * @returns Whether the value is a class constructor
   */
  #isAClass(providerClass: any) {
    return typeof providerClass === 'function' && providerClass.toString().startsWith('class ')
  }

  /**
   * Imports all providers from the registered module path. The method relies
   * on --experimental-import-meta-resolve flag to resolve paths from
   * the app root.
   *
   * @param provider - The provider node to resolve
   * @returns The provider class constructor or null
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
   * Resolves all providers from the supplied list of module paths.
   *
   * @returns Promise that resolves to array of provider classes
   */
  #resolve() {
    const providers = this.#list.filter((provider) => this.#filterByEnvironment(provider))
    debug('loading providers %O', providers)

    return Promise.all(providers.map((provider) => this.#resolveProvider(provider)))
  }

  /**
   * Pass an array of providers to use
   *
   * @param list - Array of provider nodes to register
   * @returns this - Returns the ProvidersManager instance for method chaining
   */
  use(list: ProviderNode[]): this {
    this.#list = list
    return this
  }

  /**
   * Switch the environment in which the app is running.
   *
   * @param environment - The new environment to set
   * @returns this - Returns the ProvidersManager instance for method chaining
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
   * Invoke register method on the providers.
   *
   * @returns Promise that resolves when all providers are registered
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
   * Invoke boot method on the providers. The existing providers
   * instances are used.
   *
   * @returns Promise that resolves when all providers are booted
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
   * Invoke start method on all the providers
   *
   * @returns Promise that resolves when all providers are started
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
   * Invoke ready method on all the providers
   *
   * @returns Promise that resolves when all providers are ready
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
   * Invoke shutdown method on all the providers
   *
   * @param inReverseOrder - Whether to shutdown providers in reverse order
   * @returns Promise that resolves when all providers are shutdown
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
