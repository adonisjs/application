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
import { RcFileParser } from '../../src/rc_file/parser.js'

test.group('Rc Parser', () => {
  test('parse empty object to rcfile node', ({ assert }) => {
    const parser = new RcFileParser({})

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
    const parser = new RcFileParser({
      commands: ['./foo/bar'],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        commands: ['./foo/bar'],
      },
      typescript: true,
      preloads: [],
      metaFiles: [],
      directories,
      commands: ['./foo/bar'],
      commandsAliases: {},
      providers: [],
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: true,
      },
    })
  })

  test('define preloads as an array of strings', ({ assert }) => {
    const parser = new RcFileParser({
      preloads: ['./foo/bar'],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        preloads: ['./foo/bar'],
      },
      typescript: true,
      preloads: [
        {
          file: './foo/bar',
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
    const parser = new RcFileParser({
      preloads: [
        {
          file: './foo/bar',
          environment: ['web'],
        },
      ],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        preloads: [
          {
            file: './foo/bar',
            environment: ['web'],
          },
        ],
      },
      typescript: true,
      preloads: [
        {
          file: './foo/bar',
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
    const parser = new RcFileParser({
      preloads: [
        {
          file: 'foo',
          force: false,
          bar: false,
        },
      ],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        preloads: [
          {
            file: 'foo',
            force: false,
            bar: false,
          },
        ],
      },
      typescript: true,
      preloads: [
        {
          file: 'foo',
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

  test('define metaFiles as an array of strings', ({ assert }) => {
    const parser = new RcFileParser({
      metaFiles: ['public/**'],
    })

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
    const parser = new RcFileParser({
      metaFiles: [
        {
          pattern: 'public/**',
          reloadServer: false,
        },
      ],
    })

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

  test('define providers as an array of strings', ({ assert }) => {
    const parser = new RcFileParser({
      providers: ['@adonisjs/core'],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        providers: ['@adonisjs/core'],
      },
      typescript: true,
      preloads: [],
      directories,
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

  test('raise exception when provider file path is missing', ({ assert }) => {
    const parser = new RcFileParser({
      providers: [{}],
    })

    assert.throws(() => parser.parse(), 'Invalid provider entry "{}". Missing file property')
  })

  test('define providers as an array of objects', ({ assert }) => {
    const parser = new RcFileParser({
      providers: [{ file: '@adonisjs/core' }],
    })

    assert.deepEqual(parser.parse(), {
      raw: {
        providers: [{ file: '@adonisjs/core' }],
      },
      typescript: true,
      preloads: [],
      directories,
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
