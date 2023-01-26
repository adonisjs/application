/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { dedent } from 'ts-dedent'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { remove, outputFile } from 'fs-extra'

import { Application } from '../../index.js'
import { Stub } from '../../src/stubs/stub.js'
import generators from '../../src/generators.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Stubs', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('prepare resource from stub', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    to: {{ app.middlewarePath(entity.path, middlewareFileName) }}
    ---
    import { HttpContext } from '@adonisjs/core/http'
    import { NextFn } from '@adonisjs/core/types/http'

    export default class {{ middlewareName }} {
      handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        console.log(ctx)

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
      }
    }`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    const { destination, contents, force, attributes } = await stub.prepare({
      entity: generators.createEntity('user'),
    })

    assert.isFalse(force)
    assert.deepEqual(attributes, { to: destination })
    assert.equal(destination, app.middlewarePath('user_middleware.ts'))
    assert.equal(
      contents,
      dedent`import { HttpContext } from '@adonisjs/core/http'
    import { NextFn } from '@adonisjs/core/types/http'

    export default class UserMiddleware {
      handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        console.log(ctx)

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
      }
    }`
    )
  })

  test('fail when "to" attribute is missing', async ({ assert }) => {
    assert.plan(2)

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    ---`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    try {
      await stub.prepare({
        entity: generators.createEntity('user'),
      })
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at anonymous (./make/middleware.stub:0:0)`)
      assert.equal(error.message, 'Missing "to" attribute in stub yaml front matter')
    }
  })

  test('fail when "to" attribute is not an absolute path', async ({ assert }) => {
    assert.plan(2)

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    to: ./foo
    ---`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    try {
      await stub.prepare({
        entity: generators.createEntity('user'),
      })
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at anonymous (./make/middleware.stub:0:0)`)
      assert.equal(error.message, 'The value for "to" attribute must be an absolute file path')
    }
  })

  test('fail when yaml frontmatter is missing', async ({ assert }) => {
    assert.plan(2)

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    try {
      await stub.prepare({
        entity: generators.createEntity('user'),
      })
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at anonymous (./make/middleware.stub:0:0)`)
      assert.equal(error.message, 'Missing "to" attribute in stub yaml front matter')
    }
  })

  test('fail when stub uses an undefined variable', async ({ assert }) => {
    assert.plan(2)

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = middlewareName(entity.name)}}`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    try {
      await stub.prepare({
        entity: generators.createEntity('user'),
      })
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], '    at anonymous (./make/middleware.stub:3:0)')
      assert.equal(error.message, 'middlewareName is not a function')
    }
  })

  test('fail when stub uses a nested undefined variable', async ({ assert }) => {
    assert.plan(2)

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.foo(entity.name)}}`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    try {
      await stub.prepare({
        entity: generators.createEntity('user'),
      })
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], '    at anonymous (./make/middleware.stub:3:0)')
      assert.equal(error.message, 'generators.foo is not a function')
    }
  })

  test('fail when stub uses invalid syntax', async ({ assert }) => {
    assert.plan(2)

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#vr middlewareName = generators.foo(entity.name)}}`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    try {
      await stub.prepare({
        entity: generators.createEntity('user'),
      })
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], '    at anonymous (./make/middleware.stub:0:0)')
      assert.equal(error.message, 'Unknown "vr" block')
    }
  })

  test('generate resource from stub', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    to: {{ app.middlewarePath(entity.path, middlewareFileName) }}
    ---
    import { HttpContext } from '@adonisjs/core/http'
    import { NextFn } from '@adonisjs/core/types/http'

    export default class {{ middlewareName }} {
      handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        console.log(ctx)

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
      }
    }`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    const { status, destination, contents } = await stub.generate({
      entity: generators.createEntity('user'),
    })

    assert.equal(status, 'created')
    assert.equal(await readFile(destination, 'utf-8'), contents)
  })

  test('do not generate resource when it already exists', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    to: {{ app.middlewarePath(entity.path, middlewareFileName) }}
    ---
    import { HttpContext } from '@adonisjs/core/http'
    import { NextFn } from '@adonisjs/core/types/http'

    export default class {{ middlewareName }} {
      handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        console.log(ctx)

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
      }
    }`

    await outputFile(app.middlewarePath('user_middleware.ts'), 'hello world')

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    const { status, destination, skipReason } = await stub.generate({
      entity: generators.createEntity('user'),
    })

    assert.equal(status, 'skipped')
    assert.equal(skipReason, 'File already exists')
    assert.equal(await readFile(destination, 'utf-8'), 'hello world')
  })

  test('overwrite resource when yaml frontmatter forces it', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    to: {{ app.middlewarePath(entity.path, middlewareFileName) }}
    force: true
    ---
    import { HttpContext } from '@adonisjs/core/http'
    import { NextFn } from '@adonisjs/core/types/http'

    export default class {{ middlewareName }} {
      handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        console.log(ctx)

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
      }
    }`

    await outputFile(app.middlewarePath('user_middleware.ts'), 'hello world')

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    const { status, destination, contents } = await stub.generate({
      entity: generators.createEntity('user'),
    })

    assert.equal(status, 'force_created')
    assert.equal(await readFile(destination, 'utf-8'), contents)
  })

  test('do not overwrite when stub state sets force to false', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`{{#var middlewareName = generators.middlewareName(entity.name)}}
    {{#var middlewareFileName = generators.middlewareFileName(entity.name)}}
    ---
    to: {{ app.middlewarePath(entity.path, middlewareFileName) }}
    force: true
    ---
    import { HttpContext } from '@adonisjs/core/http'
    import { NextFn } from '@adonisjs/core/types/http'

    export default class {{ middlewareName }} {
      handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        console.log(ctx)

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
      }
    }`

    await outputFile(app.middlewarePath('user_middleware.ts'), 'hello world')

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    const { status, destination, skipReason } = await stub.generate({
      entity: generators.createEntity('user'),
      force: false,
    })

    assert.equal(status, 'skipped')
    assert.equal(skipReason, 'File already exists')
    assert.equal(await readFile(destination, 'utf-8'), 'hello world')
  })

  test('use string builder in stubs', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })
    await app.init()

    const stubContents = dedent`
    ---
    to: {{ app.middlewarePath(entity.path, string(entity.name).snakeCase().toString()) }}
    ---`

    const stub = new Stub(app, stubContents, './make/middleware.stub')
    const { destination, attributes } = await stub.prepare({
      entity: generators.createEntity('user'),
    })

    assert.deepEqual(attributes, { to: destination })
    assert.equal(destination, app.middlewarePath('user'))
  })
})
