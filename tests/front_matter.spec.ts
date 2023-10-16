/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parseJSONFrontMatter } from '../src/helpers.js'

test.group('Front matter', () => {
  test('get contents when there is no front matter', ({ assert }) => {
    const contents = `
    hello world
    `
    const { body, attributes } = parseJSONFrontMatter(contents)
    assert.equal(body, contents)
    assert.deepEqual(attributes, {})
  })

  test('get contents with front matter', ({ assert }) => {
    const contents = `
    ---
    {
      "to": "foo"
    }
    ---
    hello world
    `
    const { body, attributes } = parseJSONFrontMatter(contents)
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

  test('get contents around front matter', ({ assert }) => {
    const contents = `
    hello
    ---
    {
      "to": "foo"
    }
    ---
    world
    `
    const { body, attributes } = parseJSONFrontMatter(contents)
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

  test('get contents when frontmatter contents are empty', ({ assert }) => {
    const contents = `
    hello
    ---
    ---
    world
    `
    const { body, attributes } = parseJSONFrontMatter(contents)
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
    ---
    to: 'foo'
    ---
    world
    `

    parseJSONFrontMatter(contents)
  }).throws(new RegExp(/Unexpected token/))

  test('escape JSON before parsing it', ({ assert }) => {
    const contents = `
    ---
    {
      "to": "foo\\bar"
    }
    ---
    hello world
    `

    const { body, attributes } = parseJSONFrontMatter(contents)
    assert.equal(
      body,
      `
    hello world
    `
    )

    assert.deepEqual(attributes, {
      to: 'foo\\bar',
    })
  })
})
