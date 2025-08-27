/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config, ConfigLoader } from '@adonisjs/config'
import debug from '../debug.ts'

/**
 * ConfigManager is used to load, parse, validate and set configuration
 * values. Can load config from directories or use explicitly provided
 * config values.
 */
export class ConfigManager {
  /**
   * The application root directory URL
   */
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

  /**
   * Creates a new ConfigManager instance
   *
   * @param appRoot - The application root directory URL
   */
  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Define the config values to use when booting the
   * config provider. Calling this method disables
   * reading files from the config directory.
   *
   * @param values - The configuration values to use
   * @returns this - Returns the ConfigManager instance for method chaining
   */
  useConfig(values: Record<any, any>): this {
    this.#configValues = values
    return this
  }

  /**
   * Process config values.
   *
   * @param configDirectory - The directory path containing config files
   * @returns Promise that resolves when config processing is complete
   */
  async process(configDirectory: string) {
    if (this.#configValues) {
      this.config = new Config(this.#configValues)
    } else {
      const loader = new ConfigLoader(new URL(configDirectory, this.#appRoot))
      debug('loading config from directory "%s"', configDirectory)
      this.config = new Config(await loader.load())
    }

    this.#configValues = undefined
  }
}
