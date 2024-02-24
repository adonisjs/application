/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { directories } from '../../src/directories.js'
import { defineConfig } from '../../src/define_config.js'
import { RcFileParser } from '../../src/rc_file/parser.js'

test.group('Rc Parser', () => {
  test('parse empty object to rcfile node', ({ assert }) => {
    const parser = new RcFileParser(defineConfig({}))

    assert.deepEqual(parser.parse(), {
      raw: {},
      typescript: true,
      preloads: [],
      directories,
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

  test('parse partial object to rcfile node', ({ assert }) => {
    const commandsLoader = async () => {}

    const parser = new RcFileParser(
      defineConfig({
        commands: [commandsLoader],
      })
    )

    assert.deepEqual(parser.parse(), {
      raw: {
        commands: [commandsLoader],
      },
      typescript: true,
      preloads: [],
      metaFiles: [],
      directories,
      commands: [commandsLoader],
      commandsAliases: {},
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })
})

test.group('Rc Parser | preloads', () => {
  test('define preloads as an array of functions', ({ assert }) => {
    const preloadFileLoader = async () => {}

    const parser = new RcFileParser(
      defineConfig({
        preloads: [preloadFileLoader],
      })
    )

    assert.deepEqual(parser.parse(), {
      raw: {
        preloads: [preloadFileLoader],
      },
      typescript: true,
      preloads: [
        {
          file: preloadFileLoader,
          environment: ['web', 'console', 'test', 'repl'],
        },
      ],
      directories,
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

  test('define preloads as an array of objects', ({ assert }) => {
    const preloadFileLoader = async () => {}

    const parser = new RcFileParser(
      defineConfig({
        preloads: [
          {
            file: preloadFileLoader,
            environment: ['web'],
          },
        ],
      })
    )

    assert.deepEqual(parser.parse(), {
      raw: {
        preloads: [
          {
            file: preloadFileLoader,
            environment: ['web'],
          },
        ],
      },
      typescript: true,
      preloads: [
        {
          file: preloadFileLoader,
          environment: ['web'],
        },
      ],
      directories,
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

  test('drop extra nodes from preloads', ({ assert }) => {
    const preloadFileLoader = async () => {}

    const parser = new RcFileParser({
      preloads: [
        {
          file: preloadFileLoader,
          force: false,
          bar: false,
        },
      ],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        preloads: [
          {
            file: preloadFileLoader,
            force: false,
            bar: false,
          },
        ],
      },
      typescript: true,
      preloads: [
        {
          file: preloadFileLoader,
          environment: ['web', 'console', 'test', 'repl'],
        },
      ],
      directories,
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

  test("raise exception when preload doesn't defines file property", ({ assert }) => {
    const parser = new RcFileParser({
      preloads: [
        {
          path: 'foo',
        },
      ],
    })

    const fn = () => parser.parse()
    assert.throws(fn, `Invalid preload entry "{ path: 'foo' }". Missing file property`)
  })

  test('raise exception when preload file is not a function', ({ assert }) => {
    const parser = new RcFileParser({
      preloads: [
        {
          file: 'foo',
        },
      ],
    })

    const fn = () => parser.parse()
    assert.throws(
      fn,
      `Invalid preload entry "{ file: 'foo' }". The file property must be a function`
    )
  })
})

test.group('Rc Parser | metaFiles', () => {
  test('define metaFiles as an array of strings', ({ assert }) => {
    const parser = new RcFileParser(
      defineConfig({
        metaFiles: ['public/**'],
      })
    )

    assert.deepEqual(parser.parse(), {
      raw: {
        metaFiles: ['public/**'],
      },
      typescript: true,
      preloads: [],
      directories,
      metaFiles: [
        {
          pattern: 'public/**',
          reloadServer: true,
        },
      ],
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

  test('define metaFiles as an array of objects', ({ assert }) => {
    const parser = new RcFileParser(
      defineConfig({
        metaFiles: [
          {
            pattern: 'public/**',
            reloadServer: false,
          },
        ],
      })
    )

    assert.deepEqual(parser.parse(), {
      raw: {
        metaFiles: [
          {
            pattern: 'public/**',
            reloadServer: false,
          },
        ],
      },
      typescript: true,
      preloads: [],
      metaFiles: [
        {
          pattern: 'public/**',
          reloadServer: false,
        },
      ],
      directories,
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

  test('drop extra nodes from metaFiles', ({ assert }) => {
    const parser = new RcFileParser({
      metaFiles: [
        {
          pattern: 'public/**/*',
          force: false,
          bar: false,
        },
      ],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        metaFiles: [
          {
            pattern: 'public/**/*',
            force: false,
            bar: false,
          },
        ],
      },
      typescript: true,
      preloads: [],
      metaFiles: [
        {
          pattern: 'public/**/*',
          reloadServer: true,
        },
      ],
      commands: [],
      commandsAliases: {},
      directories,
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test("raise exception when metaFile doesn't defines pattern property", ({ assert }) => {
    const parser = new RcFileParser({
      metaFiles: [
        {
          path: 'foo',
        },
      ],
    })

    const fn = () => parser.parse()
    assert.throws(fn, `Invalid metafile entry "{ path: 'foo' }". Missing pattern property`)
  })
})

test.group('Rc Parser | tests', () => {
  test('raise error when test suite name is missing', ({ assert }) => {
    const parser = new RcFileParser({
      tests: {
        suites: [{}],
      },
    })

    const fn = () => parser.parse()
    assert.throws(fn, 'Invalid suite entry "{}". Missing name property')
  })

  test('raise error when test suite files are missing', ({ assert }) => {
    const parser = new RcFileParser({
      tests: {
        suites: [
          {
            name: 'unit',
          },
        ],
      },
    })

    const fn = () => parser.parse()
    assert.throws(fn, `Invalid suite entry "{ name: 'unit' }". Missing files property`)
  })

  test('parse test suites', ({ assert }) => {
    const parser = new RcFileParser({
      tests: {
        suites: [
          {
            name: 'unit',
            files: ['tests/**/*.spec.ts'],
          },
        ],
      },
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        tests: {
          suites: [
            {
              name: 'unit',
              files: ['tests/**/*.spec.ts'],
            },
          ],
        },
      },
      typescript: true,
      preloads: [],
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      directories,
      providers: [],
      tests: {
        suites: [
          {
            name: 'unit',
            directories: ['tests'],
            files: ['tests/**/*.spec.ts'],
            timeout: undefined,
          },
        ],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test('define empty array of suites when not defined in rcfile', ({ assert }) => {
    const parser = new RcFileParser({
      tests: {},
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        tests: {},
      },
      typescript: true,
      preloads: [],
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      directories,
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test('convert test suite files to an array', ({ assert }) => {
    const parser = new RcFileParser({
      tests: {
        suites: [
          {
            name: 'unit',
            files: 'tests/unit/**/*.spec.ts',
          },
        ],
      },
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        tests: {
          suites: [
            {
              name: 'unit',
              files: 'tests/unit/**/*.spec.ts',
            },
          ],
        },
      },
      typescript: true,
      preloads: [],
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      directories,
      providers: [],
      tests: {
        suites: [
          {
            name: 'unit',
            directories: ['tests/unit'],
            files: ['tests/unit/**/*.spec.ts'],
            timeout: undefined,
          },
        ],
        timeout: 2000,
        forceExit: true,
      },
    })
  })
})

test.group('Rc Parser | providers', () => {
  test('define providers as an array of functions', ({ assert }) => {
    const providerLoader = async () => {}

    const parser = new RcFileParser({
      providers: [providerLoader],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        providers: [providerLoader],
      },
      typescript: true,
      preloads: [],
      directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [
        {
          file: providerLoader,
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

  test('raise exception when provider file path is missing', ({ assert }) => {
    const parser = new RcFileParser({
      providers: [{}],
    })

    assert.throws(() => parser.parse(), 'Invalid provider entry "{}". Missing file property')
  })

  test('raise exception when provider file path is not a function', ({ assert }) => {
    const parser = new RcFileParser({
      providers: [{ file: 'foo/bar' }],
    })

    assert.throws(
      () => parser.parse(),
      `Invalid provider entry "{ file: 'foo/bar' }". The file property must be a function`
    )
  })

  test('define providers as an array of objects', ({ assert }) => {
    const providerLoader = async () => {}

    const parser = new RcFileParser({
      providers: [{ file: providerLoader }],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        providers: [{ file: providerLoader }],
      },
      typescript: true,
      preloads: [],
      directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [
        {
          file: providerLoader,
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
})

test.group('Rc Parser | assetsBundler', () => {
  test('parse assetsBundler property', ({ assert }) => {
    const parser = new RcFileParser({
      assetsBundler: {
        name: 'vite',
        devServer: {
          command: 'vite',
          args: [],
        },
        build: {
          command: 'vite',
          args: ['build'],
        },
      },
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        assetsBundler: {
          name: 'vite',
          devServer: {
            command: 'vite',
            args: [],
          },
          build: {
            command: 'vite',
            args: ['build'],
          },
        },
      },
      typescript: true,
      assetsBundler: {
        name: 'vite',
        devServer: {
          command: 'vite',
          args: [],
        },
        build: {
          command: 'vite',
          args: ['build'],
        },
      },
      preloads: [],
      directories,
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

  test('raise error when assetsBundler properties are missing', ({ assert }) => {
    assert.throws(
      () =>
        new RcFileParser({
          assetsBundler: {
            name: 'vite',
          },
        }).parse(),
      'Invalid assetsBundler entry. Missing devServer property'
    )

    assert.throws(
      () =>
        new RcFileParser({
          assetsBundler: {
            name: 'vite',
            devServer: {
              command: 'vite',
            },
          },
        }).parse(),
      'Invalid assetsBundler entry. Missing build property'
    )

    assert.throws(
      () =>
        new RcFileParser({
          assetsBundler: {
            devServerCommand: 'vite',
            buildCommand: 'vite build',
          },
        }).parse(),
      'Invalid assetsBundler entry. Missing name property'
    )
  })

  test('parse assetsBundler with false value', ({ assert }) => {
    const parser = new RcFileParser({ assetsBundler: false })

    assert.deepEqual(parser.parse(), {
      raw: { assetsBundler: false },
      typescript: true,
      assetsBundler: false,
      preloads: [],
      directories,
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
})

test.group('Rc Parser | directories', () => {
  test('merge directories with default directories list', ({ assert }) => {
    const parser = new RcFileParser({
      directories: {
        views: './templates',
      },
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        directories: {
          views: './templates',
        },
      },
      typescript: true,
      preloads: [],
      directories: {
        ...directories,
        views: './templates',
      },
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
})

test.group('Rc Parser | assembler', () => {
  test('parse runner properly', ({ assert }) => {
    const parser = new RcFileParser({
      unstable_assembler: {
        runner: {
          name: 'bun',
          command: 'bun',
          args: ['--flag'],
        },
      },
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        unstable_assembler: {
          runner: {
            name: 'bun',
            command: 'bun',
            args: ['--flag'],
          },
        },
      },
      typescript: true,
      preloads: [],
      directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
      unstable_assembler: {
        runner: {
          name: 'bun',
          command: 'bun',
          args: ['--flag'],
        },
      },
    })
  })

  test('raise error when runner properties are missing', ({ assert }) => {
    assert.throws(
      () =>
        new RcFileParser({
          unstable_assembler: {
            runner: {
              name: 'bun',
            },
          },
        }).parse(),
      'Invalid assembler.runner entry. Missing command property'
    )

    assert.throws(
      () =>
        new RcFileParser({
          unstable_assembler: {
            runner: {
              command: 'bun',
            },
          },
        }).parse(),
      'Invalid assembler.runner entry. Missing name property'
    )
  })

  test('parse assembler hooks properly', ({ assert }) => {
    const onBuildStarting = () => {}
    const onBuildCompleted = () => {}
    const onDevServerStarted = () => {}

    const parser = new RcFileParser({
      unstable_assembler: {
        onBuildStarting,
        onBuildCompleted,
        onDevServerStarted,
      },
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        unstable_assembler: {
          onBuildStarting,
          onBuildCompleted,
          onDevServerStarted,
        },
      },
      typescript: true,
      preloads: [],
      directories,
      metaFiles: [],
      commands: [],
      commandsAliases: {},
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
      unstable_assembler: {
        onBuildStarting,
        onBuildCompleted,
        onDevServerStarted,
      },
    })
  })
})
