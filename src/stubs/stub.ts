/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as tempura from 'tempura'
import string from '@poppinss/utils/string'
import { dirname, isAbsolute } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import stringHelpers from '@poppinss/utils/string'
import StringBuilder from '@poppinss/utils/string_builder'
import { RuntimeException } from '@poppinss/utils/exception'

import debug from '../debug.ts'
import type { Application } from '../application.ts'
import { parseStubExports, pathExists } from '../utils.ts'

/**
 * Enhanced string builder function that combines StringBuilder functionality
 * with string utility helpers, available as 'string' in stub templates.
 *
 * @param {string | StringBuilder} value - Initial value for the string builder
 * @returns {StringBuilder} A StringBuilder instance with utility methods
 */
function stubStringBuilder(value: string | StringBuilder) {
  return new StringBuilder(value)
}
Object.assign(stubStringBuilder, stringHelpers)

/**
 * The Stub class processes template files using the Tempura template engine
 * to generate code files. Stubs are template files that contain placeholders
 * and logic for generating application resources like controllers, models, etc.
 *
 * Features:
 * - Tempura template processing with data binding
 * - Automatic file writing with directory creation
 * - Force overwrite support
 * - Export metadata parsing from template output
 * - Enhanced error reporting with stub file locations
 *
 * @example
 * const stub = new Stub(app, stubContent, '/path/to/controller.stub')
 * const result = await stub.generate({
 *   name: 'UserController',
 *   to: app.httpControllersPath('user_controller.ts')
 * })
 */
export class Stub {
  /**
   * The absolute path to the stub file, used for error reporting
   * and debugging to provide accurate stack traces.
   *
   * @private
   * @type {string}
   */
  #stubPath: string

  /**
   * The raw template contents of the stub file to be processed
   * by the Tempura template engine.
   *
   * @private
   * @type {string}
   */
  #stubContents: string

  /**
   * Reference to the application instance, providing access to
   * app context, generators, and utility methods for stub processing.
   *
   * @private
   * @type {Application<any>}
   */
  #app: Application<any>

  /**
   * Creates a new Stub instance for processing template files.
   *
   * @param {Application<any>} app - The application instance
   * @param {string} stubContents - The raw contents of the stub template
   * @param {string} stubPath - The absolute path to the stub file
   */
  constructor(app: Application<any>, stubContents: string, stubPath: string) {
    this.#app = app
    this.#stubPath = stubPath
    this.#stubContents = stubContents
  }

