/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { RcFileEditor } from '../../src/rc_file/editor.js'

test.group('RCFile editor | addCommand', () => {
  test('add command to rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addCommand('@adonisjs/core/commands')

    assert.deepEqual(rcFile.toJSON(), { commands: ['@adonisjs/core/commands'] })
  })

  test('do not add command when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      commands: ['@adonisjs/core/commands', '@adonisjs/lucid/commands'],
    })
    rcFile.addCommand('@adonisjs/core/commands')

    assert.deepEqual(rcFile.toJSON(), {
      commands: ['@adonisjs/core/commands', '@adonisjs/lucid/commands'],
    })
  })
})

test.group('RCFile editor | addProvider', () => {
  test('add provider to rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addProvider('#providers/app')

    assert.deepEqual(rcFile.toJSON(), { providers: ['#providers/app'] })
  })

  test('add provider for specific environments', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addProvider('#providers/app', ['console', 'test'])

    assert.deepEqual(rcFile.toJSON(), {
      providers: [
        {
          file: '#providers/app',
          environment: ['console', 'test'],
        },
      ],
    })
  })

  test('add provider for all environments', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addProvider('#providers/app', ['console', 'test', 'web', 'repl'])

    assert.deepEqual(rcFile.toJSON(), {
      providers: ['#providers/app'],
    })
  })

  test('do not add provider when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      providers: ['#providers/app', '@adonisjs/core'],
    })
    rcFile.addProvider('#providers/app')

    assert.deepEqual(rcFile.toJSON(), { providers: ['#providers/app', '@adonisjs/core'] })
  })

  test('edit provider environments', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      providers: [{ file: '#providers/app', environment: ['web'] }, '@adonisjs/core'],
    })
    rcFile.addProvider('#providers/app', ['console', 'web'])

    assert.deepEqual(rcFile.toJSON(), {
      providers: [
        {
          file: '#providers/app',
          environment: ['console', 'web'],
        },
        '@adonisjs/core',
      ],
    })
  })
})

test.group('RCFile editor | setDirectory', () => {
  test('add directory in rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.setDirectory('commands', './commands')
    assert.deepEqual(rcFile.toJSON(), { directories: { commands: './commands' } })
  })

  test('update directory when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      directories: { commands: './commands', public: './public' },
    })
    rcFile.setDirectory('commands', './app/commands')
    assert.deepEqual(rcFile.toJSON(), {
      directories: { commands: './app/commands', public: './public' },
    })
  })
})

test.group('RCFile editor | setCommandAlias', () => {
  test('add command alias in rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.setCommandAlias('migrate', 'migration:run')
    assert.deepEqual(rcFile.toJSON(), { commandAliases: { migrate: 'migration:run' } })
  })

  test('update command aliases when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      commandAliases: { migrate: 'migration:run' },
    })
    rcFile.setCommandAlias('migrate', 'migration:run --force')
    assert.deepEqual(rcFile.toJSON(), { commandAliases: { migrate: 'migration:run --force' } })
  })
})

test.group('RCFile editor | setCommandAlias', () => {
  test('add command alias in rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.setCommandAlias('migrate', 'migration:run')
    assert.deepEqual(rcFile.toJSON(), { commandAliases: { migrate: 'migration:run' } })
  })

  test('update command aliases when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      commandAliases: { migrate: 'migration:run' },
    })
    rcFile.setCommandAlias('migrate', 'migration:run --force')
    assert.deepEqual(rcFile.toJSON(), { commandAliases: { migrate: 'migration:run --force' } })
  })
})

test.group('RCFile editor | addPreloadFile', () => {
  test('add preload file to rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addPreloadFile('#start/routes')

    assert.deepEqual(rcFile.toJSON(), { preloads: ['#start/routes'] })
  })

  test('add preload file for specific environments', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addPreloadFile('#start/kernel', ['console', 'test'])

    assert.deepEqual(rcFile.toJSON(), {
      preloads: [
        {
          file: '#start/kernel',
          environment: ['console', 'test'],
        },
      ],
    })
  })

  test('add preload file for all environments', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addPreloadFile('#start/kernel', ['console', 'test', 'web', 'repl'])

    assert.deepEqual(rcFile.toJSON(), {
      preloads: ['#start/kernel'],
    })
  })

  test('do not add preload file when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      preloads: ['#start/kernel', '@adonisjs/core'],
    })
    rcFile.addPreloadFile('#start/kernel')

    assert.deepEqual(rcFile.toJSON(), { preloads: ['#start/kernel', '@adonisjs/core'] })
  })

  test('edit preload file environments', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      preloads: [{ file: '#start/kernel', environment: ['web'] }, '@adonisjs/core'],
    })
    rcFile.addPreloadFile('#start/kernel', ['console', 'web'])

    assert.deepEqual(rcFile.toJSON(), {
      preloads: [
        {
          file: '#start/kernel',
          environment: ['console', 'web'],
        },
        '@adonisjs/core',
      ],
    })
  })
})

