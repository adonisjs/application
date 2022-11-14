/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Validator } from 'jsonschema'

import schema from '../adonisrc.schema.json' assert { type: 'json' }

test.group('JSON Schema', () => {
  test('ensure required properties', ({ assert }) => {
    const validator = new Validator()
    const config = {}
    const result = validator.validate(config, schema)
    assert.deepEqual(
      result.errors.map(({ message }) => message),
      ['requires property "typescript"', 'requires property "providers"']
    )
  })

  test('define preloads as an array of strings', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      preloads: ['foo'],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define preloads as an array of objects', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      preloads: [{ file: 'foo' }],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define metaFiles as an array of strings', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      metaFiles: ['.env'],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define metaFiles as an array of objects', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      metaFiles: [{ pattern: 'foo' }],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define providers as an array of strings', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: ['@adonisjs/core'],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define providers as an array of objects', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [{ file: '@adonisjs/core' }],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define an array of commands as string', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      commands: ['@adonisjs/core/commands'],
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('define commands aliases', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      commands: ['@adonisjs/core/commands'],
      commandsAliases: {
        'migration:run': 'migrate',
      },
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('fail when command alias is not a string', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      commands: ['@adonisjs/core/commands'],
      commandsAliases: {
        'migration:run': false,
      },
    }
    const result = validator.validate(config, schema)
    assert.deepEqual(
      result.errors.map(({ message }) => message),
      ['is not of a type(s) string']
    )
  })

  test('define unknown directories', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      directories: { customDir: 'dir' },
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('make sure unknown directories are always defined as strings', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      directories: { customDir: true },
    }
    const result = validator.validate(config, schema)
    assert.deepEqual(
      result.errors.map(({ message }) => message),
      ['is not of a type(s) string']
    )
  })

  test('define test suites', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      tests: {
        suites: [
          {
            name: 'unit',
            files: 'tests/unit/**/*.spec.ts',
          },
        ],
      },
    }
    const result = validator.validate(config, schema)
    assert.lengthOf(result.errors, 0)
  })

  test('fail when suite name is missing', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      tests: {
        suites: [
          {
            files: 'tests/unit/**/*.spec.ts',
          },
        ],
      },
    }
    const result = validator.validate(config, schema)
    assert.deepEqual(
      result.errors.map(({ message }) => message),
      ['requires property "name"']
    )
  })

  test('fail when suite files are missing', ({ assert }) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      tests: {
        suites: [
          {
            name: 'unit',
          },
        ],
      },
    }
    const result = validator.validate(config, schema)
    assert.deepEqual(
      result.errors.map(({ message }) => message),
      ['requires property "files"']
    )
  })
})
