/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config, ConfigLoader } from '@adonisjs/config'

/**
 * Env manager is used to load, parse, validate and set environment
 * variables.
 */
export class ConfigManager {
  #appRoot: URL

  /**
   * Config tree set explicitly
   */
  #configValues?: Record<any, any>

  /**
   * Reference to the config class. The value is defined
   * after the "init" method call
   */
  config!: Config

  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Define the config values to use when booting the
   * config provider. Calling this method disables
   * reading files from the config directory.
   */
  useConfig(values: Record<any, any>): this {
    this.#configValues = values
    return this
  }

  /**
   * Process config values.
   */
  async process(configDirectory: string) {
    if (this.#configValues) {
      this.config = new Config(this.#configValues)
    } else {
      const loader = new ConfigLoader(new URL(configDirectory, this.#appRoot))
      this.config = new Config(await loader.load())
    }

    this.#configValues = undefined
  }
}
