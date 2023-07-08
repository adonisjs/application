/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { importDefault, RuntimeException } from '@poppinss/utils'

import debug from '../debug.js'
import type {
  Importer,
  ProviderNode,
  AppEnvironments,
  ContainerProviderContract,
} from '../types.js'

/**
 * The ProvidersManager class is used to resolve, import and execute lifecycle
 * methods on registered providers.
 *
 * The class relies on "import.meta.resolve" to resolve the provider modules from
 * the root of the application.
 *
 * Also, a single instance of the provider is used to executed all the hooks.
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
   * An array of providers modules
   */
  #list: ProviderNode[] = []

  /**
   * The application root path
   */
  #importer: Importer

  /**
   * The options accepted by the manager
   */
  #options: {
    environment: AppEnvironments
    providersState: any[]
  }

  constructor(
    importer: Importer,
    options: { environment: AppEnvironments; providersState: any[] }
  ) {
    this.#importer = importer
    this.#options = options
  }

  /**
   * Filters the providers by the current environment.
   */
  #filterByEnvironment(provider: ProviderNode) {
    if (this.#options.environment === 'unknown') {
      return false
    }

    return provider.environment.includes(this.#options.environment)
  }

  /**
   * Ensure the value is a valid ES class
   */
  #ensureIsClass(providerPath: string, providerClass: any) {
    if (typeof providerClass !== 'function' || !providerClass.toString().startsWith('class ')) {
      throw new RuntimeException(`Default export from module "${providerPath}" is not a class`)
    }
  }

  /**
   * Resolves a provider module path and imports it
   */
  async #importProvider(providerPath: string) {
    return importDefault<{ default: any }>(() => this.#importer(providerPath), providerPath)
  }

  /**
   * Imports all providers from the registered module path. The method relies
   * on --experimental-import-meta-resolve flag to resolve paths from
   * the app root.
   */
  async #resolveProvider(provider: ProviderNode): Promise<{
    new (...args: any[]): ContainerProviderContract
  }> {
    const providerClass = await this.#importProvider(provider.file)
    this.#ensureIsClass(provider.file, providerClass)

    return providerClass
  }

  /**
   * Resolves all providers from the supplied list of module paths.
   */
  #resolve() {
    const providers = this.#list.filter((provider) => this.#filterByEnvironment(provider))
    debug('loading providers %O', providers)

    return Promise.all(providers.map((provider) => this.#resolveProvider(provider)))
  }

  /**
   * Pass an array of providers to use
   */
  use(list: ProviderNode[]): this {
    this.#list = list
    return this
  }

  /**
   * Switch the environment in which the app is running.
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
   */
  async register() {
    const providers = await this.#resolve()
    this.#list = []

    providers.forEach((provider) => {
      const providerInstance = new provider(...this.#options.providersState)
      this.#providers.push(providerInstance)

      if (providerInstance.shutdown) {
        this.#providersWithShutdownListeners.push(providerInstance)
      }

      if (providerInstance.register) {
        providerInstance.register()
      }
    })
  }

  /**
   * Invoke boot method on the providers. The existing providers
   * instances are used.
   */
  async boot() {
    for (let provider of this.#providers) {
      if (provider.boot) {
        await provider.boot()
      }
    }
  }

  /**
   * Invoke start method on all the providers
   */
  async start() {
    for (let provider of this.#providers) {
      if (provider.start) {
        await provider.start()
      }
    }
  }

  /**
   * Invoke ready method on all the providers
   */
  async ready() {
    for (let provider of this.#providers) {
      if (provider.ready) {
        await provider.ready()
      }
    }

    this.#providers = []
  }

  /**
   * Invoke shutdown method on all the providers
   */
  async shutdown() {
    for (let provider of this.#providersWithShutdownListeners) {
      if (provider.shutdown) {
        await provider.shutdown()
      }
    }

    this.#providersWithShutdownListeners = []
  }
}
