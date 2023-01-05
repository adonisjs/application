/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { DirectoriesNode } from './types.js'

/**
 * List of default directories
 */
export const directories: DirectoriesNode = {
  config: 'config',
  commands: 'commands',
  contracts: 'contracts',
  public: 'public',
  providers: 'providers',
  languageFiles: 'resources/lang',
  migrations: 'database/migrations',
  seeders: 'database/seeders',
  factories: 'database/factories',
  views: 'resources/views',
  start: 'start',
  tmp: 'tmp',
  tests: 'tests',
  httpControllers: 'app/controllers',
  models: 'app/models',
  services: 'app/services',
  exceptions: 'app/exceptions',
  mailers: 'app/mailers',
  middleware: 'app/middleware',
  policies: 'app/policies',
  validators: 'app/validators',
  events: 'app/events',
  listeners: 'app/listeners',
  stubs: 'stubs',
}
