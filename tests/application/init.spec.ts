/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Container } from '@adonisjs/fold'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Application | init', () => {
  test('configure container', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.instanceOf(app.container, Container)
    assert.equal(app.getState(), 'initiated')
  })

  test('do not initiate app multiple times', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.equal(app.getState(), 'initiated')
    assert.isUndefined(process.env.HOST)

    await app.init()
  })

  test('update environment before app is initiated', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.setEnvironment('repl')
    assert.equal(app.getEnvironment(), 'repl')
  })

  test('update environment after app is initiated', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    app.setEnvironment('repl')
    assert.equal(app.getEnvironment(), 'repl')
  })

  test('do not allow updating environment after app has been booted', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    await app.boot()
    assert.throws(
      () => app.setEnvironment('repl'),
      'Cannot switch environment once the app has been booted'
    )
  })
})
