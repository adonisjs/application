/*
 * @adonisjs/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import { Logger } from '@adonisjs/logger'
import { Profiler } from '@adonisjs/profiler'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '../src/Application'

const fs = new Filesystem(join(__dirname, 'app'))

function getApp(rcContents?: any) {
	return new Application(fs.basePath, 'web', rcContents)
}

test.group('Application', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('setup application', (assert) => {
		const app = getApp({})

		assert.equal(app.appName, 'adonis-app')
		assert.isNull(app.adonisVersion)
		assert.equal(app.version!.major, 0)
		assert.equal(app.appRoot, fs.basePath)

		assert.deepEqual(
			app.directoriesMap,
			new Map(
				Object.entries({
					config: 'config',
					public: 'public',
					database: 'database',
					contracts: 'contracts',
					providers: 'providers',
					seeds: 'database/seeders',
					migrations: 'database/migrations',
					resources: 'resources',
					views: 'resources/views',
					start: 'start',
					tmp: 'tmp',
					tests: 'tests',
				})
			)
		)

		assert.deepEqual(app.aliasesMap, new Map(Object.entries({})))
		assert.isTrue(app.inDev)
		assert.isFalse(app.inProduction)
		assert.isFalse(app.isReady)
		assert.isUndefined(app.exceptionHandlerNamespace)
		assert.deepEqual(app.preloads, [])
		assert.equal(app.environment, 'web')

		assert.deepEqual(
			app.namespacesMap,
			new Map(
				Object.entries({
					models: 'App/Models',
					exceptions: 'App/Exceptions',
					middleware: 'App/Middleware',
					validators: 'App/Validators',
					httpControllers: 'App/Controllers/Http',
					eventListeners: 'App/Listeners',
					redisListeners: 'App/Listeners',
				})
			)
		)

		/**
		 * Env vars
		 */
		assert.equal(process.env.APP_NAME, 'adonis-app')
		assert.equal(process.env.APP_VERSION, '0.0.0')
		assert.isUndefined(process.env.ADONIS_VERSION)

		/**
		 * Container globals
		 */
		assert.isFunction(global[Symbol.for('ioc.use')])
		assert.isFunction(global[Symbol.for('ioc.make')])
		assert.isFunction(global[Symbol.for('ioc.call')])
	})

	test('resolve the namespace directory from rc file content', (assert) => {
		const app = getApp({
			namespaces: {
				models: 'App/Models',
			},
			aliases: {
				App: './app',
			},
		})

		assert.equal(app.resolveNamespaceDirectory('models'), './app/Models')
		assert.equal(app.resolveNamespaceDirectory('something'), null)
	})

	test('return null when namespace is not registered', (assert) => {
		const app = getApp({
			namespaces: {
				models: 'App/Models',
			},
			aliases: {},
		})

		assert.equal(app.resolveNamespaceDirectory('models'), null)
	})

	test('make paths to pre-configured directories', (assert) => {
		const app = getApp({})

		assert.equal(app.makePath('app'), join(fs.basePath, 'app'))
		assert.equal(app.configPath(), join(fs.basePath, 'config'))
		assert.equal(app.publicPath(), join(fs.basePath, 'public'))
		assert.equal(app.databasePath(), join(fs.basePath, 'database'))
		assert.equal(app.migrationsPath(), join(fs.basePath, 'database/migrations'))
		assert.equal(app.seedsPath(), join(fs.basePath, 'database/seeders'))
		assert.equal(app.resourcesPath(), join(fs.basePath, 'resources'))
		assert.equal(app.viewsPath(), join(fs.basePath, 'resources/views'))
		assert.equal(app.startPath('app'), join(fs.basePath, 'start/app'))
		assert.equal(app.testsPath('unit'), join(fs.basePath, 'tests/unit'))
		assert.equal(app.providersPath('AppProvider'), join(fs.basePath, 'providers/AppProvider'))
	})

	test('pull name and version from package.json file', async (assert) => {
		await fs.add(
			'package.json',
			JSON.stringify({
				name: 'dummy-app',
				version: '1.0.0',
			})
		)

		const app = getApp({})
		assert.equal(app.appName, 'dummy-app')
		assert.equal(app.version!.major, 1)
	})

	test('pull adonis version from "@adonisjs/core" package.json file', async (assert) => {
		await fs.add(
			'node_modules/@adonisjs/core/package.json',
			JSON.stringify({
				name: '@adonisjs/core',
				version: '5.0.0',
			})
		)

		const app = getApp({})
		assert.equal(app.adonisVersion!.major, 5)
	})

	test('parse prereleases', async (assert) => {
		await fs.add(
			'node_modules/@adonisjs/core/package.json',
			JSON.stringify({
				name: '@adonisjs/core',
				version: '5.0.0-preview-rc-1.12',
			})
		)

		const app = getApp({})
		assert.equal(app.adonisVersion!.toString(), '5.0.0-preview-rc-1.12')
	})

	test('switch enviroment at a later stage', async (assert) => {
		const app = getApp({})
		app.switchEnvironment('repl')
		assert.equal(app.environment, 'repl')
	})

	test('do not allow switching enviroment after setup has been called', async (assert) => {
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		const fn = () => app.switchEnvironment('repl')
		assert.throw(fn, 'Cannot switch application environment in "setup" state')
	})
})

