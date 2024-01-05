/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'semver'
import { test } from '@japa/runner'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Application', () => {
  test('get info.appName from the appName property', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    app.info.set('appName', 'adonisjs_app')
    assert.equal(app.appName, 'adonisjs_app')
  })

  test('get info.version from the version property', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    app.info.set('version', parse('1.0.0'))
    assert.equal(app.version?.major, 1)
    assert.equal(app.version?.minor, 0)
    assert.equal(app.version?.patch, 0)
    assert.equal(app.version?.toString(), '1.0.0')
  })

  test('get info.adonisVersion from the adonisVersion property', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    app.info.set('adonisVersion', parse('1.0.0'))
    assert.equal(app.adonisVersion?.major, 1)
    assert.equal(app.adonisVersion?.minor, 0)
    assert.equal(app.adonisVersion?.patch, 0)
    assert.equal(app.adonisVersion?.toString(), '1.0.0')
  })

  test('get app JSON representation', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.deepEqual(app.toJSON(), {
      adonisVersion: null,
      appName: 'adonisjs_app',
      environment: 'web',
      isReady: false,
      isTerminating: false,
      nodeEnvironment: 'unknown',
      version: null,
    })
  })

  test('listen for signals', async ({ assert, cleanup }) => {
    function onSigint() {}

    cleanup(() => {
      process.removeListener('SIGINT', onSigint)
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()

    app.listen('SIGINT', onSigint)
    assert.deepEqual(process.listeners('SIGINT'), [onSigint])
  })

  test('listen once for signals', async ({ assert, cleanup }) => {
    function onSigint() {}

    cleanup(() => {
      process.removeListener('SIGINT', onSigint)
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()

    app.listenOnce('SIGINT', onSigint)
    assert.deepEqual(process.listeners('SIGINT'), [onSigint])
  })

  test('listen for signals conditionally', async ({ assert, cleanup }) => {
    function onSigint() {}

    cleanup(() => {
      process.removeListener('SIGINT', onSigint)
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()

    app.listenIf(false, 'SIGINT', onSigint)
    assert.deepEqual(process.listeners('SIGINT'), [])

    app.listenIf(true, 'SIGINT', onSigint)
    assert.deepEqual(process.listeners('SIGINT'), [onSigint])
  })

  test('listen once for signals conditionally', async ({ assert, cleanup }) => {
    function onSigint() {}

    cleanup(() => {
      process.removeListener('SIGINT', onSigint)
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()

    app.listenOnceIf(false, 'SIGINT', onSigint)
    assert.deepEqual(process.listeners('SIGINT'), [])

    app.listenOnceIf(true, 'SIGINT', onSigint)
    assert.deepEqual(process.listeners('SIGINT'), [onSigint])
  })

  test('find if app is managed by pm2', async ({ assert, cleanup }) => {
    cleanup(() => {
      process.env.pm2_id
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
    })
    assert.isFalse(app.managedByPm2)

    process.env.pm2_id = '1'
    const app1 = new Application(BASE_URL, {
      environment: 'web',
    })
    assert.isTrue(app1.managedByPm2)
  })

  test('use importer to import a file', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {
        return {
          foo: 'bar',
        }
      },
    })

    await app.init()
    assert.deepEqual(await app.import('foo'), { foo: 'bar' })
  })

  test('use importer to resolve module default export', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {
        return {
          default: {
            foo: 'bar',
          },
        }
      },
    })

    await app.init()
    assert.deepEqual(await app.importDefault('foo'), { foo: 'bar' })
  })

  test('throw error when importing modules without registering an importer', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    await assert.rejects(
      () => app.import('foo'),
      'Cannot import "foo". Register a module importer with the application first.'
    )
    await assert.rejects(
      () => app.importDefault('foo'),
      'Cannot import "foo". Register a module importer with the application first.'
    )
  })
})