  /**
   * Patches error stack traces to include stub file location,
   * making debugging easier by pointing to the actual template file.
   *
   * @private
   * @param {Error} error - The error object to patch
   */
  #patchErrorStack(error: Error) {
    const stack = error.stack!.split('\n')
    stack.splice(1, 0, `    at anonymous (${this.#stubPath}:0:0)`)
    error.stack = stack.join('\n')
  }

  /**
   * Patches Tempura template engine error stacks to show the correct
   * line numbers and file paths in the original stub template.
   *
   * @private
   * @param {Error} error - The tempura error object to patch
   */
  #patchTempuraStack(error: Error) {
    const stack = error.stack!.split('\n')

    /**
     * Check if there is an error in the template processing, then
     * pick the exact line number from the reported error
     */
    const templateErrorLine = stack[1].match(/<anonymous>:(\d+):\d+\)$/)
    if (!templateErrorLine) {
      stack.splice(1, 0, `    at anonymous (${this.#stubPath}:0:0)`)
    } else {
      stack.splice(1, 0, `    at anonymous (${this.#stubPath}:${templateErrorLine[1]}:0)`)
    }

    error.stack = stack.join('\n')
  }

  /**
   * Validates that the 'to' attribute is present and contains
   * an absolute file path for the generated file destination.
   *
   * @private
   * @param {Record<string, any>} attributes - The attributes object to validate
   * @throws {RuntimeException} When 'to' attribute is missing or invalid
   */
  #validateToAttribute(attributes: Record<string, any>) {
    if (!attributes.to) {
      const error = new RuntimeException(`Missing "to" attribute in stub exports`)
      throw error
    }

    if (!isAbsolute(attributes.to)) {
      const error = new RuntimeException(
        `The value for "to" attribute must be an absolute file path`
      )
      throw error
    }
  }

  /**
   * Creates the default state object available to all stub templates,
   * including app reference, string utilities, and helper functions.
   *
   * @private
   * @returns {Object} The default state object for stub processing
   */
  #getStubDefaults() {
    return {
      app: this.#app,
      randomString: string.random,
      generators: this.#app.generators,
      exports: (value: any) => {
        return `<!--EXPORT_START-->${JSON.stringify(value)}<!--EXPORT_END-->`
      },
      string: stubStringBuilder,
    }
  }

  /**
   * Processes the stub template using Tempura template engine,
   * compiling and rendering it with the provided data context.
   *
   * @private
   * @param {Record<string, any>} data - The data object to use for rendering
   * @returns {Promise<string>} Promise that resolves to the rendered stub content
   * @throws {Error} When template compilation or rendering fails
   */
  async #renderStub(data: Record<string, any>) {
    try {
      const render = tempura.compile(this.#stubContents, {
        props: Object.keys(data),
      })
      return render(data).trim()
    } catch (error) {
      this.#patchTempuraStack(error)
      throw error
    }
  }

  /**
   * Parses the rendered stub output to extract export metadata
   * and the actual file content body.
   *
   * @private
   * @param {string} stubOutput - The rendered stub output to parse
   * @returns {Object} Object containing parsed attributes and body content
   * @throws {Error} When export parsing or validation fails
   */
  #parseExports(stubOutput: string) {
    try {
      const { body, attributes } = parseStubExports(stubOutput)
      this.#validateToAttribute(attributes)
      return { attributes, body }
    } catch (error) {
      this.#patchErrorStack(error)
      throw error
    }
  }

  /**
   * Prepares the stub for file generation by rendering the template
   * and extracting all metadata, without actually writing to disk.
   *
   * @param {Record<string, any>} stubData - The data to use for stub preparation
   * @returns {Promise<Object>} Promise that resolves to the prepared stub data with contents, destination, and metadata
   */
  async prepare(stubData: Record<string, any>) {
    const data = {
      ...this.#getStubDefaults(),
      ...stubData,
    }

    const { attributes, body } = this.#parseExports(await this.#renderStub(data))
    debug('prepared stub %s', body)
    debug('stub attributes %O', attributes)

    return {
      contents: body,
      destination: attributes.to,
      force: stubData.force !== undefined ? stubData.force : !!attributes.force,
      attributes,
    }
  }

  /**
   * Generates the final resource file by processing the stub template
   * and writing the result to disk, with support for force overwrite.
   *
   * @param {Record<string, any>} stubData - The data to use for stub generation
   * @returns {Promise<Object>} Promise that resolves to generation result with status ('created', 'force_created', or 'skipped')
   */
  async generate(stubData: Record<string, any>) {
    const { force, ...stub } = await this.prepare(stubData)
    const hasFile = await pathExists(stub.destination)
    const directory = dirname(stub.destination)

    if (!hasFile) {
      debug('writing file to %s', stub.destination)
      await mkdir(directory, { recursive: true })
      await writeFile(stub.destination, stub.contents)
      return {
        status: 'created' as const,
        skipReason: null,
        ...stub,
      }
    }

    /**
     * Overwrite file because force flag is enabled
     */
    if (hasFile && force) {
      debug('overwriting file to %s', stub.destination)
      await mkdir(directory, { recursive: true })
      await writeFile(stub.destination, stub.contents)
      return {
        status: 'force_created' as const,
        skipReason: null,
        ...stub,
      }
    }

    return {
      status: 'skipped' as const,
      skipReason: 'File already exists',
      ...stub,
    }
  }
}
