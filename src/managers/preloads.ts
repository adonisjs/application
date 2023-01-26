/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import debug from '../debug.js'
import type { AppEnvironments, Importer, PreloadNode } from '../types.js'

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
   * The application root path
   */
  #importer: Importer

  /**
   * The options accepted by the manager.
   */
  #options: {
    environment: AppEnvironments
  }

  constructor(importer: Importer, options: { environment: AppEnvironments }) {
    this.#importer = importer
    this.#options = options
  }

  /**
   * Filters the preload modules by the current environment.
   */
  #filterByEnvironment(provider: PreloadNode) {
    if (this.#options.environment === 'unknown') {
      return false
    }

    return provider.environment.includes(this.#options.environment)
  }

  /**
   * Imports a preload module from the registered path. The method relies
   * on "--experimental-import-meta-resolve" flag to resolve paths from
   * the app root.
   */
  #importPreloadModule(preload: PreloadNode): Promise<void> {
    return this.#importer(preload.file)
  }

  /**
   * Pass an array of preload modules to import
   */
  use(list: PreloadNode[]): this {
    this.#list = list
    return this
  }

  /**
   * Import preload files
   */
  async import() {
    const preloads = this.#list.filter((preload) => this.#filterByEnvironment(preload))
    debug('preloading modules %O', preloads)

    await Promise.all(preloads.map((preload) => this.#importPreloadModule(preload)))

    this.#list = []
  }
}
