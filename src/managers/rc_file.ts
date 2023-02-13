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
import { readFileOptional } from '../helpers.js'
import { RcFileParser } from '../rc_file/parser.js'
import { RcFileEditor } from '../rc_file/editor.js'

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

  /**
   * Reference to the RC file editor. The value is defined
   * after the "init" method call
   */
  rcFileEditor!: RcFileEditor

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
    const rcFilePath = new URL('.adonisrc.json', this.#appRoot)
    if (!this.#rcContents) {
      const contents = await readFileOptional(new URL('.adonisrc.json', this.#appRoot))
      this.#rcContents = contents ? JSON.parse(contents) : {}
      debug('.adonisrc.json file contents: %O', this.#rcContents)
    }

    this.rcFile = new RcFileParser(this.#rcContents!).parse()
    this.rcFileEditor = new RcFileEditor(rcFilePath, this.rcFile.raw)
    this.#rcContents = undefined
  }
}
