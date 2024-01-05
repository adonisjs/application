/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error
import * as tempura from 'tempura'
import string from '@poppinss/utils/string'
import { dirname, isAbsolute } from 'node:path'
import { RuntimeException } from '@poppinss/utils'
import { mkdir, writeFile } from 'node:fs/promises'
import StringBuilder from '@poppinss/utils/string_builder'

import debug from '../debug.js'
import type { Application } from '../application.js'
import { parseStubExports, pathExists } from '../helpers.js'

/**
 * The stub class uses tempura template engine to process
 * a stub template and generate a resource file.
 *
 * Finding the correct stub to use is outside of the scope
 * of this class.
 */
export class Stub {
  /**
   * The absolute path to the stub file. Need it for reporting
   * errors
   */
  #stubPath: string

  /**
   * The contents of the stub to process
   */
  #stubContents: string

  /**
   * Application class reference
   */
  #app: Application<any>

  constructor(app: Application<any>, stubContents: string, stubPath: string) {
    this.#app = app
    this.#stubPath = stubPath
    this.#stubContents = stubContents
  }

  /**
   * Patch error stack and point it to the stub file
   */
  #patchErrorStack(error: Error) {
    const stack = error.stack!.split('\n')
    stack.splice(1, 0, `    at anonymous (${this.#stubPath}:0:0)`)
    error.stack = stack.join('\n')
  }

  /**
   * Patch tempura error stack and point it to the stub file
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
   * Validates the "to" attribute
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
   * Returns the default state for the stub
   */
  #getStubDefaults() {
    return {
      app: this.#app,
      randomString: string.random,
      generators: this.#app.generators,
      exports: (value: any) => {
        return `<!--EXPORT_START-->${JSON.stringify(value)}<!--EXPORT_END-->`
      },
      string: (value: string | StringBuilder) => new StringBuilder(value),
    }
  }

  /**
   * Renders stub using tempura templating syntax.
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
   * Parsers the stub exports
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
   * Prepare stub to be written to the disk
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
   * Generate resource for the stub. Writes file to the disk
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
