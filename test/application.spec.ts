/*
* @poppinss/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { Ioc } from '@adonisjs/fold'
import { Application } from '../src/Application'
import { join } from 'path'

test.group('Application', () => {
  test('setup application', (assert) => {
    const app = new Application(__dirname, new Ioc(), {}, '1.0.0')
    assert.equal(app.appName, 'adonis-app')
    assert.equal(app.adonisVersion!.major, 1)
    assert.equal(app.version.major, 0)
    assert.equal(app.appRoot, __dirname)

    assert.deepEqual(app.directoriesMap, new Map(Object.entries({
      config: 'config',
      public: 'public',
      database: 'database',
      seeds: 'database/seeds',
      migrations: 'database/migrations',
      resources: 'resources',
      views: 'resources/views',
      start: 'start',
    })))

    assert.deepEqual(app.autoloadsMap, new Map(Object.entries({})))
    assert.isTrue(app.inDev)
    assert.isFalse(app.inProduction)
    assert.isFalse(app.ready)
    assert.equal(app.exceptionHandlerNamespace, 'App/Exceptions/Handler')
    assert.deepEqual(app.preloads, [])
  })

  test('make paths to pre-configured directories', (assert) => {
    const app = new Application(__dirname, new Ioc(), {}, '1.0.0')

    assert.equal(app.makePath('app'), join(__dirname, 'app'))
    assert.equal(app.configPath(), join(__dirname, 'config'))
    assert.equal(app.publicPath(), join(__dirname, 'public'))
    assert.equal(app.databasePath(), join(__dirname, 'database'))
    assert.equal(app.migrationsPath(), join(__dirname, 'database/migrations'))
    assert.equal(app.seedsPath(), join(__dirname, 'database/seeds'))
    assert.equal(app.resourcesPath(), join(__dirname, 'resources'))
    assert.equal(app.viewsPath(), join(__dirname, 'resources/views'))
    assert.equal(app.startPath('app'), join(__dirname, 'start/app'))
  })
})
