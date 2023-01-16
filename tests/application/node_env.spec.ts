/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Application | nodeEnv', () => {
  test('normalize dev NODE_ENV value', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    process.env.NODE_ENV = 'dev'
    const app = new Application(BASE_URL, {
      environment: 'web',
    })
    await app.init()

    assert.equal(app.nodeEnvironment, 'development')
    assert.isTrue(app.inDev)
    assert.isFalse(app.inProduction)
    assert.isFalse(app.inTest)
  })

  test('normalize develop NODE_ENV value', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    process.env.NODE_ENV = 'develop'
    const app = new Application(BASE_URL, {
      environment: 'web',
    })
    await app.init()

    assert.equal(app.nodeEnvironment, 'development')
    assert.isTrue(app.inDev)
    assert.isFalse(app.inProduction)
    assert.isFalse(app.inTest)
  })

  test('normalize testing NODE_ENV value', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    process.env.NODE_ENV = 'testing'
    const app = new Application(BASE_URL, {
      environment: 'web',
    })
    await app.init()

    assert.equal(app.nodeEnvironment, 'test')
    assert.isTrue(app.inTest)
    assert.isFalse(app.inProduction)
    assert.isFalse(app.inDev)
  })

  test('normalize prod NODE_ENV value', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    process.env.NODE_ENV = 'prod'
    const app = new Application(BASE_URL, {
      environment: 'web',
    })
    await app.init()

    assert.equal(app.nodeEnvironment, 'production')
    assert.isTrue(app.inProduction)
    assert.isFalse(app.inTest)
    assert.isFalse(app.inDev)
  })

  test('use other NODE_ENV values as it is', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    process.env.NODE_ENV = 'staging'
    const app = new Application(BASE_URL, {
      environment: 'web',
    })
    await app.init()

    assert.equal(app.nodeEnvironment, 'staging')
    assert.isFalse(app.inProduction)
    assert.isFalse(app.inTest)
    assert.isFalse(app.inDev)
  })
})
