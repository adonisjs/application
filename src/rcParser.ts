/**
 * @module @adonisjs/application
 */

/*
* @adonisjs/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../adonis-typings/application.ts" />

import { Exception } from '@poppinss/utils'
import { RcFile, MetaFileNode } from '@ioc:Adonis/Core/Application'

/**
 * Default set of directories for AdonisJs
 * applications
 */
const DEFAULT_DIRECTORIES = {
  config: 'config',
  public: 'public',
  contracts: 'contracts',
  providers: 'providers',
  database: 'database',
  migrations: 'database/migrations',
  seeds: 'database/seeds',
  resources: 'resources',
  views: 'resources/views',
  start: 'start',
  tmp: 'tmp',
}

/**
 * A list of default namespaces.
 */
const DEFAULT_NAMESPACES = {
  httpControllers: 'App/Controllers/Http',
  eventListeners: 'App/Listeners',
  redisListeners: 'App/Listeners',
}

/**
 * Parses the contents of `.adonisrc.json` file and merges it with the
 * defaults
 */
export function parse (contents: any): RcFile {
  contents = Object.assign({
    typescript: true,
    directories: {},
    namespaces: {},
    exceptionHandlerNamespace: 'App/Exceptions/Handler',
    preloads: [],
    autoloads: {},
    metaFiles: [],
    commands: [],
    providers: [],
    aceProviders: [],
  }, contents)

  return {
    typescript: contents.typescript,
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
    namespaces: Object.assign({}, DEFAULT_NAMESPACES, contents.namespaces),
    autoloads: contents.autoloads,
    metaFiles: contents.metaFiles.map((file: MetaFileNode | string, index) => {
      if (typeof (file) === 'string') {
        return {
          pattern: file,
          reloadServer: true,
        }
      }

      const { pattern, reloadServer } = file
      if (!pattern) {
        throw new Exception(`Invalid value for metaFiles[${index}]`, 500, 'E_METAFILE_MISSING_PATTERN')
      }

      return {
        pattern,
        reloadServer: !!reloadServer,
      }
    }),
    commands: contents.commands,
    providers: contents.providers,
    aceProviders: contents.aceProviders,
  }
}
