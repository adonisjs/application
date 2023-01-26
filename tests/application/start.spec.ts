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

test.group('Application | start', () => {
  test('do not start app multiple times', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    await app.boot()

    app.ready(() => {
      stack.push('ready')
    })

    await app.start(() => {
      stack.push('starting')
    })
    await app.start(() => {
      stack.push('starting')
    })

    assert.deepEqual(stack, ['starting', 'ready'])
    assert.equal(app.getState(), 'ready')
  })

  test('invoke ready hook immediately when the app has been started', async ({ assert }) => {
    const stack: string[] = []
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    await app.boot()
    await app.start(() => {})

    app.ready(async () => {
      stack.push('ready')
    })

    assert.deepEqual(stack, ['ready'])
  })
})
