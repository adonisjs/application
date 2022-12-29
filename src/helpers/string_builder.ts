/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname } from 'node:path'
import string from './string.js'

/**
 * String builder to transform the string using the fluent API
 */
export class StringBuilder {
  #value: string

  constructor(value: string | StringBuilder) {
    this.#value = typeof value === 'string' ? value : value.toString()
  }

  dashCase(): this {
    this.#value = string.dashCase(this.#value)
    return this
  }

  dotCase(): this {
    this.#value = string.dotCase(this.#value)
    return this
  }

  snakeCase(): this {
    this.#value = string.snakeCase(this.#value)
    return this
  }

  pascalCase(): this {
    this.#value = string.pascalCase(this.#value)
    return this
  }

  camelCase(): this {
    this.#value = string.camelCase(this.#value)
    return this
  }

  capitalCase(): this {
    this.#value = string.capitalCase(this.#value)
    return this
  }

  titleCase(): this {
    this.#value = string.titleCase(this.#value)
    return this
  }

  sentenceCase(): this {
    this.#value = string.sentenceCase(this.#value)
    return this
  }

  noCase(): this {
    this.#value = string.noCase(this.#value)
    return this
  }

  plural(): this {
    this.#value = string.pluralize(this.#value)
    return this
  }

  singular(): this {
    this.#value = string.singular(this.#value)
    return this
  }

  slugify(): this {
    this.#value = string.slug(this.#value)
    return this
  }

  removeSuffix(suffix: string): this {
    this.#value = this.#value.replace(new RegExp(`[-_]?${suffix}$`, 'i'), '')
    return this
  }

  suffix(suffix: string): this {
    this.removeSuffix(suffix)
    this.#value = `${this.#value}${suffix}`
    return this
  }

  removePrefix(prefix: string): this {
    this.#value = this.#value.replace(new RegExp(`^${prefix}[-_]?`, 'i'), '')
    return this
  }

  prefix(prefix: string): this {
    this.removePrefix(prefix)
    this.#value = `${prefix}${this.#value}`
    return this
  }

  removeExtension(): this {
    this.#value = this.#value.replace(new RegExp(`${extname(this.#value)}$`), '')
    return this
  }

  ext(extension: string): this {
    this.removeExtension()
    this.#value = `${this.#value}.${extension.replace(/^\./, '')}`
    return this
  }

  toString() {
    return this.#value
  }
}
