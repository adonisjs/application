/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { outputFile, remove } from 'fs-extra'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('parse app name from package.json file', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await outputFile(
      join(BASE_PATH, 'package.json'),
      JSON.stringify({
        name: 'test-app',
      })
    )

    await app.init()
    assert.equal(app.appName, 'test-app')
    assert.isNull(app.version)
  })

  test('parse app version from package.json file', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await outputFile(
      join(BASE_PATH, 'package.json'),
      JSON.stringify({
        name: 'test-app',
        version: '1.0.0',
      })
    )

    await app.init()
    assert.equal(app.appName, 'test-app')
    assert.equal(app.version?.major, 1)
    assert.equal(app.version?.minor, 0)
    assert.equal(app.version?.patch, 0)
    assert.equal(app.version?.toString(), '1.0.0')
  })

  test('return null for @adonisjs/core version when not installed', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.equal(app.appName, 'adonisjs_app')
    assert.isNull(app.adonisVersion)
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
})
