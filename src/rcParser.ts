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
import { RcFile, MetaFileNode, PreloadNode } from '@ioc:Adonis/Core/Application'

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
  models: 'App/Models',
  validators: 'App/Validators',
  httpControllers: 'App/Controllers/Http',
  eventListeners: 'App/Listeners',
  redisListeners: 'App/Listeners',
}

/**
 * Parses the contents of `.adonisrc.json` file and merges it with the
 * defaults
 */
export function parse (contents: { [key: string]: any }): RcFile {
  const normalizedContents = Object.assign({
    typescript: true,
    directories: {},
    namespaces: {},
    exceptionHandlerNamespace: 'App/Exceptions/Handler',
    preloads: [],
    aliases: {},
    metaFiles: [],
    commands: [],
    providers: [],
    aceProviders: [],
  }, contents)

  return {
    typescript: normalizedContents.typescript,
    directories: Object.assign({}, DEFAULT_DIRECTORIES, normalizedContents.directories),
    exceptionHandlerNamespace: normalizedContents.exceptionHandlerNamespace,
    preloads: normalizedContents.preloads.map((preload: PreloadNode | string, index: number) => {
      if (typeof (preload) === 'string') {
        return {
          file: preload,
          optional: false,
          environment: ['web', 'console', 'test'],
        }
      }

      if (!preload.file) {
        throw new Exception(`Invalid value for preloads[${index}]`, 500, 'E_PRELOAD_MISSING_FILE_PROPERTY')
      }

      return {
        file: preload.file,
        optional: preload.optional === undefined ? false : preload.optional,
        environment: preload.environment === undefined ? ['web', 'console', 'test'] : preload.environment,
      }
    }),
    namespaces: Object.assign({}, DEFAULT_NAMESPACES, normalizedContents.namespaces),
    aliases: Object.assign({}, normalizedContents.autoloads, normalizedContents.aliases),
    metaFiles: normalizedContents.metaFiles.map((file: MetaFileNode | string, index) => {
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
    commands: normalizedContents.commands,
    providers: normalizedContents.providers,
    aceProviders: normalizedContents.aceProviders,
    raw: contents,
  }
}
