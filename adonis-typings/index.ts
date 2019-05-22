/*
* @poppinss/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../src/contracts.ts" />

declare module '@ioc:Application' {
  import { ApplicationContract as BaseContract } from '@poppinss/application/contracts'

  export interface ApplicationContract extends BaseContract {}
  const Application: ApplicationContract

  export default Application
}
