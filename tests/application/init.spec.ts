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
import { StubsManager } from '../../src/stubs/manager.js'

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

  test('configure stubs manager', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()

    assert.instanceOf(app.stubs, StubsManager)
    assert.equal(app.getState(), 'initiated')
  })

  test('listen for initiating hook', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.initiating(() => {
      stack.push('initiating')
    })

    await app.init()

    assert.equal(app.getState(), 'initiated')
    assert.deepEqual(stack, ['initiating'])
  })

  test('do not initiate app multiple times', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.initiating(() => {
      stack.push('initiating')
    })

    await app.init()
    await app.init()
    await app.init()

    assert.equal(app.getState(), 'initiated')
    assert.deepEqual(stack, ['initiating'])
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
