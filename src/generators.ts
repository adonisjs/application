/*
 * @poppinss/scaffold
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import string from './helpers/string.js'
import { StringBuilder } from './helpers/string_builder.js'

/**
 * Generators used for scaffolding
 */
const generators = {
  /**
   * Converts an entity name to database table name
   */
  tableName(entityName: string) {
    return new StringBuilder(
      this.modelName(new StringBuilder(entityName).removeSuffix('table').toString())
    )
      .plural()
      .snakeCase()
      .toString()
  },

  /**
   * Converts an entity name to model name
   */
  modelName(entityName: string) {
    return new StringBuilder(entityName).removeSuffix('model').singular().pascalCase().toString()
  },

  /**
   * Converts an entity name to model path
   */
  modelFilePath(entityName: string) {
    return new StringBuilder(
      this.modelName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to a controller name
   */
  controllerName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('controller')
      .plural()
      .pascalCase()
      .suffix('Controller')
      .toString()
  },

  /**
   * Converts an entity name to a controller path
   */
  controllerPath(entityName: string) {
    return new StringBuilder(
      this.controllerName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to an event name
   */
  eventName(entityName: string) {
    return new StringBuilder(entityName).removeSuffix('event').pascalCase().toString()
  },

  /**
   * Converts an entity name to an event path
   */
  eventPath(entityName: string) {
    return new StringBuilder(
      this.eventName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to listener name
   */
  listenerName(entityName: string) {
    return new StringBuilder(entityName).removeSuffix('listener').pascalCase().toString()
  },

  /**
   * Converts an entity name to listener path
   */
  listenerPath(entityName: string) {
    return new StringBuilder(
      this.listenerName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to middleware name
   */
  middlewareName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('middleware')
      .pascalCase()
      .suffix('Middleware')
      .toString()
  },

  /**
   * Converts an entity name to middleware path
   */
  middlewarePath(entityName: string) {
    return new StringBuilder(
      this.middlewareName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to provider name
   */
  providerName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('provider')
      .singular()
      .pascalCase()
      .suffix('Provider')
      .toString()
  },

  /**
   * Converts an entity name to provider path
   */
  providerPath(entityName: string) {
    return new StringBuilder(
      this.providerName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to policy name
   */
  policyName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('policy')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Policy')
      .toString()
  },

  /**
   * Converts an entity name to policy path
   */
  policyPath(entityName: string) {
    return new StringBuilder(
      this.policyName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to factory name
   */
  factoryName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('factory')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Factory')
      .toString()
  },

  /**
   * Converts an entity name to factory path
   */
  factoryPath(entityName: string) {
    return new StringBuilder(
      this.factoryName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to service name
   */
  serviceName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('service')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Service')
      .toString()
  },

  /**
   * Converts an entity name to service path
   */
  servicePath(entityName: string) {
    return new StringBuilder(
      this.serviceName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to seeder name
   */
  seederName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('seeder')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Seeder')
      .toString()
  },

  /**
   * Converts an entity name to seeder path
   */
  seederPath(entityName: string) {
    return new StringBuilder(
      this.seederName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to command name
   */
  commandName(entityName: string) {
    return new StringBuilder(entityName).removeSuffix('command').pascalCase().toString()
  },

  /**
   * Converts an entity name to command path
   */
  commandPath(entityName: string) {
    return new StringBuilder(
      this.commandName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to validator name
   */
  validatorName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('validator')
      .singular()
      .pascalCase()
      .suffix('Validator')
      .toString()
  },

  /**
   * Converts an entity name to validator path
   */
  validatorPath(entityName: string) {
    return new StringBuilder(
      this.validatorName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to exception name
   */
  exceptionName(entityName: string) {
    return new StringBuilder(entityName)
      .removeSuffix('exception')
      .pascalCase()
      .suffix('Exception')
      .toString()
  },

  /**
   * Converts an entity name to exception path
   */
  exceptionPath(entityName: string) {
    return new StringBuilder(
      this.exceptionName(new StringBuilder(entityName).removeExtension().toString())
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to mailer name
   */
  mailerName(entityName: string, type: 'notification' | 'provision' = 'notification') {
    return new StringBuilder(entityName)
      .removeSuffix('notification')
      .removeSuffix('provision')
      .removeSuffix('mailer')
      .pascalCase()
      .suffix(string.pascalCase(type))
      .toString()
  },

  /**
   * Converts an entity name to mailer path
   */
  mailerPath(entityName: string, type: 'notification' | 'provision' = 'notification') {
    return new StringBuilder(
      this.mailerName(new StringBuilder(entityName).removeExtension().toString(), type)
    )
      .snakeCase()
      .ext('.ts')
      .toString()
  },
}

export default generators
