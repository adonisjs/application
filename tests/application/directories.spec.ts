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

import { Application } from '../../src/application.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Application | directories', () => {
  test('generate paths to directories', async ({ assert }) => {
    const app = new Application(BASE_URL, {
      environment: 'web',
    })

    await app.init()

    assert.deepEqual(app.makeURL(), BASE_URL)
    assert.deepEqual(app.makeURL('./foo'), new URL('./foo', BASE_URL))

    assert.equal(app.makePath(), BASE_PATH)
    assert.equal(app.makePath('./foo'), join(BASE_PATH, './foo'))

    assert.equal(app.configPath(), join(BASE_PATH, './config'))
    assert.equal(app.configPath('app.ts'), join(BASE_PATH, './config/app.ts'))

    assert.equal(app.publicPath(), join(BASE_PATH, './public'))
    assert.equal(app.publicPath('app.css'), join(BASE_PATH, './public/app.css'))

    assert.equal(app.commandsPath(), join(BASE_PATH, 'commands'))
    assert.equal(app.commandsPath('welcome.ts'), join(BASE_PATH, 'commands/welcome.ts'))

    assert.equal(app.contractsPath(), join(BASE_PATH, 'contracts'))
    assert.equal(app.contractsPath('auth.ts'), join(BASE_PATH, 'contracts/auth.ts'))

    assert.equal(app.providersPath(), join(BASE_PATH, 'providers'))
    assert.equal(app.providersPath('app.ts'), join(BASE_PATH, 'providers/app.ts'))

    assert.equal(app.languageFilesPath(), join(BASE_PATH, 'resources/lang'))
    assert.equal(
      app.languageFilesPath('en/messages.json'),
      join(BASE_PATH, 'resources/lang/en/messages.json')
    )

    assert.equal(app.migrationsPath(), join(BASE_PATH, 'database/migrations'))
    assert.equal(app.migrationsPath('users.ts'), join(BASE_PATH, 'database/migrations/users.ts'))

    assert.equal(app.seedersPath(), join(BASE_PATH, 'database/seeders'))
    assert.equal(app.seedersPath('users.ts'), join(BASE_PATH, 'database/seeders/users.ts'))

    assert.equal(app.factoriesPath(), join(BASE_PATH, 'database/factories'))
    assert.equal(app.factoriesPath('users.ts'), join(BASE_PATH, 'database/factories/users.ts'))

    assert.equal(app.viewsPath(), join(BASE_PATH, 'resources/views'))
    assert.equal(app.viewsPath('welcome.edge'), join(BASE_PATH, 'resources/views/welcome.edge'))

    assert.equal(app.startPath(), join(BASE_PATH, 'start'))
    assert.equal(app.startPath('routes.ts'), join(BASE_PATH, 'start/routes.ts'))

    assert.equal(app.tmpPath(), join(BASE_PATH, 'tmp'))
    assert.equal(app.tmpPath('app.log'), join(BASE_PATH, 'tmp/app.log'))

    assert.equal(app.testsPath(), join(BASE_PATH, 'tests'))
    assert.equal(app.testsPath('unit/app.ts'), join(BASE_PATH, 'tests/unit/app.ts'))

    assert.equal(app.httpControllersPath(), join(BASE_PATH, 'app/controllers'))
    assert.equal(
      app.httpControllersPath('users_controller.ts'),
      join(BASE_PATH, 'app/controllers/users_controller.ts')
    )

    assert.equal(app.modelsPath(), join(BASE_PATH, 'app/models'))
    assert.equal(app.modelsPath('user.ts'), join(BASE_PATH, 'app/models/user.ts'))

    assert.equal(app.servicesPath(), join(BASE_PATH, 'app/services'))
    assert.equal(app.servicesPath('user.ts'), join(BASE_PATH, 'app/services/user.ts'))

    assert.equal(app.exceptionsPath(), join(BASE_PATH, 'app/exceptions'))
    assert.equal(app.exceptionsPath('handler.ts'), join(BASE_PATH, 'app/exceptions/handler.ts'))

    assert.equal(app.mailersPath(), join(BASE_PATH, 'app/mailers'))
    assert.equal(app.mailersPath('verify_email.ts'), join(BASE_PATH, 'app/mailers/verify_email.ts'))

    assert.equal(app.middlewarePath(), join(BASE_PATH, 'app/middleware'))
    assert.equal(app.middlewarePath('auth.ts'), join(BASE_PATH, 'app/middleware/auth.ts'))

    assert.equal(app.policiesPath(), join(BASE_PATH, 'app/policies'))
    assert.equal(app.policiesPath('user.ts'), join(BASE_PATH, 'app/policies/user.ts'))

    assert.equal(app.validatorsPath(), join(BASE_PATH, 'app/validators'))
    assert.equal(app.validatorsPath('create_user'), join(BASE_PATH, 'app/validators/create_user'))
  })
})
