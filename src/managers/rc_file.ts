/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import debug from '../debug.js'
import type { RcFile } from '../types.js'
import { RcFileParser } from '../rc_file/parser.js'

/**
 * RcFileManager is used to process the raw contents or the contents
 * of "adonisrc.js" file.
 */
export class RcFileManager {
  #appRoot: URL

  /**
   * RcFile contents set explicitly
   */
  #rcContents?: Record<string, any>

  /**
   * Reference to the parsed rc file. The value is defined
   * after the "init" method call
   */
  rcFile!: RcFile

  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Specify the contents of the "adonisrc.js" file as
   * an object. Calling this method will disable loading
   * the "adonisrc.js" file from the disk.
   */
  rcContents(value: Record<string, any>): this {
    this.#rcContents = value
    return this
  }

  /**
   * Process the contents for the rcFile
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
