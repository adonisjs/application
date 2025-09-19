/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import debug from '../debug.ts'
import type { RcFile } from '../types.ts'
import { RcFileParser } from '../rc_file/parser.ts'

/**
 * RcFileManager handles loading, parsing, and processing of the AdonisJS
 * configuration file (adonisrc.js). This file contains application metadata,
 * directory mappings, providers, preloads, and other configuration.
 *
 * The manager can work with:
 * - adonisrc.js file from disk
 * - Explicitly provided RC contents (useful for testing)
 *
 * @example
 * const manager = new RcFileManager(new URL('file:///app/'))
 * await manager.process()
 * console.log(manager.rcFile.providers)
 */
export class RcFileManager {
  /**
   * The application root directory URL used to resolve the adonisrc.js file path.
   *
   * @private
   * @type {URL}
   */
  #appRoot: URL

  /**
   * RC file contents set explicitly via rcContents() method.
   * When set, prevents loading adonisrc.js from disk.
   *
   * @private
   * @type {Record<string, any> | undefined}
   */
  #rcContents?: Record<string, any>

  /**
   * Reference to the parsed and validated RC file configuration.
   * Available after the process() method has been called successfully.
   *
   * @type {RcFile}
   */
  rcFile!: RcFile

  /**
   * Creates a new RcFileManager instance.
   *
   * @param {URL} appRoot - The application root directory URL
   */
  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Provides RC file contents programmatically instead of loading from disk.
   * Useful for testing or when the configuration needs to be generated dynamically.
   * Calling this method disables loading adonisrc.js from the file system.
   *
   * @param {Record<string, any>} value - The RC file contents as an object
   * @returns {this} Returns the RcFileManager instance for method chaining
   */
  rcContents(value: Record<string, any>): this {
    this.#rcContents = value
    return this
  }

  /**
   * Loads and processes the RC file configuration. If rcContents was provided,
   * uses that; otherwise attempts to load adonisrc.js from the application root.
   * Parses and validates the configuration, making it available via the rcFile property.
   *
   * @returns {Promise<void>} Promise that resolves when RC file processing is complete
   * @throws {Error} When adonisrc.js has syntax errors or invalid configuration
   */
  async process() {
    if (!this.#rcContents) {
      const rcTSFile = new URL('adonisrc.js', this.#appRoot)

      try {
        const rcExports = await import(rcTSFile.href)
        this.#rcContents = rcExports.default
        debug('adonisrc.ts file contents: %O', this.#rcContents)
      } catch (error) {
        if (!/Cannot find module/.test(error.message)) {
          throw error
        }
      }
    }

    this.rcFile = new RcFileParser(this.#rcContents!).parse()
    this.#rcContents = undefined
  }
}
