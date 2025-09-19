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
 * Preload modules are files that should be loaded before the application starts,
 * typically for initialization code or setup tasks.
 *
 * The class relies on "import.meta.resolve" to resolve the provider modules from
 * the root of the application.
 * 
 * @example
 * const manager = new PreloadsManager({ environment: 'web' })
 * manager.use([{ file: () => import('./preloads/routes'), environment: ['web'] }])
 * await manager.import()
 */
export class PreloadsManager {
  /**
   * List of registered preload modules to be imported.
   * Each preload node contains the import function and environment restrictions.
   * 
   * @private
   * @type {PreloadNode[]}
   * @default []
   */
  #list: PreloadNode[] = []

  /**
   * Configuration options for the preloads manager.
   * Contains the current application environment used for filtering preloads.
   * 
   * @private
   * @type {Object}
   * @property {AppEnvironments} environment - The current application environment
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
   * Filters preload modules by the current environment.
   * Returns false for 'unknown' environments for security.
   *
   * @private
   * @param {PreloadNode} provider - The preload node to filter
   * @returns {boolean} Whether the preload should be included in the current environment
   */
  #filterByEnvironment(provider: PreloadNode) {
    if (this.#options.environment === 'unknown') {
      return false
    }

    return provider.environment.includes(this.#options.environment)
  }

  /**
   * Registers an array of preload modules to be imported later.
   * Replaces any previously registered preloads.
   *
   * @param {PreloadNode[]} list - Array of preload modules to register
   * @returns {this} Returns the PreloadsManager instance for method chaining
   */
  use(list: PreloadNode[]): this {
    this.#list = list
    return this
  }

  /**
   * Changes the environment context for filtering preloads.
   * Used when the application environment changes after manager creation.
   *
   * @param {AppEnvironments} environment - The new environment to set
   * @returns {this} Returns the PreloadsManager instance for method chaining
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
   * Imports all registered preload modules that match the current environment.
   * Clears the preloads list after importing to prevent duplicate imports.
   *
   * @returns {Promise<void>} Promise that resolves when all preload modules have been imported
   */
  async import() {
    const preloads = this.#list.filter((preload) => this.#filterByEnvironment(preload))
    debug('preloading modules %O', preloads)

    await Promise.all(preloads.map((preload) => preload.file()))

    this.#list = []
  }
}
