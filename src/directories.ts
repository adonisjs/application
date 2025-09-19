/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { DirectoriesNode } from './types.ts'

/**
 * Default directory structure for AdonisJS applications.
 * These paths are relative to the application root and define
 * the conventional locations for different types of files.
 * 
 * Applications can override these defaults in their adonisrc.js file.
 * 
 * @example
 * // In adonisrc.js
 * export default defineConfig({
 *   directories: {
 *     ...directories,
 *     controllers: 'app/http/controllers' // Custom path
 *   }
 * })
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
  mails: 'app/mails',
  middleware: 'app/middleware',
  policies: 'app/policies',
  validators: 'app/validators',
  events: 'app/events',
  listeners: 'app/listeners',
  transformers: 'app/transformers',
  stubs: 'stubs',
  generatedClient: '.adonisjs/client',
  generatedServer: '.adonisjs/server',
}
