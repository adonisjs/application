/*
* @poppinss/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { parse } from '../src/rcParser'

test.group('Rc Parser', () => {
  test('parse empty object to rc file node', (assert) => {
    assert.deepEqual(parse({}), {
      name: 'adonis-app',
      version: '0.0.0',
      exceptionHandlerNamespace: 'App/Exceptions/Handler',
      directories: {
        config: 'config',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('give preference to json content literal values', (assert) => {
    assert.deepEqual(parse({
      name: 'relay-app',
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    }), {
      name: 'relay-app',
      version: '0.0.0',
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      directories: {
        config: 'config',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('drop extra nodes from preloads', (assert) => {
    assert.deepEqual(parse({
      name: 'relay-app',
      preloads: [{
        file: 'foo',
        force: true,
      }],
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    }), {
      name: 'relay-app',
      version: '0.0.0',
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      directories: {
        config: 'config',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
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
      name: 'relay-app',
      directories: {
        config: 'myconfig',
      },
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    }), {
      name: 'relay-app',
      version: '0.0.0',
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      directories: {
        config: 'myconfig',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('deep merge directories', (assert) => {
    assert.deepEqual(parse({
      name: 'relay-app',
      directories: {
        config: 'myconfig',
      },
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    }), {
      name: 'relay-app',
      version: '0.0.0',
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
      directories: {
        config: 'myconfig',
        database: 'database',
        migrations: 'database/migrations',
        public: 'public',
        resources: 'resources',
        seeds: 'database/seeds',
        views: 'resources/views',
        start: 'start',
      },
      preloads: [],
      autoloads: {},
      copyToBuild: [],
    })
  })

  test('raise exception when preload doesn\'t defines file property', (assert) => {
    const fn = () => parse({
      name: 'relay-app',
      preloads: [{
        path: 'foo',
      }],
      exceptionHandlerNamespace: 'Relay/Exceptions/Handler',
    })

    assert.throw(fn, 'E_PRELOAD_MISSING_FILE_PROPERTY: Invalid value for preloads[0]')
  })
})
