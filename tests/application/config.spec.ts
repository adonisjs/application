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

test.group('Application | config', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('use config tree defined explicitly', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.useConfig({
      app: {
        name: 'adonisjs',
      },
      logger: {
        default: 'app',
        loggers: {
          app: {},
        },
      },
    })

    await app.init()
    assert.deepEqual(app.config.all(), {
      app: {
        name: 'adonisjs',
      },
      logger: {
        default: 'app',
        loggers: {
          app: {},
        },
      },
    })
  })

  test('load config from disk', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'config/app.ts'),
      `
    const app = { name: 'adonisjs' }
    export default app
    `
    )

    await outputFile(
      join(BASE_PATH, 'config/logger.ts'),
      `
      const logger = {
        default: 'app',
        loggers: {
          app: {}
        }
      }

      export default logger
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.deepEqual(app.config.all(), {
      app: {
        name: 'adonisjs',
      },
      logger: {
        default: 'app',
        loggers: {
          app: {},
        },
      },
    })
  })

  test('use explicit config over files from disk', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'config/app.ts'),
      `
    const app = { name: 'adonisjs' }
    export default app
    `
    )

    await outputFile(
      join(BASE_PATH, 'config/logger.ts'),
      `
      const logger = {
        default: 'app',
        loggers: {
          app: {}
        }
      }

      export default logger
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.useConfig({
      app: {
        name: 'adonis_js',
      },
    })

    await app.init()
    assert.deepEqual(app.config.all(), {
      app: {
        name: 'adonis_js',
      },
    })
  })
})