test.group('Application | setup', (group) => {
	group.afterEach(async () => {
		delete process.env.ENV_APP_NAME
		delete process.env.NODE_ENV
		delete process.env.ENV_SILENT
		delete process.env.ENV_PATH
		await fs.cleanup()
	})

	test('register aliases', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({
			aliases: {
				App: './app',
			},
		})

		await app.setup()
		assert.deepEqual(app.container.directoryAliases, {
			App: join(fs.basePath, './app'),
		})
	})

	test('load environment variables during setup', async (assert) => {
		await fs.add('.env', 'ENV_APP_NAME=adonisjs')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(process.env.ENV_APP_NAME, 'adonisjs')
	})

	test('run environment variables validations', async (assert) => {
		await fs.add('.env', 'ENV_APP_NAME=foo')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))
		await fs.add(
			'env.ts',
			`
			const Env = global[Symbol.for('ioc.use')]('Adonis/Core/Env')
			Env.rules({
				ENV_APP_NAME: Env.schema.enum(['adonisjs', 'adonis'])
			})
		`
		)

		const app = getApp({})
		try {
			await app.setup()
			assert.fail('unreachable')
		} catch (err) {
			assert.equal(
				err.message,
				'E_INVALID_ENV_VALUE: Value for environment variable "ENV_APP_NAME" must be one of "adonisjs,adonis", instead received "foo"'
			)
		}
	})

	test('do no t raise error when .env file is missing', async () => {
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))
		const app = getApp({})
		await app.setup()
	})

	test('load env file from a different location', async (assert) => {
		process.env.ENV_PATH = './foo/.env'
		await fs.add('foo/.env', 'ENV_APP_NAME=adonisjs')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(process.env.ENV_APP_NAME, 'adonisjs')
	})

	test('normalize NODE_ENV "dev"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=dev')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'development')
	})

	test('normalize NODE_ENV "DEVELOPMENT"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=DEVELOPMENT')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'development')
	})

	test('normalize NODE_ENV "stage"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=stage')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'staging')
	})

	test('normalize NODE_ENV "STAGING"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=STAGING')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'staging')
	})

	test('normalize NODE_ENV "prod"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=prod')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'production')
	})

	test('normalize NODE_ENV "PRODUCTION"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=PRODUCTION')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'production')
	})

	test('normalize NODE_ENV "test"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=test')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'testing')
	})

	test('normalize NODE_ENV "TESTING"', async (assert) => {
		await fs.add('.env', 'NODE_ENV=TESTING')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({})
		await app.setup()

		assert.equal(app.nodeEnvironment, 'testing')
	})

	test('load config files from the config directory', async (assert) => {
		await fs.add('.env', '')
		await fs.add(
			'config/app.ts',
			`export const logger = {
			name: 'foobar'
		}`
		)

		const app = getApp({})
		await app.setup()

		const Config = app.container.use('Adonis/Core/Config')
		assert.equal(Config.get('app.logger.name'), 'foobar')
	})

	test('setup profiler and logger', async (assert) => {
		await fs.add('.env', '')
		await fs.add(
			'config/app.ts',
			`export const logger = {
			name: 'foobar'
		}`
		)

		const app = getApp({})
		await app.setup()

		assert.instanceOf(app.container.use('Adonis/Core/Logger'), Logger)
		assert.instanceOf(app.container.use('Adonis/Core/Profiler'), Profiler)
	})
})

