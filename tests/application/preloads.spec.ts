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
import { PreloadsManager } from '../../src/managers/preloads.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application | preloads', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('resolve and register providers', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              isBooted: false
            }
          })
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=1',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    assert.deepEqual(await app.container.make('route'), {
      isBooted: false,
    })
  })

  test('import preloads', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.HAS_ROUTES
    })

    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      process.env.HAS_ROUTES = 'true'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=1',
          environment: ['web'],
          optional: false,
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(() => {})

    assert.equal(process.env.HAS_ROUTES, 'true')
  })

  test('raise error when module is missing', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=2',
          environment: ['web'],
          optional: false,
        },
      ],
    })

    await app.init()
    await app.boot()
    await assert.rejects(() => app.start(() => {}), /Cannot find module/)
  })

  test('ignore missing module when preload module is optional', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=3',
          environment: ['web'],
          optional: true,
        },
      ],
    })

    await app.init()
    await app.boot()
    await assert.doesNotRejects(() => app.start(() => {}))
  })

  test('report error when module imports non-existing module', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      import './foo'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=4',
          environment: ['web'],
          optional: true,
        },
      ],
    })

    await app.init()
    await app.boot()
    await assert.rejects(() => app.start(() => {}), /Cannot find module/)
  })

  test('do not import module when running in unknown environment', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      process.env.HAS_ROUTES = 'true'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'unknown',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=5',
          environment: ['web'],
          optional: true,
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(() => {})
    assert.isUndefined(process.env.HAS_ROUTES)
  })

  test('do not import module when running in different environment', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      process.env.HAS_ROUTES = 'true'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'console',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=6',
          environment: ['web'],
          optional: false,
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(() => {})
    assert.isUndefined(process.env.HAS_ROUTES)
  })

  test('import optional preloads', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.HAS_ROUTES
    })

    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      process.env.HAS_ROUTES = 'true'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      preloads: [
        {
          file: './routes.js?v=7',
          environment: ['web'],
          optional: true,
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(() => {})
    assert.equal(process.env.HAS_ROUTES, 'true')
  })

  test('raise error when module URL is invalid', async ({ assert }) => {
    // @ts-expect-error
    const preloadsManager = new PreloadsManager(BASE_PATH, { environment: 'web' })

    preloadsManager.use([
      {
        file: './routes.js?v=8',
        environment: ['web'],
        optional: true,
      },
    ])

    await assert.rejects(() => preloadsManager.import(), /Invalid URL/)
  })
})
