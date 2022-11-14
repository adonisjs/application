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
  test('do not boot app multiple times', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
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
})
