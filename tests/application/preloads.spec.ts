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

test.group('Application | preloads', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
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
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
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
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
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

  test('do not import module when running in unknown environment', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './routes.ts'),
      `
      process.env.HAS_ROUTES = 'true'
      `
    )

    const app = new Application(BASE_URL, {
      environment: 'unknown',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
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
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
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
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
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
})
