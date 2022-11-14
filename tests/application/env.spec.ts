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
import { Env } from '@adonisjs/env'
import { fileURLToPath } from 'node:url'
import { outputFile, remove } from 'fs-extra'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application | env', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('get app environment', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    assert.instanceOf(app, Application)
    assert.equal(app.getEnvironment(), 'web')
  })

  test('load env variables from raw string', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.envContents(`
    HOST=localhost
    PORT=3000
    `)

    await app.init()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '3000')
  })

  test('use empty string for env variables', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.envContents('')

    await app.init()
    assert.isUndefined(process.env.HOST, 'localhost')
    assert.isUndefined(process.env.PORT, '3000')
  })

  test('load env variables from disk', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    await outputFile(
      join(BASE_PATH, '.env'),
      `
    HOST=localhost
    PORT=3000
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '3000')
  })

  test('validate env variables', async ({ assert, cleanup, expectTypeOf }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    const validatorFn = Env.rules({
      PORT: Env.schema.number(),
      HOST: Env.schema.string(),
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
      envValidator: validatorFn,
    })

    app.envContents(`
    HOST=localhost
    PORT=3000
    `)

    await app.init()

    expectTypeOf(app.env.get('HOST')).toEqualTypeOf<string>()
    expectTypeOf(app.env.get('PORT')).toEqualTypeOf<number>()

    assert.equal(app.env.get('HOST'), 'localhost')
    assert.strictEqual(app.env.get('PORT'), 3000)
  })

  test('raise exception when env validation fails', async ({ assert, cleanup }) => {
    assert.plan(1)

    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    const validatorFn = Env.rules({
      PORT: Env.schema.number(),
      HOST: Env.schema.string(),
    })

    const app = new Application(BASE_URL, {
      environment: 'web',
      envValidator: validatorFn,
    })

    try {
      await app.init()
    } catch (error) {
      assert.deepEqual(error.cause.split('\n'), [
        '- E_MISSING_ENV_VALUE: Missing environment variable "PORT"',
        '- E_MISSING_ENV_VALUE: Missing environment variable "HOST"',
      ])
    }
  })
})
