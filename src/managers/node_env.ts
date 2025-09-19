/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Aliases for test environments that get normalized to 'test'
 */
const TEST_ENVS = ['test', 'testing']

/**
 * Aliases for production environments that get normalized to 'production'
 */
const PROD_ENVS = ['prod', 'production']

/**
 * Aliases for development environments that get normalized to 'development'
 */
const DEV_ENVS = ['dev', 'develop', 'development']

/**
 * NodeEnvManager is used to extract a normalized node environment by
 * inspecting the "process.env.NODE_ENV".
 *
 * - The "test" and "testing" envs are normalized to "test"
 * - The "prod" and "production" envs are normalized to "production"
 * - The "dev", "develop", and "development" envs are normalized to "development"
 * - Unknown or invalid environments remain as-is
 *
 * @example
 * const manager = new NodeEnvManager()
 * manager.process()
 * console.log(manager.nodeEnvironment) // 'development', 'production', 'test', or custom
 */
export class NodeEnvManager {
  /**
   * The normalized node environment value. Defaults to 'unknown' until process() is called.
   *
   * @type {'unknown' | 'development' | 'production' | 'test' | string}
   * @default 'unknown'
   */
  nodeEnvironment: 'unknown' | 'development' | 'production' | 'test' | string = 'unknown'

  /**
   * Normalizes the NODE_ENV value to standard environment names.
   *
   * @private
   * @param {string} [env] - The environment string to normalize
   * @returns {string} The normalized environment string
   */
  #normalizeNodeEnv(env?: string) {
    if (!env || typeof env !== 'string') {
      return 'unknown'
    }

    env = env.toLowerCase()
    if (DEV_ENVS.includes(env)) {
      return 'development'
    }

    if (PROD_ENVS.includes(env)) {
      return 'production'
    }

    if (TEST_ENVS.includes(env)) {
      return 'test'
    }

    return env
  }

  /**
   * Captures and normalizes the current NODE_ENV value from process.env.
   * Sets the nodeEnvironment property with the normalized value.
   */
  process() {
    this.nodeEnvironment = this.#normalizeNodeEnv(process.env.NODE_ENV)
  }
}
