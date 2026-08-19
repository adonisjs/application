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
import { Application } from '../../src/application.ts'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application | warm up', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('warm up app without making it ready', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      mode: 'warmup',
    })

    app.starting(() => {
      stack.push('starting')
    })
    app.ready(() => {
      stack.push('ready')
    })

    await app.init()
    await app.boot()
    await app.warmUp()

    assert.deepEqual(stack, ['starting'])
    assert.equal(app.getState(), 'warmed')
    assert.isTrue(app.isWarmedUp)
    assert.isFalse(app.isReady)
  })

  test('run providers start method during warm up', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      mode: 'warmup',
    })

    app.rcContents({
      providers: [
        {
          file: async () => {
            return {
              default: class Provider {
                async start() {
                  stack.push('provider start')
                }
                async ready() {
                  stack.push('provider ready')
                }
              },
            }
          },
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.warmUp()

    assert.deepEqual(stack, ['provider start'])
  })

  test('import preloads during warm up', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.HAS_WARMUP_ROUTES
    })

    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      process.env.HAS_WARMUP_ROUTES = 'true'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      mode: 'warmup',
    })

    app.rcContents({
      preloads: [
        {
          file: () => import(new URL('./routes.js?v=warmup', BASE_URL).href),
          environment: ['web'],
          optional: false,
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.warmUp()

    assert.equal(process.env.HAS_WARMUP_ROUTES, 'true')
  })

  test('do not warm up app multiple times', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      mode: 'warmup',
    })

    app.starting(() => {
      stack.push('starting')
    })

    await app.init()
    await app.boot()
    await app.warmUp()
    await app.warmUp()

    assert.deepEqual(stack, ['starting'])
  })

  test('disallow starting an app created in warmup mode', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      mode: 'warmup',
    })

    await app.init()
    await app.boot()

    await assert.rejects(
      () => app.start(() => {}),
      'Cannot start an application created in "warmup" mode'
    )
  })

  test('terminate a warmed up app without shutting down the providers', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      mode: 'warmup',
    })

    app.rcContents({
      providers: [
        {
          file: async () => {
            return {
              default: class Provider {
                async shutdown() {
                  stack.push('provider shutdown')
                }
              },
            }
          },
          environment: ['web'],
        },
      ],
    })

    app.terminating(() => {
      stack.push('terminating')
    })

    await app.init()
    await app.boot()
    await app.warmUp()
    await app.terminate()

    assert.deepEqual(stack, ['terminating'])
    assert.equal(app.getState(), 'terminated')
  })
})

test.group('Application | warm up | run mode', () => {
  test('warm up app as part of starting it', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.starting(() => {
      stack.push('starting')
    })
    app.ready(() => {
      stack.push('ready')
    })

    await app.init()
    await app.boot()
    await app.start(() => {
      stack.push('start')
    })

    assert.deepEqual(stack, ['starting', 'start', 'ready'])
    assert.equal(app.getState(), 'ready')
  })

  test('start an app that has already been warmed up', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.starting(() => {
      stack.push('starting')
    })

    await app.init()
    await app.boot()
    await app.warmUp()

    assert.equal(app.getState(), 'warmed')

    await app.start(() => {
      stack.push('start')
    })

    assert.deepEqual(stack, ['starting', 'start'])
    assert.equal(app.getState(), 'ready')
  })

  test('shutdown providers when terminating a started app', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      providers: [
        {
          file: async () => {
            return {
              default: class Provider {
                async shutdown() {
                  stack.push('provider shutdown')
                }
              },
            }
          },
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(() => {})
    await app.terminate()

    assert.deepEqual(stack, ['provider shutdown'])
  })
})

test.group('Application | mode', () => {
  test('default to the "run" mode', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    assert.equal(app.getMode(), 'run')
  })

  test('switch mode before the app is booted', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.setMode('warmup')
    assert.equal(app.getMode(), 'warmup')

    await app.init()
    app.setMode('run')
    assert.equal(app.getMode(), 'run')
  })

  test('disallow switching mode once the app has been booted', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()
    await app.boot()

    assert.throws(() => app.setMode('warmup'), 'Cannot switch mode once the app has been booted')
  })
})
