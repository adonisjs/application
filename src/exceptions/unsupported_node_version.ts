/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class UnsupportedNodeVersion extends Exception {
  static status = 500
  static code = 'E_UNSUPPORTED_NODE_VERSION'
}