test.group('Application | registerProviders', (group) => {
	group.afterEach(async () => {
		delete process.env.ENV_APP_NAME
		delete process.env.ENV_SILENT
		delete process.env.ENV_PATH
		await fs.cleanup()
	})

	test('register providers mentioned inside .adonisrc.json file', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public register() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		await fs.add(
			'providers/AceProvider.ts',
			`
			export default class AceProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public register() {
					this.application.container.bind('Ace/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = getApp({
			providers: ['./providers/AppProvider'],
			aceProviders: ['./providers/AceProvider'],
		})

		await app.setup()
		app.registerProviders()

		assert.equal(app.container.use('App/Foo'), 'foo')
		assert.isFalse(app.container.hasBinding('Ace/Foo'))
	})

	test('register ace providers when environment is console', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public register() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		await fs.add(
			'providers/AceProvider.ts',
			`
			export default class AceProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public register() {
					this.application.container.bind('Ace/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = new Application(fs.basePath, 'console', {
			providers: ['./providers/AppProvider'],
			aceProviders: ['./providers/AceProvider'],
		})

		await app.setup()
		app.registerProviders()

		assert.equal(app.container.use('App/Foo'), 'foo')
		assert.equal(app.container.use('Ace/Foo'), 'foo')
	})

	test('register providers exported by the provider', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public register() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}

				public provides = ['./MainProvider']
			}
		`
		)

		await fs.add(
			'providers/MainProvider.ts',
			`
			export default class MainProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public register() {
					this.application.container.bind('Main/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = getApp({
			providers: ['./providers/AppProvider'],
		})

		await app.setup()
		app.registerProviders()

		assert.equal(app.container.use('App/Foo'), 'foo')
		assert.equal(app.container.use('Main/Foo'), 'foo')
	})
})

