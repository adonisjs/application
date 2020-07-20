/*
 * @adonisjs/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Ioc } from '@adonisjs/fold'
import { Application } from '../src/Application'
import { join } from 'path'

function getApp() {
	return new Application(__dirname, new Ioc(), {}, {})
}

test.group('Application', () => {
	test('setup application', (assert) => {
		const app = new Application(__dirname, new Ioc(), {}, {})
		assert.equal(app.appName, 'adonis-app')
		assert.isNull(app.adonisVersion)
		assert.equal(app.version!.major, 0)
		assert.equal(app.appRoot, __dirname)

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
		assert.equal(app.exceptionHandlerNamespace, 'App/Exceptions/Handler')
		assert.deepEqual(app.preloads, [])
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
	})

	test('resolve the namespace directory from rc file content', (assert) => {
		const app = new Application(
			__dirname,
			new Ioc(),
			{
				namespaces: {
					models: 'App/Models',
				},
				aliases: {
					App: './app',
				},
			},
			{}
		)

		assert.equal(app.resolveNamespaceDirectory('models'), './app/Models')
		assert.equal(app.resolveNamespaceDirectory('something'), null)
	})

	test('return null when namespace is not registered', (assert) => {
		const app = new Application(
			__dirname,
			new Ioc(),
			{
				namespaces: {
					models: 'App/Models',
				},
				aliases: {},
			},
			{}
		)

		assert.equal(app.resolveNamespaceDirectory('models'), null)
	})

	test('make paths to pre-configured directories', (assert) => {
		const app = new Application(__dirname, new Ioc(), {}, {})

		assert.equal(app.makePath('app'), join(__dirname, 'app'))
		assert.equal(app.configPath(), join(__dirname, 'config'))
		assert.equal(app.publicPath(), join(__dirname, 'public'))
		assert.equal(app.databasePath(), join(__dirname, 'database'))
		assert.equal(app.migrationsPath(), join(__dirname, 'database/migrations'))
		assert.equal(app.seedsPath(), join(__dirname, 'database/seeders'))
		assert.equal(app.resourcesPath(), join(__dirname, 'resources'))
		assert.equal(app.viewsPath(), join(__dirname, 'resources/views'))
		assert.equal(app.startPath('app'), join(__dirname, 'start/app'))
	})

	test('pull name and version from pkgFile contents', (assert) => {
		const app = new Application(
			__dirname,
			new Ioc(),
			{},
			{
				name: 'relay-app',
				version: '1.0.0',
				dependencies: {},
			}
		)

		assert.equal(app.appName, 'relay-app')
		assert.equal(app.version!.major, 1)
	})

	test('pull adonis version from pkgFile contents', (assert) => {
		const app = new Application(
			__dirname,
			new Ioc(),
			{},
			{
				adonisVersion: '5.0.0',
			}
		)

		assert.equal(app.adonisVersion!.major, 5)
	})

	test('parse prereleases', (assert) => {
		const app = new Application(
			__dirname,
			new Ioc(),
			{},
			{
				adonisVersion: '5.0.0-preview.1',
			}
		)

		assert.equal(app.adonisVersion!.toString(), '5.0.0-preview.1')
	})

	test('set inProduction lazily', (assert) => {
		const app = new Application(__dirname, new Ioc(), {}, {})
		assert.isFalse(app.inProduction)

		process.env.NODE_ENV = 'production'
		assert.isTrue(app.inProduction)
		delete process.env.NODE_ENV
	})

	test('return nodeEnvironment as unknown when not defined', (assert) => {
		const app = new Application(__dirname, new Ioc(), {}, {})
		assert.equal(app.nodeEnvironment, 'unknown')

		/**
		 * Once defined, should update itself
		 */
		process.env.NODE_ENV = 'dev'
		assert.equal(app.nodeEnvironment, 'development')

		delete process.env.NODE_ENV
	})

	test('normalize development node environment', (assert) => {
		process.env.NODE_ENV = 'dev'
		assert.equal(getApp().nodeEnvironment, 'development')

		process.env.NODE_ENV = 'develop'
		assert.equal(getApp().nodeEnvironment, 'development')

		process.env.NODE_ENV = 'DEVELOPMENT'
		assert.equal(getApp().nodeEnvironment, 'development')

		delete process.env.NODE_ENV
	})

	test('normalize staging node environment', (assert) => {
		process.env.NODE_ENV = 'stage'
		assert.equal(getApp().nodeEnvironment, 'staging')

		process.env.NODE_ENV = 'STAGING'
		assert.equal(getApp().nodeEnvironment, 'staging')

		delete process.env.NODE_ENV
	})

	test('normalize production node environment', (assert) => {
		process.env.NODE_ENV = 'prod'
		assert.equal(getApp().nodeEnvironment, 'production')

		process.env.NODE_ENV = 'PRODUCTION'
		assert.equal(getApp().nodeEnvironment, 'production')

		delete process.env.NODE_ENV
	})

	test('normalize testing node environment', (assert) => {
		process.env.NODE_ENV = 'test'
		assert.equal(getApp().nodeEnvironment, 'testing')

		process.env.NODE_ENV = 'TESTING'
		assert.equal(getApp().nodeEnvironment, 'testing')

		delete process.env.NODE_ENV
	})
})
