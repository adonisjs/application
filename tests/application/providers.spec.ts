/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { outputFile, remove } from 'fs-extra'
import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application | providers', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('resolve and register providers', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              isBooted: false
            }
          })
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=1',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    assert.deepEqual(await app.container.make('route'), {
      isBooted: false,
    })
  })

  test('do not resolve providers outside of the current environment', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: () => {},
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=2',
          environment: ['console'],
        },
      ],
    })

    await app.init()
    await app.boot()
    assert.isFalse(app.container.hasBinding('route'))
  })

  test('do not resolve providers outside in unknown environment', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'unknown',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=2',
          environment: ['console'],
        },
      ],
    })

    await app.init()
    await app.boot()
    assert.isFalse(app.container.hasBinding('route'))
  })

  test('switch environment before importing providers', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'console',
      importer: () => {},
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=2',
          environment: ['console'],
        },
      ],
    })

    await app.init()
    app.setEnvironment('web')
    await app.boot()
    assert.isFalse(app.container.hasBinding('route'))
  })

  test('fail when provider module is missing', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=3',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await assert.rejects(() => app.boot(), /Cannot find module/)
  })

  test('fail when provider does not have a default export', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export class RouteProvider {
        constructor(private state) {}

        register() {
          this.state.registered.push('RouteProvider')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=4',
          environment: ['web'],
        },
      ],
    })

    await app.init()

    await assert.rejects(
      () => app.boot(),
      'Missing "export default" in module "./route_provider.js?v=4"'
    )
  })

  test('fail when default export is not a class', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      const RouteProvider = {
        register() {
          this.state.registered.push('RouteProvider')
        }
      }

      export default RouteProvider
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=5',
          environment: ['web'],
        },
      ],
    })

    await app.init()

    await assert.rejects(
      () => app.boot(),
      'Default export from module "./route_provider.js?v=5" is not a class'
    )
  })

  test('boot providers', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              isBooted: false
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.isBooted = true
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=6',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    assert.deepEqual(await app.container.make('route'), {
      isBooted: true,
    })
  })

  test('invoke booted hooks after the app has been booted', async ({ assert }) => {
    const stack: any[] = []

    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: ['./route_provider.js?v=7'],
    })

    app.booted((__app) => {
      stack.push(__app)
    })

    await app.init()
    await app.boot()
    assert.equal(app.getState(), 'booted')
    assert.isTrue(app.isBooted)
    assert.isFalse(app.isReady)
    assert.isFalse(app.isTerminated)
    assert.deepEqual(app, stack[0])
  })

  test('invoke booted hook immediately when the app is already been booted', async ({ assert }) => {
    const stack: any[] = []

    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: ['./route_provider.js?v=8'],
    })

    await app.init()
    await app.boot()
    app.booted((__app) => {
      stack.push(__app)
    })

    assert.deepEqual(app, stack[0])
  })

  test('call start and ready methods on providers', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=9',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(async () => {
      const route = await app.container.make('route')
      route.stack.push('starting')
    })

    assert.deepEqual(await app.container.make('route'), {
      stack: ['booted', 'setup start', 'starting', 'ready'],
    })
  })

  test('invoke ready hooks', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=10',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    app.ready(async () => {
      const route = await app.container.make('route')
      route.stack.push('ready hook')
    })
    await app.start(async () => {
      const route = await app.container.make('route')
      route.stack.push('starting')
    })

    assert.deepEqual(await app.container.make('route'), {
      stack: ['booted', 'setup start', 'starting', 'ready', 'ready hook'],
    })
  })

  test('invoke ready hook immediately when the app has been started', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=11',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(async () => {
      const route = await app.container.make('route')
      route.stack.push('starting')
    })
    app.ready(async () => {
      const route = await app.container.make('route')
      route.stack.push('ready hook')
    })

    assert.deepEqual(await app.container.make('route'), {
      stack: ['booted', 'setup start', 'starting', 'ready', 'ready hook'],
    })
  })

  test('invoke shutdown hooks', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }

        async shutdown() {
          const route = await this.app.container.make('route')
          route.stack.push('shutdown')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=12',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(async () => {
      const route = await app.container.make('route')
      route.stack.push('starting')
    })
    await app.terminate()

    assert.deepEqual(await app.container.make('route'), {
      stack: ['booted', 'setup start', 'starting', 'ready', 'shutdown'],
    })
  })

  test('invoke shutdown hooks after the app has been booted', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }

        async shutdown() {
          const route = await this.app.container.make('route')
          route.stack.push('shutdown')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=13',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.terminate()

    assert.deepEqual(await app.container.make('route'), {
      stack: ['booted', 'shutdown'],
    })
  })

  test('do not run shutdown when app was not booted', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }

        async shutdown() {
          const route = await this.app.container.make('route')
          route.stack.push('shutdown')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=14',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.terminate()

    assert.isFalse(app.container.hasBinding('route'))
  })

  test('invoke terminating app hooks', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              stack: []
            }
          })
        }

        async boot() {
          const route = await this.app.container.make('route')
          route.stack.push('booted')
        }

        async start() {
          const route = await this.app.container.make('route')
          route.stack.push('setup start')
        }

        async ready() {
          const route = await this.app.container.make('route')
          route.stack.push('ready')
        }

        async shutdown() {
          const route = await this.app.container.make('route')
          route.stack.push('shutdown')
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=15',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    await app.start(async () => {
      const route = await app.container.make('route')
      route.stack.push('starting')
    })

    app.terminating(async () => {
      const route = await app.container.make('route')
      assert.isTrue(app.isTerminating)
      route.stack.push('terminating')
    })
    await app.terminate()

    assert.deepEqual(await app.container.make('route'), {
      stack: ['booted', 'setup start', 'starting', 'ready', 'terminating', 'shutdown'],
    })

    assert.isTrue(app.isTerminated)
  })

  test('terminate after from initiated state', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          throw new Error('Do not invoke')
        }

        async boot() {
          throw new Error('Do not invoke')
        }

        async start() {
          throw new Error('Do not invoke')
        }

        async ready() {
          throw new Error('Do not invoke')
        }

        async shutdown() {
          throw new Error('Do not invoke')
        }
      }
    `
    )

    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: './route_provider.js?v=16',
          environment: ['web'],
        },
      ],
    })

    await app.init()
    app.terminating(async () => {
      assert.isTrue(app.isTerminating)
      stack.push('terminating')
    })
    await app.terminate()

    assert.deepEqual(stack, ['terminating'])

    assert.isTrue(app.isTerminated)
  })

  test('do not terminate if not initiated', async ({ assert }) => {
    const stack: string[] = []

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.terminating(async () => {
      assert.isTrue(app.isTerminating)
      stack.push('terminating')
    })
    await app.terminate()

    assert.deepEqual(stack, [])
    assert.isFalse(app.isTerminated)
  })

  test('resolve provider using lazy import', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, './route_provider.ts'),
      `
      export default class RouteProvider {
        constructor(private app) {}

        register() {
          this.app.container.singleton('route', () => {
            return {
              isBooted: false
            }
          })
        }
      }
    `
    )

    const app = new Application(BASE_URL, {
      environment: 'web',
      importer: (filePath) => {
        return import(new URL(filePath, BASE_URL).href)
      },
    })

    app.rcContents({
      providers: [
        {
          file: () => import(new URL('./route_provider.js?v=20', BASE_URL).href),
          environment: ['web'],
        },
      ],
    })

    await app.init()
    await app.boot()
    assert.deepEqual(await app.container.make('route'), {
      isBooted: false,
    })
  })
})
