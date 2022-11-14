/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class InvalidProviderException extends Exception {
  static status = 500
  static code = 'E_INVALID_PROVIDER'

  static defaultExportMessage(providerPath: string) {
    return `Providers must use default export. Missing default export from "${providerPath}"`
  }

  static invalidClassMessage(providerPath: string, exportedType: string) {
    return `A provider must export a class. "${exportedType}" exported by "${providerPath}" is not a class`
  }
}
