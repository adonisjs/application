/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import string from '@poppinss/utils/string'

const stringHelpers: typeof string & {
  toSentence: typeof string['sentence']
  ordinalize: typeof string['ordinal']
  generateRandom: typeof string['random']
} = {
  ...string,
  toSentence: string.sentence,
  ordinalize: string.ordinal,
  generateRandom: string.random,
}

export default stringHelpers
