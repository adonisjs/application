/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readFile } from 'node:fs/promises'

import debug from '../debug.js'
import type { RcFile } from '../types.js'
import { pathExists } from '../helpers.js'
import { RcFileParser } from '../rc_file/parser.js'

/**
 * RcFileManager is used to process the raw contents or the contents
 * of ".adonisrc.json" file.
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
   * Specify the contents of the ".adonisrc.json" file as
   * an object. Calling this method will disable loading
   * the ".adonisrc.json" file from the disk.
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
      const rcTSFile = new URL('adonisrc.ts', this.#appRoot)
      const rcJSONFile = new URL('.adonisrc.json', this.#appRoot)

      if (await pathExists(rcTSFile)) {
        const rcExports = await import(rcTSFile.href)
        this.#rcContents = rcExports.default
        debug('adonisrc.ts file contents: %O', this.#rcContents)
      } else if (await pathExists(rcJSONFile)) {
        const rcContents = await readFile(rcJSONFile, 'utf-8')
        this.#rcContents = JSON.parse(rcContents)
        debug('.adonisrc.json file contents: %O', this.#rcContents)
      }
    }

    this.rcFile = new RcFileParser(this.#rcContents!).parse()
    this.#rcContents = undefined
  }
}
