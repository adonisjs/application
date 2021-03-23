/*
 * @adonisjs/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Helpers' {
  import * as helpers from '@poppinss/utils/build/helpers'

  const Helpers: typeof helpers
  export default Helpers
}
