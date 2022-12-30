/*
 * @adonisjs/app
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { dedent } from 'ts-dedent'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { remove, outputFile } from 'fs-extra'

import { Application } from '../../index.js'
import { StubsManager } from '../../src/stubs/manager.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Stubs Manager | build', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('build stub from a specific source', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')
    await outputFile(
      join(originalSource, 'middleware/middleware.stub'),
      dedent`
    ---
    to: /foo
    ---
    hello world
    `
    )

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const stub = await stubs.build('middleware/middleware.stub', { source: originalSource })
    const { contents } = await stub.prepare({})

    assert.equal(contents, 'hello world')
  })

  test('give priority to publish target if it has the same stub', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')
    await outputFile(
      join(originalSource, 'middleware/middleware.stub'),
      dedent`
    ---
    to: /foo
    ---
    hello world
    `
    )

    await outputFile(
      join(publishTarget, 'middleware/middleware.stub'),
      dedent`
    ---
    to: /foo
    ---
    hi world
    `
    )

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const stub = await stubs.build('middleware/middleware.stub', { source: originalSource })
    const { contents } = await stub.prepare({})

    assert.equal(contents, 'hi world')
  })

  test('error when unable to locate the stub', async ({ assert }) => {
    assert.plan(2)

    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)

    try {
      await stubs.build('middleware/middleware.stub', { source: originalSource })
    } catch (error) {
      assert.equal(error.message, 'Unable to find stub "middleware/middleware.stub"')
      assert.deepEqual(error.cause.split('\n'), [
        'Scanned locations: ',
        publishTarget,
        originalSource,
      ])
    }
  })

  test('read only from publish target when no explicit source is defined', async ({ assert }) => {
    assert.plan(2)

    const publishTarget = join(BASE_PATH, 'custom/stubs')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)

    try {
      await stubs.build('middleware/middleware.stub')
    } catch (error) {
      assert.equal(error.message, 'Unable to find stub "middleware/middleware.stub"')
      assert.deepEqual(error.cause.split('\n'), ['Scanned locations: ', publishTarget])
    }
  })

  test('build stub from a package', async ({ assert, cleanup }) => {
    const pkgPath = join(BASE_PATH, '../../../node_modules/@dummy/core')
    cleanup(async () => {
      await remove(pkgPath)
    })

    const publishTarget = join(BASE_PATH, 'custom/stubs')
    await outputFile(
      join(pkgPath, 'package.json'),
      JSON.stringify({
        name: '@dummy/core',
        exports: {
          './package.json': './package.json',
        },
      })
    )

    await outputFile(
      join(pkgPath, 'stubs/middleware/middleware.stub'),
      dedent`
    ---
    to: /foo
    ---
    hello world
    `
    )

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const stub = await stubs.build('middleware/middleware.stub', { pkg: '@dummy/core' })
    const { contents } = await stub.prepare({})

    assert.equal(contents, 'hello world')
  })

  test('give priority to publish target over package', async ({ assert, cleanup }) => {
    const pkgPath = join(BASE_PATH, '../../../node_modules/@dummy/core')
    cleanup(async () => {
      await remove(pkgPath)
    })

    const publishTarget = join(BASE_PATH, 'custom/stubs')
    await outputFile(
      join(pkgPath, 'package.json'),
      JSON.stringify({
        name: '@dummy/core',
        exports: {
          './package.json': './package.json',
        },
      })
    )

    await outputFile(
      join(pkgPath, 'stubs/middleware/middleware.stub'),
      dedent`
    ---
    to: /foo
    ---
    hello world
    `
    )

    await outputFile(
      join(publishTarget, 'middleware/middleware.stub'),
      dedent`
    ---
    to: /foo
    ---
    hi world
    `
    )

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const stub = await stubs.build('middleware/middleware.stub', { pkg: '@dummy/core' })
    const { contents } = await stub.prepare({})

    assert.equal(contents, 'hi world')
  })

  test('error when unable to locate package', async ({ assert }) => {
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    await assert.rejects(
      () => stubs.build('middleware/middleware.stub', { pkg: '@dummy/core' }),
      'Cannot resolve stubs from package "@dummy/core". Make sure the package exports the "package.json" file via exports map'
    )
  })
})

test.group('Stubs Manager | copy', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('copy a specific file from source to publish target', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    await outputFile(join(originalSource, 'middleware/middleware.stub'), 'hello middleware')
    await outputFile(join(originalSource, 'controller/controller.stub'), 'hello controller')
    await outputFile(join(originalSource, 'config/app.stub'), 'hello config')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const files = await stubs.copy('middleware/middleware.stub', { source: originalSource })

    assert.lengthOf(files, 1)
    assert.deepEqual(files, [join(publishTarget, 'middleware/middleware.stub')])

    assert.equal(await readFile(files[0]), 'hello middleware')
  })

  test('copy all files from the directory to the publish target', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    await outputFile(join(originalSource, 'make/middleware/middleware.stub'), 'hello middleware')
    await outputFile(join(originalSource, 'make/controller/controller.stub'), 'hello controller')
    await outputFile(join(originalSource, 'config/app.stub'), 'hello config')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const files = await stubs.copy('make', { source: originalSource })

    assert.lengthOf(files, 2)
    assert.equal(await readFile(files[0]), 'hello controller')
    assert.equal(await readFile(files[1]), 'hello middleware')
  })

  test('do not overwrite existing stubs', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    await outputFile(join(publishTarget, 'make/middleware/middleware.stub'), 'hi middleware')

    await outputFile(join(originalSource, 'make/middleware/middleware.stub'), 'hello middleware')
    await outputFile(join(originalSource, 'make/controller/controller.stub'), 'hello controller')
    await outputFile(join(originalSource, 'config/app.stub'), 'hello config')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const files = await stubs.copy('make', { source: originalSource })

    assert.lengthOf(files, 2)
    assert.equal(await readFile(files[0]), 'hello controller')
    assert.equal(await readFile(files[1]), 'hi middleware')
  })

  test('overwrite existing stubs when overwrite is set to true', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    await outputFile(join(publishTarget, 'middleware/middleware.stub'), 'hi middleware')

    await outputFile(join(originalSource, 'make/middleware/middleware.stub'), 'hello middleware')
    await outputFile(join(originalSource, 'make/controller/controller.stub'), 'hello controller')
    await outputFile(join(originalSource, 'config/app.stub'), 'hello config')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const files = await stubs.copy('make', { source: originalSource, overwrite: true })

    assert.lengthOf(files, 2)
    assert.equal(await readFile(files[0]), 'hello controller')
    assert.equal(await readFile(files[1]), 'hello middleware')
  })

  test('copy only .stub files', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    await outputFile(
      join(originalSource, 'make/middleware/data.json'),
      JSON.stringify({
        foo: 'bar',
      })
    )
    await outputFile(join(originalSource, 'make/middleware/middleware.stub'), 'hello middleware')
    await outputFile(join(originalSource, 'make/controller/controller.stub'), 'hello controller')
    await outputFile(join(originalSource, 'config/app.stub'), 'hello config')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const files = await stubs.copy('make', { source: originalSource })

    assert.lengthOf(files, 2)
    assert.equal(await readFile(files[0]), 'hello controller')
    assert.equal(await readFile(files[1]), 'hello middleware')
  })

  test('raise error when source is missing', async ({ assert }) => {
    const originalSource = join(BASE_PATH, 'source/stubs')
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    await assert.rejects(async () => {
      await stubs.copy('make', { source: originalSource })
    }, /ENOENT\: no such file or directory/)
  })

  test('copy a specific file from package source to publish target', async ({
    assert,
    cleanup,
  }) => {
    const pkgPath = join(BASE_PATH, '../../../node_modules/@dummy/db')
    cleanup(async () => {
      await remove(pkgPath)
    })
    const publishTarget = join(BASE_PATH, 'custom/stubs')

    await outputFile(
      join(pkgPath, 'package.json'),
      JSON.stringify({
        name: '@dummy/db',
        exports: {
          './package.json': './package.json',
        },
      })
    )

    await outputFile(join(pkgPath, 'stubs/middleware/middleware.stub'), 'hello middleware')
    await outputFile(join(pkgPath, 'stubs/controller/controller.stub'), 'hello controller')
    await outputFile(join(pkgPath, 'stubs/config/app.stub'), 'hello config')

    const app = new Application(BASE_URL, { environment: 'web' })
    await app.init()

    const stubs = new StubsManager(app, publishTarget)
    const files = await stubs.copy('middleware/middleware.stub', { pkg: '@dummy/db' })

    assert.lengthOf(files, 1)
    assert.deepEqual(files, [join(publishTarget, 'middleware/middleware.stub')])

    assert.equal(await readFile(files[0]), 'hello middleware')
  })
})
