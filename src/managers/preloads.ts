/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import debug from '../debug.ts'
import type { AppEnvironments, PreloadNode } from '../types.ts'

/**
 * The PreloadsManager class is used to resolve and import preload modules.
 *
 * The class relies on "import.meta.resolve" to resolve the provider modules from
 * the root of the application.
 */
export class PreloadsManager {
  /**
   * List of registered preloads
   */
  #list: PreloadNode[] = []

  /**
   * The options accepted by the manager.
   */
  #options: {
    environment: AppEnvironments
  }

  /**
   * Creates a new PreloadsManager instance
   *
   * @param options - Configuration options including environment
   */
  constructor(options: { environment: AppEnvironments }) {
    this.#options = options
  }

  /**
   * Filters the preload modules by the current environment.
   *
   * @param provider - The preload node to filter
   * @returns Whether the preload should be included in the current environment
   */
  #filterByEnvironment(provider: PreloadNode) {
    if (this.#options.environment === 'unknown') {
      return false
    }

    return provider.environment.includes(this.#options.environment)
  }

  /**
   * Pass an array of preload modules to import
   *
   * @param list - Array of preload modules to register
   * @returns this - Returns the PreloadsManager instance for method chaining
   */
  use(list: PreloadNode[]): this {
    this.#list = list
    return this
  }

  /**
   * Switch the environment in which the app is running.
   *
   * @param environment - The new environment to set
   * @returns this - Returns the PreloadsManager instance for method chaining
   */
  setEnvironment(environment: AppEnvironments): this {
    debug(
      'switching environment for preloads { from:"%s", to: "%s" }',
      this.#options.environment,
      environment
    )
    this.#options.environment = environment
    return this
  }

  /**
   * Import preload files
   *
   * @returns Promise that resolves when all preload modules have been imported
   */
  async import() {
    const preloads = this.#list.filter((preload) => this.#filterByEnvironment(preload))
    debug('preloading modules %O', preloads)

    await Promise.all(preloads.map((preload) => preload.file()))

    this.#list = []
  }
}
