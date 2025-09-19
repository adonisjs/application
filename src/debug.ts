/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debuglog } from 'node:util'

/**
 * Debug logger instance configured for AdonisJS application debugging.
 * Uses Node.js built-in debuglog with the 'adonisjs:app' namespace.
 *
 * Enable debug output by setting NODE_DEBUG=adonisjs:app environment variable.
 *
 * @example
 * debug('Application state changed to: %s', newState)
 */
export default debuglog('adonisjs:app')
