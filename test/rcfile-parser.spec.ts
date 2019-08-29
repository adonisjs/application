/*
* @poppinss/application
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
      exceptionHandlerNamespace: 'App/Exceptions/Handler',
      directories: {
        config: 'config',
        contracts: 'contracts',
        providers: 'providers',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
        tmp: 'tmp',
      },
      namespaces: {
        httpControllers: 'App/Controllers/Http',
        eventListeners: 'App/Listeners',
        redisListeners: 'App/Listeners',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('give preference to json content literal values', (assert) => {
    assert.deepEqual(parse({
      exceptionHandlerNamespace: 'Relay/Handler',
    }), {
      exceptionHandlerNamespace: 'Relay/Handler',
      directories: {
        config: 'config',
        contracts: 'contracts',
        providers: 'providers',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
        tmp: 'tmp',
      },
      namespaces: {
        httpControllers: 'App/Controllers/Http',
        eventListeners: 'App/Listeners',
        redisListeners: 'App/Listeners',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('drop extra nodes from preloads', (assert) => {
    assert.deepEqual(parse({
      preloads: [{
        file: 'foo',
        force: true,
      }],
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    }), {
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      directories: {
        config: 'config',
        contracts: 'contracts',
        providers: 'providers',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
        tmp: 'tmp',
      },
      namespaces: {
        httpControllers: 'App/Controllers/Http',
        eventListeners: 'App/Listeners',
        redisListeners: 'App/Listeners',
      },
      preloads: [{
        file: 'foo',
        environment: ['web', 'console', 'test'],
        optional: false,
      }],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('deep merge directories', (assert) => {
    assert.deepEqual(parse({
      directories: {
        config: 'myconfig',
      },
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    }), {
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      directories: {
        config: 'myconfig',
        contracts: 'contracts',
        providers: 'providers',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
        tmp: 'tmp',
      },
      namespaces: {
        httpControllers: 'App/Controllers/Http',
        eventListeners: 'App/Listeners',
        redisListeners: 'App/Listeners',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('raise exception when preload doesn\'t defines file property', (assert) => {
    const fn = () => parse({
      preloads: [{
        path: 'foo',
      }],
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    })

    assert.throw(fn, 'E_PRELOAD_MISSING_FILE_PROPERTY: Invalid value for preloads[0]')
  })

  test('deep merge namespaces', (assert) => {
    assert.deepEqual(parse({
      namespaces: {
        httpControllers: 'App/Controllers',
      },
    }), {
      exceptionHandlerNamespace: 'App/Exceptions/Handler',
      directories: {
        config: 'config',
        contracts: 'contracts',
        providers: 'providers',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
        tmp: 'tmp',
      },
      namespaces: {
        httpControllers: 'App/Controllers',
        eventListeners: 'App/Listeners',
        redisListeners: 'App/Listeners',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })
})
