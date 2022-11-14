/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { LoggerConfig } from '@adonisjs/logger/types'
import { LoggerManager as BaseLoggerManager } from '@adonisjs/logger'

/**
 * Configures the AdonisJS logger with user defined config or with
 * a default logger
 */
export class LoggerManager<KnownLoggers extends Record<string, LoggerConfig>> {
  /**
   * Reference to application logger. The value is defined
   * after the "init" method call
   */
  logger!: BaseLoggerManager<KnownLoggers>

  /**
   * Configures the application logger
   */
  configure(config?: any) {
    this.logger = new BaseLoggerManager(
      config || {
        default: 'app',
        loggers: {
          app: {},
        },
      }
    )
  }
}
