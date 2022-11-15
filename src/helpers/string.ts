/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import he, { EncodeOptions } from 'he'
import string from '@poppinss/utils/string'

const stringHelpers: typeof string & {
  toSentence: typeof string['sentence']
  ordinalize: typeof string['ordinal']
  generateRandom: typeof string['random']
  isEmpty(value: string): boolean
  escapeHTML(value: string, options?: { encodeSymbols?: boolean }): string
  encodeSymbols(value: string, options?: EncodeOptions): string
} = {
  ...string,
  toSentence: string.sentence,
  ordinalize: string.ordinal,
  generateRandom: string.random,
  isEmpty(value: string): boolean {
    return value.trim().length === 0
  },

  escapeHTML(value: string, options?: { encodeSymbols?: boolean }): string {
    value = he.escape(value)
    if (options && options.encodeSymbols) {
      value = this.encodeSymbols(value, { allowUnsafeSymbols: true })
    }
    return value
  },

  encodeSymbols(value: string, options?: EncodeOptions): string {
    return he.encode(value, options)
  },
}

export default stringHelpers
