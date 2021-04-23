/*
 * @adonisjs/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { parse } from '../src/rcParser'

test.group('Rc Parser', () => {
  test('parse empty object to rc file node', (assert) => {
    assert.deepEqual(parse({}), {
      raw: {},
      typescript: true,
      directories: {
        config: 'config',
        contracts: 'contracts',
        providers: 'providers',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeders',
        views: 'resources/views',
        start: 'start',
        tmp: 'tmp',
        tests: 'tests',
      },
      namespaces: {
        models: 'App/Models',
        exceptions: 'App/Exceptions',
        middleware: 'App/Middleware',
        validators: 'App/Validators',
        httpControllers: 'App/Controllers/Http',
        eventListeners: 'App/Listeners',
        redisListeners: 'App/Listeners',
      },
      preloads: [],
      aliases: {},
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [],
      aceProviders: [],
    })
  })

  test('give preference to json content literal values', (assert) => {
    assert.deepEqual(
      parse({
        exceptionHandlerNamespace: 'Relay/Handler',
      }),
      {
        raw: {
          exceptionHandlerNamespace: 'Relay/Handler',
        },
        typescript: true,
        exceptionHandlerNamespace: 'Relay/Handler',
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('drop extra nodes from preloads', (assert) => {
    assert.deepEqual(
      parse({
        preloads: [
          {
            file: 'foo',
            force: true,
          },
        ],
        exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      }),
      {
        raw: {
          preloads: [
            {
              file: 'foo',
              force: true,
            },
          ],
          exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
        },
        typescript: true,
        exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [
          {
            file: 'foo',
            environment: ['web', 'console', 'test', 'repl'],
            optional: false,
          },
        ],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('deep merge directories', (assert) => {
    assert.deepEqual(
      parse({
        directories: {
          config: 'myconfig',
        },
        exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      }),
      {
        raw: {
          directories: {
            config: 'myconfig',
          },
          exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
        },
        typescript: true,
        exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
        directories: {
          config: 'myconfig',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test("raise exception when preload doesn't defines file property", (assert) => {
    const fn = () =>
      parse({
        preloads: [
          {
            path: 'foo',
          },
        ],
        exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      })

    assert.throw(fn, 'E_PRELOAD_MISSING_FILE_PROPERTY: Invalid value for preloads[0]')
  })

  test('deep merge namespaces', (assert) => {
    assert.deepEqual(
      parse({
        namespaces: {
          httpControllers: 'App/Controllers',
        },
      }),
      {
        raw: {
          namespaces: {
            httpControllers: 'App/Controllers',
          },
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('normalize string based meta file patterns', (assert) => {
    assert.deepEqual(
      parse({
        namespaces: {
          httpControllers: 'App/Controllers',
        },
        metaFiles: ['foo.json'],
      }),
      {
        raw: {
          namespaces: {
            httpControllers: 'App/Controllers',
          },
          metaFiles: ['foo.json'],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [{ pattern: 'foo.json', reloadServer: true }],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('drop extra properties from meta file objects', (assert) => {
    assert.deepEqual(
      parse({
        namespaces: {
          httpControllers: 'App/Controllers',
        },
        metaFiles: [{ pattern: 'foo.json', run: false }],
      }),
      {
        raw: {
          namespaces: {
            httpControllers: 'App/Controllers',
          },
          metaFiles: [{ pattern: 'foo.json', run: false }],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          validators: 'App/Validators',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          httpControllers: 'App/Controllers',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [{ pattern: 'foo.json', reloadServer: false }],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('raise exception when pattern is missing', (assert) => {
    const fn = () =>
      parse({
        namespaces: {
          httpControllers: 'App/Controllers',
        },
        metaFiles: [{ run: false }],
      })

    assert.throw(fn, 'E_METAFILE_MISSING_PATTERN: Invalid value for metaFiles[0]')
  })

  test('set typescript to false', (assert) => {
    assert.deepEqual(
      parse({
        typescript: false,
      }),
      {
        raw: {
          typescript: false,
        },
        typescript: false,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          validators: 'App/Validators',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('define custom commands', (assert) => {
    assert.deepEqual(
      parse({
        commands: ['./foo/bar'],
      }),
      {
        raw: {
          commands: ['./foo/bar'],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          validators: 'App/Validators',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: ['./foo/bar'],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('define custom providers', (assert) => {
    assert.deepEqual(
      parse({
        providers: ['@adonisjs/core'],
      }),
      {
        raw: {
          providers: ['@adonisjs/core'],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: ['@adonisjs/core'],
        aceProviders: [],
      }
    )
  })

  test('define custom commands', (assert) => {
    assert.deepEqual(
      parse({
        aceProviders: ['@adonisjs/commands'],
      }),
      {
        raw: {
          aceProviders: ['@adonisjs/commands'],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: ['@adonisjs/commands'],
      }
    )
  })

  test('define preload file as a string', (assert) => {
    assert.deepEqual(
      parse({
        preloads: ['./start/routes'],
      }),
      {
        raw: {
          preloads: ['./start/routes'],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [
          {
            file: './start/routes',
            environment: ['web', 'console', 'test', 'repl'],
            optional: false,
          },
        ],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('define preload files as string and object together', (assert) => {
    assert.deepEqual(
      parse({
        preloads: ['./start/routes', { file: './start/kernel', optional: true }],
      }),
      {
        raw: {
          preloads: ['./start/routes', { file: './start/kernel', optional: true }],
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [
          {
            file: './start/routes',
            environment: ['web', 'console', 'test', 'repl'],
            optional: false,
          },
          {
            file: './start/kernel',
            environment: ['web', 'console', 'test', 'repl'],
            optional: true,
          },
        ],
        aliases: {},
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })

  test('merge autoloads from json file to aliases. Backward compatible', (assert) => {
    assert.deepEqual(
      parse({
        autoloads: { app: 'App' },
        aliases: { test: 'Test' },
      }),
      {
        raw: {
          autoloads: { app: 'App' },
          aliases: { test: 'Test' },
        },
        typescript: true,
        directories: {
          config: 'config',
          tests: 'tests',
          contracts: 'contracts',
          providers: 'providers',
          database: 'database',
          migrations: 'database/migrations',
          public: 'public',
          resources: 'resources',
          seeds: 'database/seeders',
          views: 'resources/views',
          start: 'start',
          tmp: 'tmp',
        },
        namespaces: {
          models: 'App/Models',
          exceptions: 'App/Exceptions',
          middleware: 'App/Middleware',
          validators: 'App/Validators',
          httpControllers: 'App/Controllers/Http',
          eventListeners: 'App/Listeners',
          redisListeners: 'App/Listeners',
        },
        preloads: [],
        aliases: {
          test: 'Test',
          app: 'App',
        },
        metaFiles: [],
        commands: [],
        commandsAliases: {},
        providers: [],
        aceProviders: [],
      }
    )
  })
})
