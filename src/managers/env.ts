/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env, EnvLoader, EnvParser } from '@adonisjs/env'

import debug from '../debug.js'
import type { EnvValidatorFunction } from '../types.js'

/**
 * Env manager is used to load, parse, validate and set environment
 * variables.
 */
export class EnvManager<Validator extends EnvValidatorFunction> {
  #appRoot: URL

  /**
   * Environment variables defined as a string.
   */
  #envContents?: string

  /**
   * Validator to validate environment variables
   */
  #envValidator: Validator = ((values) => values) as Validator

  /**
   * Reference to parsed environment variables. The value is defined
   * after the "init" method call
   */
  env!: Env<ReturnType<Validator>>

  constructor(appRoot: URL, envValidator?: Validator) {
    this.#appRoot = appRoot
    if (envValidator) {
      this.#envValidator = envValidator
    }
  }

  /**
   * Parse env variables from raw contents
   */
  #parseRawContents(envContents: string) {
    /**
     * Collected env variables
     */
    const envValues: Record<string, any> = {}
    if (!envContents.trim()) {
      return envValues
    }

    const values = new EnvParser(envContents).parse()
    Object.keys(values).forEach((key) => {
      let value = process.env[key]

      if (!value) {
        value = values[key]
        process.env[key] = values[key]
      }

      if (!envValues[key]) {
        envValues[key] = value
      }
    })

    return envValues
  }

  /**
   * Parse env variables by loading dot files.
   */
  async #loadAndParseDotFiles() {
    const loader = new EnvLoader(this.#appRoot)
    const envFiles = await loader.load()

    if (debug.enabled) {
      debug(
        'processing .env files (priority from top to bottom) %O',
        envFiles.map((file) => file.path)
      )
    }

    /**
     * Collected env variables
     */
    const envValues: Record<string, any> = {}

    envFiles.forEach(({ contents }) => {
      if (!contents.trim()) {
        return
      }

      const values = new EnvParser(contents).parse()
      Object.keys(values).forEach((key) => {
        let value = process.env[key]

        if (!value) {
          value = values[key]
          process.env[key] = values[key]
        }

        if (!envValues[key]) {
          envValues[key] = value
        }
      })
    })

    return envValues
  }

  /**
   * Specify the contents for environment variables as
   * a string. Calling this method will disable
   * reading .env files from the disk
   */
  envContents(contents: string): this {
    this.#envContents = contents
    return this
  }

  /**
   * Process env variables
   */
  async process() {
    const contents =
      this.#envContents !== undefined
        ? this.#parseRawContents(this.#envContents)
        : await this.#loadAndParseDotFiles()

    const validated = this.#envValidator(contents) as ReturnType<Validator>
    this.env = new Env(validated)
    this.#envContents = undefined
  }
}
