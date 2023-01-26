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

test.group('Application | boot', () => {
  test('execute booting hooks', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    app.booted(() => {
      stack.push('booted')
    })

    app.booting(() => {
      assert.equal(app.getState(), 'initiated')
      stack.push('booting')
    })

    await app.boot()
    assert.deepEqual(stack, ['booting', 'booted'])
  })

  test('do not boot app multiple times', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    app.booted(() => {
      stack.push('booted')
    })
    await app.boot()

    assert.equal(app.getState(), 'booted')
    await app.boot()

    assert.deepEqual(stack, ['booted'])
  })

  test('execute booted hook immediately when app has been booted', async ({ assert }) => {
    const stack: string[] = []
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    await app.boot()

    await app.booted(() => {
      stack.push('booted')
    })

    assert.deepEqual(stack, ['booted'])
  })
})
