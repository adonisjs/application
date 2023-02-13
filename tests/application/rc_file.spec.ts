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

import { directories } from '../../src/directories.js'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application | rcFile', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('parse rc file contents', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    app.rcContents({
      typescript: true,
      providers: ['@adonisjs/core'],
    })

    await app.init()
    assert.deepEqual(app.rcFile, {
      raw: {
        typescript: true,
        providers: ['@adonisjs/core'],
      },
      typescript: true,
      preloads: [],
      directories: directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [
        {
          file: '@adonisjs/core',
          environment: ['web', 'console', 'test', 'repl'],
        },
      ],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test('parse rc file by reading from the disk', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, '.adonisrc.json'),
      JSON.stringify({
        typescript: true,
        providers: ['@adonisjs/core'],
      })
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    assert.deepEqual(app.rcFile, {
      raw: {
        typescript: true,
        providers: ['@adonisjs/core'],
      },
      typescript: true,
      preloads: [],
      directories: directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [
        {
          file: '@adonisjs/core',
          environment: ['web', 'console', 'test', 'repl'],
        },
      ],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test('report error when .adonisrc.json file is not valid json', async ({ assert }) => {
    await outputFile(join(BASE_PATH, '.adonisrc.json'), 'hello world')

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await assert.rejects(() => app.init())
  })

  test('use default rc file when no .adonisrc.json file exists', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()
    assert.deepEqual(app.rcFile, {
      raw: {},
      typescript: true,
      preloads: [],
      directories: directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test('initiate rc file editor', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    app.rcContents({
      typescript: true,
      providers: ['@adonisjs/core'],
    })

    await app.init()
    assert.deepEqual(app.rcFileEditor.toJSON(), {
      typescript: true,
      providers: ['@adonisjs/core'],
    })
  })
})
