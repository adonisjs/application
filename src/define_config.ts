/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { RcFileInput } from './types.ts'

/**
 * Define RC file configuration for an AdonisJS application.
 * This function provides type safety and IntelliSense support for RC file configuration
 * without any runtime behavior changes - it's a passthrough function.
 *
 * @param config - The RC file configuration object
 * @returns The same configuration object with enhanced type information
 *
 * @example
 * export default defineConfig({
 *   typescript: true,
 *   directories: {
 *     config: 'config',
 *     controllers: 'app/controllers'
 *   },
 *   providers: [
 *     () => import('@adonisjs/core/providers/app_provider')
 *   ]
 * })
 */
export function defineConfig(config: RcFileInput): RcFileInput {
  return config
}
