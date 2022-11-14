/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class CannotSwitchEnvironmentException extends Exception {
  static status = 500
  static code = 'E_CANNOT_SWITCH_APP_ENV'
  static message = 'Cannot switch environment once the app has been booted'
}
