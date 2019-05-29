/**
 * @module @poppinss/application
 */

/*
* @poppinss/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Exception } from '@poppinss/utils'
import { RcFile } from './contracts'

/**
 * Default set of directories for AdonisJs
 * applications
 */
const DEFAULT_DIRECTORIES = {
  config: 'config',
  public: 'public',
  database: 'database',
  migrations: 'database/migrations',
  seeds: 'database/seeds',
  resources: 'resources',
  views: 'resources/views',
  start: 'start',
}

export function parse (contents: any): RcFile {
  contents = Object.assign({
    name: 'adonis-app',
    directories: {},
    exceptionHandlerNamespace: 'App/Exceptions/Handler',
    preloads: [],
    autoloads: {},
    copyToBuild: [],
  }, contents)

  return {
    name: contents.name,
    directories: Object.assign({}, DEFAULT_DIRECTORIES, contents.directories),
    exceptionHandlerNamespace: contents.exceptionHandlerNamespace,
    preloads: contents.preloads.map(({ file, optional, environment }, index: number) => {
      if (!file) {
        throw new Exception(`Invalid value for preloads[${index}]`, 500, 'E_PRELOAD_MISSING_FILE_PROPERTY')
      }
      return {
        file,
        optional: optional === undefined ? false : optional,
        environment: environment === undefined ? ['web', 'console', 'test'] : environment,
      }
    }),
    autoloads: contents.autoloads,
    copyToBuild: contents.copyToBuild,
  }
}
