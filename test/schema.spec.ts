/*
* @adonisjs/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { Validator } from 'jsonschema'

test.group('JSON Schema', () => {
  test('ensure required properties', (assert) => {
    const validator = new Validator()
    const config = {}
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.deepEqual(result.errors.map(({ message }) => message), [
      'requires property "exceptionHandlerNamespace"',
      'requires property "typescript"',
      'requires property "providers"',
    ])
  })

  test('define preloads as an array of strings', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      preloads: ['foo'],
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.lengthOf(result.errors, 0)
  })

  test('define preloads as an array of strings', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      preloads: [{ file: 'foo' }],
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.lengthOf(result.errors, 0)
  })

  test('define metaFiles as an array of strings', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      metaFiles: ['.env'],
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.lengthOf(result.errors, 0)
  })

  test('define metaFiles as an array of objects', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      metaFiles: [{ pattern: 'foo' }],
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.lengthOf(result.errors, 0)
  })

  test('define unknown directories', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      directories: { customDir: 'dir' },
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.lengthOf(result.errors, 0)
  })

  test('make sure unknown directories are always defined as strings', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      directories: { customDir: true },
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.deepEqual(result.errors.map(({ message }) => message), [
      'is not of a type(s) string',
    ])
  })

  test('define unknown namespaces', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      namespaces: { services: 'App/Services' },
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.lengthOf(result.errors, 0)
  })

  test('make sure unknown namespaces are always defined as strings', (assert) => {
    const validator = new Validator()
    const config = {
      exceptionHandlerNamespace: '',
      typescript: true,
      providers: [],
      namespaces: { customDir: true },
    }
    const result = validator.validate(config, require('../adonisrc.schema.json'))
    assert.deepEqual(result.errors.map(({ message }) => message), [
      'is not of a type(s) string',
    ])
  })
})
