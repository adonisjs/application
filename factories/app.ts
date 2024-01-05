/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/application.js'
import type { AppEnvironments, Importer } from '../src/types.js'

/**
 * App factory is used to generate application class instances for
 * testing
 */
export class AppFactory<ContainerBindings extends Record<any, any>> {
  #parameters: Partial<{ environment: AppEnvironments; importer: Importer }> = {}

  /**
   * Merge parameters accepted by the AppFactory
   */
  merge(params: Partial<{ environment: AppEnvironments; importer: Importer }>) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create application class instance
   */
  create(appRoot: URL, importer?: Importer) {
    return new Application<ContainerBindings>(
      appRoot,
      Object.assign({ importer }, { environment: 'web' as const }, this.#parameters)
    )
  }
}
