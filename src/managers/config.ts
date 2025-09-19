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
 * ConfigManager handles loading, parsing, and managing application configuration.
 * It can load configuration from file system directories or use explicitly
 * provided configuration objects (useful for testing).
 * 
 * The manager creates a Config instance that provides type-safe access to
 * configuration values throughout the application.
 * 
 * @example
 * const manager = new ConfigManager(new URL('file:///app/'))
 * await manager.process('config')
 * const dbConfig = manager.config.get('database')
 * 
 * @example
 * // Using explicit config for testing
 * const manager = new ConfigManager(appRoot)
 * manager.useConfig({ database: { connection: 'sqlite' } })
 * await manager.process('config')
 */
export class ConfigManager {
  /**
   * The application root directory URL used to resolve the config directory path.
   * 
   * @private
   * @type {URL}
   */
  #appRoot: URL

  /**
   * Configuration values set explicitly via useConfig() method.
   * When provided, prevents loading config files from the file system.
   * 
   * @private
   * @type {Record<any, any> | undefined}
   */
  #configValues?: Record<any, any>

  /**
   * Reference to the Config instance that provides access to
   * all configuration values. Available after process() method has been called.
   * 
   * @type {Config}
   */
  config!: Config

  /**
   * Creates a new ConfigManager instance.
   *
   * @param {URL} appRoot - The application root directory URL
   */
  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Provides configuration values programmatically instead of loading from files.
   * Useful for testing or when configuration needs to be generated dynamically.
   * Calling this method disables reading config files from the file system.
   *
   * @param {Record<any, any>} values - The configuration values to use
   * @returns {this} Returns the ConfigManager instance for method chaining
   */
  useConfig(values: Record<any, any>): this {
    this.#configValues = values
    return this
  }

  /**
   * Loads and processes configuration values. If useConfig() was called,
   * uses those values; otherwise loads config files from the specified directory.
   * Creates a Config instance accessible via the config property.
   *
   * @param {string} configDirectory - The directory path containing config files (relative to appRoot)
   * @returns {Promise<void>} Promise that resolves when config processing is complete
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
