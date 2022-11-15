/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { resolveOptional } from '../helpers.js'
import type { AppEnvironments, PreloadNode } from '../types.js'

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
  #appRoot: URL

  /**
   * The options accepted by the manager.
   */
  #options: {
    environment: AppEnvironments
  }

  constructor(appRoot: URL, options: { environment: AppEnvironments }) {
    this.#appRoot = appRoot
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
  async #importPreloadModule(preload: PreloadNode): Promise<void> {
    /**
     * Import preload paths which are not optional
     */
    if (!preload.optional) {
      return import(await import.meta.resolve!(preload.file, this.#appRoot))
    }

    /**
     * Optionally resolve module
     */
    const resolvedPath = await resolveOptional(preload.file, this.#appRoot)
    if (resolvedPath) {
      await import(resolvedPath)
    }
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
    await Promise.all(
      this.#list
        .filter((preload) => this.#filterByEnvironment(preload))
        .map((preload) => this.#importPreloadModule(preload))
    )

    this.#list = []
  }
}
