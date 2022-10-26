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
import {
  RcFile,
  MetaFileNode,
  PreloadNode,
  DirectoriesNode,
  NamespacesNode,
} from '@ioc:Adonis/Core/Application'

/**
 * Default set of directories for AdonisJs
 * applications
 */
const DEFAULT_DIRECTORIES: DirectoriesNode = {
  config: 'config',
  public: 'public',
  contracts: 'contracts',
  providers: 'providers',
  database: 'database',
  migrations: 'database/migrations',
  seeds: 'database/seeders',
  resources: 'resources',
  views: 'resources/views',
  start: 'start',
  tmp: 'tmp',
  tests: 'tests',
}

/**
 * A list of default namespaces.
 */
const DEFAULT_NAMESPACES: NamespacesNode = {
  models: 'App/Models',
  middleware: 'App/Middleware',
  exceptions: 'App/Exceptions',
  validators: 'App/Validators',
  httpControllers: 'App/Controllers/Http',
  eventListeners: 'App/Listeners',
  redisListeners: 'App/Listeners',
}

/**
 * Parses the contents of `.adonisrc.json` file and merges it with the
 * defaults
 */
export function parse(contents: { [key: string]: any }): RcFile {
  const normalizedContents = Object.assign(
    {
      typescript: true,
      directories: {},
      namespaces: {},
      preloads: [],
      aliases: {},
      commandsAliases: {},
      metaFiles: [],
      commands: [],
      providers: [],
      aceProviders: [],
      testProviders: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    },
    contents
  )

  /**
   * Validate the assetsDriver value
   */
  const { assetsDriver } = normalizedContents
  if (assetsDriver && !['vite', 'encore'].includes(assetsDriver)) {
    throw new Exception(
      `Invalid assets driver "${assetsDriver}" defined in .adonisrc.json file`,
      500,
      'E_INVALID_ASSETS_DRIVER'
    )
  }

  return {
    typescript: normalizedContents.typescript,
    ...(assetsDriver ? { assetsDriver } : {}),
    directories: Object.assign({}, DEFAULT_DIRECTORIES, normalizedContents.directories),
    ...(normalizedContents.exceptionHandlerNamespace
      ? { exceptionHandlerNamespace: normalizedContents.exceptionHandlerNamespace }
      : {}),
    preloads: normalizedContents.preloads.map((preload: PreloadNode | string, index: number) => {
      if (typeof preload === 'string') {
        return {
          file: preload,
          optional: false,
          environment: ['web', 'console', 'test', 'repl'],
        }
      }

      if (!preload.file) {
        throw new Exception(
          `Invalid value for preloads[${index}]`,
          500,
          'E_PRELOAD_MISSING_FILE_PROPERTY'
        )
      }

      return {
        file: preload.file,
        optional: preload.optional === undefined ? false : preload.optional,
        environment:
          preload.environment === undefined
            ? ['web', 'console', 'test', 'repl']
            : preload.environment,
      }
    }),
    namespaces: Object.assign({}, DEFAULT_NAMESPACES, normalizedContents.namespaces),
    aliases: Object.assign({}, normalizedContents.autoloads, normalizedContents.aliases),
    metaFiles: normalizedContents.metaFiles.map((file: MetaFileNode | string, index) => {
      if (typeof file === 'string') {
        return {
          pattern: file,
          reloadServer: true,
        }
      }

      const { pattern, reloadServer } = file
      if (!pattern) {
        throw new Exception(
          `Invalid value for metaFiles[${index}]`,
          500,
          'E_METAFILE_MISSING_PATTERN'
        )
      }

      return {
        pattern,
        reloadServer: !!reloadServer,
      }
    }),
    commands: normalizedContents.commands,
    commandsAliases: normalizedContents.commandsAliases,
    providers: normalizedContents.providers,
    aceProviders: normalizedContents.aceProviders,
    testProviders: normalizedContents.testProviders,
    tests: {
      suites: (normalizedContents.tests.suites || []).map((suite: any, index) => {
        if (!suite.name || !suite.files) {
          throw new Exception(
            `Invalid value for "tests.suites[${index}]"`,
            500,
            'E_MISSING_SUITE_PROPERTIES'
          )
        }

        return suite
      }),
      timeout:
        normalizedContents.tests.timeout !== undefined ? normalizedContents.tests.timeout : 2000,
      forceExit:
        normalizedContents.tests.forceExit !== undefined
          ? normalizedContents.tests.forceExit
          : true,
    },
    raw: contents,
  }
}
