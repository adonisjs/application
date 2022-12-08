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

  test('use default name when package.json does not exists', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.equal(app.appName, 'adonisjs_app')
    assert.equal(process.env.APP_NAME, 'adonisjs_app')
    assert.isNull(app.version)
  })

  test('use default name when package.json does not have name', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await outputFile(join(BASE_PATH, 'package.json'), JSON.stringify({}))

    await app.init()
    assert.equal(app.appName, 'adonisjs_app')
    assert.equal(process.env.APP_NAME, 'adonisjs_app')
    assert.isNull(app.version)
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
    assert.equal(process.env.APP_NAME, 'test-app')
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
    assert.equal(process.env.APP_NAME, 'test-app')
    assert.equal(app.version?.major, 1)
    assert.equal(app.version?.minor, 0)
    assert.equal(app.version?.patch, 0)
    assert.equal(app.version?.toString(), '1.0.0')
    assert.equal(process.env.APP_VERSION, '1.0.0')
  })

  test('return null for @adonisjs/core version when not installed', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.equal(app.appName, 'adonisjs_app')
    assert.isNull(app.adonisVersion)
  })

  test('return null when @adonisjs/core does not have version', async ({ assert, cleanup }) => {
    const pkgPath = join(BASE_PATH, '../../../node_modules/@adonisjs/core')
    cleanup(async () => {
      await remove(pkgPath)
    })

    await outputFile(join(pkgPath, 'package.json'), JSON.stringify({}))

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.isNull(app.adonisVersion)
  })

  test('return version of @adonisjs/core package', async ({ assert, cleanup }) => {
    const pkgPath = join(BASE_PATH, '../../../node_modules/@adonisjs/core')
    cleanup(async () => {
      await remove(pkgPath)
    })

    await outputFile(
      join(pkgPath, 'package.json'),
      JSON.stringify({
        version: '4.0.0',
      })
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.equal(app.appName, 'adonisjs_app')
    assert.equal(app.adonisVersion?.major, 4)
    assert.equal(app.adonisVersion?.minor, 0)
    assert.equal(app.adonisVersion?.patch, 0)
    assert.equal(app.adonisVersion?.toString(), '4.0.0')
    assert.equal(process.env.ADONIS_VERSION, '4.0.0')
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

  test('raise exception when current version of Node does not satisify node engine', async ({
    assert,
  }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await outputFile(
      join(BASE_PATH, 'package.json'),
      JSON.stringify({
        name: 'test-app',
        version: '1.0.0',
        engines: {
          node: '<=10.0.0',
        },
      })
    )

    await assert.rejects(
      () => app.init(),
      `The installed Node.js version "${process.version}" does not satisfy the expected Node.js version "<=10.0.0" defined inside package.json file`
    )
  })
})
