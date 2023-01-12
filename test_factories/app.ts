/*
 * @adonisjs/app
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '../src/application.js'
import type { AppEnvironments } from '../src/types.js'

/**
 * App factory is used to generate application class instances for
 * testing
 */
export class AppFactory {
  #parameters: Partial<{
    options: { environment: AppEnvironments }
  }> = {}

  /**
   * Merge parameters accepted by the AppFactory
   */
  merge(
    params: Partial<{
      options: { environment: AppEnvironments }
    }>
  ) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create application class instance
   */
  create(appRoot: URL) {
    return new Application(appRoot, this.#parameters.options || { environment: 'web' })
  }
}
