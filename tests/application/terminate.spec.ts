/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Application } from '../../src/application.ts'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Application | terminate', () => {
  test('do not terminate app multiple times', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    await app.boot()

    app.terminating(() => {
      stack.push('terminating')
    })

    await Promise.all([app.terminate(), app.terminate()])

    assert.deepEqual(stack, ['terminating'])
    assert.equal(app.getState(), 'terminated')
  })
})