test.group('RCFile editor | addMetaFile', () => {
  test('add meta file to rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addMetaFile('resources/views/**/*.edge')

    assert.deepEqual(rcFile.toJSON(), {
      metaFiles: [
        {
          pattern: 'resources/views/**/*.edge',
          reloadServer: false,
        },
      ],
    })
  })

  test('do not add meta file when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      metaFiles: [
        { pattern: 'resources/views/**/*.edge', reloadServer: false },
        { pattern: 'public/**', reloadServer: false },
      ],
    })
    rcFile.addMetaFile('resources/views/**/*.edge')

    assert.deepEqual(rcFile.toJSON(), {
      metaFiles: [
        { pattern: 'resources/views/**/*.edge', reloadServer: false },
        {
          pattern: 'public/**',
          reloadServer: false,
        },
      ],
    })
  })

  test('update reloadServer property', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      metaFiles: [
        { pattern: 'resources/views/**/*.edge', reloadServer: false },
        { pattern: 'public/**', reloadServer: false },
      ],
    })
    rcFile.addMetaFile('resources/views/**/*.edge', true)

    assert.deepEqual(rcFile.toJSON(), {
      metaFiles: [
        { pattern: 'resources/views/**/*.edge', reloadServer: true },
        {
          pattern: 'public/**',
          reloadServer: false,
        },
      ],
    })
  })
})

test.group('RCFile editor | addSuite', () => {
  test('add test suite to rcfile', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {})
    rcFile.addSuite('functional', ['tests/functional/**/*.spec.ts'])

    assert.deepEqual(rcFile.toJSON(), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/functional/**/*.spec.ts'],
            timeout: undefined,
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
  })

  test('do not add suite when already exists', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/functional/**/*.spec.ts'],
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
    rcFile.addSuite('functional', ['tests/functional/**/*.spec.ts'])

    assert.deepEqual(rcFile.toJSON(), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/functional/**/*.spec.ts'],
            timeout: undefined,
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
  })

  test('update suite files property', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/functional/**/*.spec.ts'],
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
    rcFile.addSuite('functional', ['tests/features/**/*.spec.ts'])

    assert.deepEqual(rcFile.toJSON(), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/features/**/*.spec.ts'],
            timeout: undefined,
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
  })

  test('update suite timeout property', ({ assert }) => {
    const rcFile = new RcFileEditor(new URL('./.adonisrc.json', import.meta.url), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/functional/**/*.spec.ts'],
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
    rcFile.addSuite('functional', ['tests/features/**/*.spec.ts'], 2000)

    assert.deepEqual(rcFile.toJSON(), {
      tests: {
        suites: [
          {
            name: 'functional',
            files: ['tests/features/**/*.spec.ts'],
            timeout: 2000,
          },
          {
            name: 'unit',
            files: ['tests/unit/**/*.spec.ts'],
          },
        ],
        forceExit: true,
        timeout: 2000,
      },
    })
  })
})

test.group('RCFile editor | save', () => {
  test('save changes to disk', async ({ assert, fs }) => {
    const rcFile = new RcFileEditor(new URL('.adonisrc.json', fs.baseUrl), {})
    rcFile.addCommand('@adonisjs/core/commands')

    await rcFile.save()
    await assert.fileExists('.adonisrc.json')
    await assert.fileEquals(
      '.adonisrc.json',
      JSON.stringify({
        commands: ['@adonisjs/core/commands'],
      })
    )
  })

  test('multiple times save changes to disk', async ({ assert, fs }) => {
    const rcFile = new RcFileEditor(new URL('.adonisrc.json', fs.baseUrl), {})

    rcFile.addCommand('@adonisjs/core/commands')
    await rcFile.save()
    await assert.fileEquals(
      '.adonisrc.json',
      JSON.stringify({
        commands: ['@adonisjs/core/commands'],
      })
    )

    rcFile.addPreloadFile('#start/kernel', ['web'])
    await rcFile.save()
    await assert.fileEquals(
      '.adonisrc.json',
      JSON.stringify({
        commands: ['@adonisjs/core/commands'],
        preloads: [{ file: '#start/kernel', environment: ['web'] }],
      })
    )
  })
})
