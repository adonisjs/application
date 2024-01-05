/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parseStubExports } from '../src/helpers.js'

test.group('Stub exports', () => {
  test('get contents when there are no exports', ({ assert }) => {
    const contents = `
    hello world
    `
    const { body, attributes } = parseStubExports(contents)
    assert.equal(body, contents)
    assert.deepEqual(attributes, {})
  })

  test('get contents with exports', ({ assert }) => {
    const contents = `
    <!--EXPORT_START-->{"to": "foo"}<!--EXPORT_END-->
    hello world
    `
    const { body, attributes } = parseStubExports(contents)
    assert.equal(
      body,
      `
    hello world
    `
    )
    assert.deepEqual(attributes, {
      to: 'foo',
    })
  })

  test('get contents around exports', ({ assert }) => {
    const contents = `
    hello
    <!--EXPORT_START-->{"to": "foo"}<!--EXPORT_END-->
    world
    `
    const { body, attributes } = parseStubExports(contents)
    assert.equal(
      body,
      `
    hello
    world
    `
    )
    assert.deepEqual(attributes, {
      to: 'foo',
    })
  })

  test('get contents when stub exports are empty', ({ assert }) => {
    const contents = `
    hello
    <!--EXPORT_START-->{}<!--EXPORT_END-->
    world
    `
    const { body, attributes } = parseStubExports(contents)
    assert.equal(
      body,
      `
    hello
    world
    `
    )
    assert.deepEqual(attributes, {})
  })

  test('throw error when front matter block is not a valid JSON', () => {
    const contents = `
    hello
    <!--EXPORT_START-->{ a: b }<!--EXPORT_END-->
    world
    `

    parseStubExports(contents)
  }).throws(new RegExp(/Unexpected token|in JSON at position/))
})
