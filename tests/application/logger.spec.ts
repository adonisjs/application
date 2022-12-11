/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { LoggerManager } from '@adonisjs/logger'

import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Application | logger', () => {
  test('configure logger', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.useConfig({
      logger: {
        default: 'app',
        loggers: {
          app: {
            level: 'warn',
            enabled: true,
          },
        },
      },
    })

    await app.init()

    assert.isTrue(app.logger.isEnabled)
    assert.equal(app.logger.level, 'warn')
    assert.instanceOf(app.logger, LoggerManager)
  })
})
