/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Application } from '../index.js'
import { AppFactory } from '../test_factories/app.js'

test.group('App factory', () => {
  test('create app instance using app factory', ({ assert }) => {
    const app = new AppFactory().create(new URL('./app/', import.meta.url))
    assert.instanceOf(app, Application)
    assert.equal(app.getEnvironment(), 'web')
  })

  test('pass options using the factory', ({ assert }) => {
    const app = new AppFactory()
      .merge({ options: { environment: 'console' } })
      .create(new URL('./app/', import.meta.url))

    assert.instanceOf(app, Application)
    assert.equal(app.getEnvironment(), 'console')
  })
})