test.group('Application | bootProviders', (group) => {
	group.afterEach(async () => {
		delete process.env.ENV_APP_NAME
		delete process.env.ENV_SILENT
		delete process.env.ENV_PATH
		await fs.cleanup()
	})

	test('boot providers', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public async boot() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}

				public provides = ['./MainProvider']
			}
		`
		)

		await fs.add(
			'providers/MainProvider.ts',
			`
			export default class MainProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public async boot() {
					this.application.container.bind('Main/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = getApp({
			providers: ['./providers/AppProvider'],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()

		assert.equal(app.container.use('App/Foo'), 'foo')
		assert.equal(app.container.use('Main/Foo'), 'foo')
	})

	test('boot ace providers when environment is console', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public async boot() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		await fs.add(
			'providers/AceProvider.ts',
			`
			export default class AceProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public async boot() {
					this.application.container.bind('Ace/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = new Application(fs.basePath, 'console', {
			providers: ['./providers/AppProvider'],
			aceProviders: ['./providers/AceProvider'],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()

		assert.equal(app.container.use('App/Foo'), 'foo')
		assert.equal(app.container.use('Ace/Foo'), 'foo')
	})
})

test.group('Application | requirePreloads', (group) => {
	group.afterEach(async () => {
		delete process.env.ENV_APP_NAME
		delete process.env.ENV_SILENT
		delete process.env.ENV_PATH
		await fs.cleanup()
	})

	test('require files registered for preloading', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'start/foo.ts',
			`
			global[Symbol.for('ioc.use')]('Adonis/Core/Application').container.bind('Start/Foo', () => {
				return 'foo'
			})
		`
		)

		const app = getApp({
			preloads: ['./start/foo'],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()
		await app.requirePreloads()

		assert.equal(app.container.use('Start/Foo'), 'foo')
	})

	test('do not require file when environment is different', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'start/foo.ts',
			`
			global[Symbol.for('ioc.use')]('Adonis/Core/Application').container.bind('Start/Foo', () => {
				return 'foo'
			})
		`
		)

		const app = getApp({
			preloads: [
				{
					file: './start/foo',
					environment: 'console',
				},
			],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()
		await app.requirePreloads()

		assert.isFalse(app.container.hasBinding('Start/Foo'))
	})

	test('require file when explicitly defined environment matches the current environment', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'start/foo.ts',
			`
			global[Symbol.for('ioc.use')]('Adonis/Core/Application').container.bind('Start/Foo', () => {
				return 'foo'
			})
		`
		)

		const app = getApp({
			preloads: [
				{
					file: './start/foo',
					environment: 'web',
				},
			],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()
		await app.requirePreloads()

		assert.equal(app.container.use('Start/Foo'), 'foo')
	})

	test('ignore error when marked as optional and is missing', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({
			preloads: [
				{
					file: './start/foo',
					environment: 'web',
					optional: true,
				},
			],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()
		await app.requirePreloads()

		assert.isFalse(app.container.hasBinding('Start/Foo'))
	})

	test('raise error when not marked as optional and is missing', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		const app = getApp({
			preloads: [
				{
					file: './start/foo',
					environment: 'web',
					optional: false,
				},
			],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()

		try {
			await app.requirePreloads()
			assert.fail('unreachable')
		} catch (err) {
			assert.strictEqual(
				err.message,
				`ENOENT: no such file or directory, open '${join(fs.basePath, 'start/foo.ts')}'`
			)
		}
	})

	test('raise error when file has errors other then ENOENT', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'start/foo.ts',
			`
			global['ioc.use']('Adonis/Core/Application').container.bind('Start/Foo', () => {
				return 'foo'
			})
		`
		)

		const app = getApp({
			preloads: [
				{
					file: './start/foo',
					environment: 'web',
					optional: true,
				},
			],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()

		try {
			await app.requirePreloads()
			assert.fail('unreachable')
		} catch (err) {
			assert.strictEqual(err.message, `global.ioc.use is not a function`)
		}
	})
})

test.group('Application | start', (group) => {
	group.afterEach(async () => {
		delete process.env.ENV_APP_NAME
		delete process.env.ENV_SILENT
		delete process.env.ENV_PATH
		await fs.cleanup()
	})

	test('execute providers ready hook', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public async ready() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = getApp({
			providers: ['./providers/AppProvider'],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()
		await app.start()

		assert.equal(app.container.use('App/Foo'), 'foo')
	})
})

test.group('Application | start', (group) => {
	group.afterEach(async () => {
		delete process.env.ENV_APP_NAME
		delete process.env.ENV_SILENT
		delete process.env.ENV_PATH
		await fs.cleanup()
	})

	test('execute providers shutdown hook', async (assert) => {
		await fs.add('.env', '')
		await fs.fsExtra.ensureDir(join(fs.basePath, 'config'))

		await fs.add(
			'providers/AppProvider.ts',
			`
			export default class AppProvider {
				constructor(application) {
					this.application = application
				}

				public static needsApplication = true

				public async shutdown() {
					this.application.container.bind('App/Foo', () => {
						return 'foo'
					})
				}
			}
		`
		)

		const app = getApp({
			providers: ['./providers/AppProvider'],
		})

		await app.setup()
		app.registerProviders()
		await app.bootProviders()
		await app.start()
		await app.shutdown()

		assert.equal(app.container.use('App/Foo'), 'foo')
	})
})
