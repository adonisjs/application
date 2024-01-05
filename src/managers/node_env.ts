/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Aliases for different environments
 */
const TEST_ENVS = ['test', 'testing']
const PROD_ENVS = ['prod', 'production']
const DEV_ENVS = ['dev', 'develop', 'development']

/**
 * NodeEnvManager is used to extract a normalized node environment by
 * inspect the "process.env.NODE_ENV".
 *
 * - The "test" and "testing" envs are normalized to "test"
 * - The "prod" and "production" envs are normalized to "production"
 * - The "dev", "develop", and "development" envs are normalized to "development"
 */
export class NodeEnvManager {
  nodeEnvironment: 'unknown' | 'development' | 'production' | 'test' | string = 'unknown'

  /**
   * Normalizes node env
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
   * Capture the current node env
   */
  process() {
    this.nodeEnvironment = this.#normalizeNodeEnv(process.env.NODE_ENV)
  }
}
