/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Application | experimentalFlags', () => {
  test('check if an experimentalFlags is defined', async ({ assert, expectTypeOf }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      experimental: {
        shutdownInReverseOrder: true,
        deepMergeRequestBody: false,
      },
    })

    await app.init()
    expectTypeOf(app.experimentalFlags.enabled).parameters.toEqualTypeOf<
      ['shutdownInReverseOrder' | (string & {})]
    >()

    assert.isTrue(app.experimentalFlags.enabled('shutdownInReverseOrder'))
    assert.isTrue(app.experimentalFlags.has('shutdownInReverseOrder'))
    assert.isFalse(app.experimentalFlags.disabled('shutdownInReverseOrder'))

    assert.isFalse(app.experimentalFlags.enabled('deepMergeRequestBody'))
    assert.isTrue(app.experimentalFlags.has('deepMergeRequestBody'))
    assert.isTrue(app.experimentalFlags.disabled('deepMergeRequestBody'))

    assert.isFalse(app.experimentalFlags.enabled('nonExistingFlag'))
    assert.isFalse(app.experimentalFlags.has('nonExistingFlag'))
    assert.isFalse(app.experimentalFlags.disabled('nonExistingFlag'))
  })

  test('execute enabled callback a feature flag has been enabled', async ({
    assert,
    expectTypeOf,
  }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      experimental: {
        shutdownInReverseOrder: true,
      },
    })

    await app.init()
    const result = app.experimentalFlags.when('shutdownInReverseOrder', () => {
      return 'Flag is enabled'
    })

    assert.equal(result, 'Flag is enabled')
    expectTypeOf(result).toEqualTypeOf<string | undefined>()
  })

  test('return undefined when feature flag is not enabled', async ({ assert, expectTypeOf }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      experimental: {
        shutdownInReverseOrder: false,
      },
    })

    await app.init()
    const result = app.experimentalFlags.when('shutdownInReverseOrder', () => {
      return 'Flag is enabled'
    })

    assert.isUndefined(result)
    expectTypeOf(result).toEqualTypeOf<string | undefined>()
  })

  test('execute disabled callback when feature flag is not enabled', async ({
    assert,
    expectTypeOf,
  }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    app.rcContents({
      experimental: {
        shutdownInReverseOrder: false,
      },
    })

    await app.init()
    const result = app.experimentalFlags.when(
      'shutdownInReverseOrder',
      () => {
        return 'Flag is enabled'
      },
      () => {
        return 'Flag is not enabled'
      }
    )

    assert.equal(result, 'Flag is not enabled')
    expectTypeOf(result).toEqualTypeOf<string>()
  })
})
