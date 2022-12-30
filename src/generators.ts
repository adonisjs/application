/*
 * @poppinss/scaffold
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname, join } from 'node:path'
import string from './helpers/string.js'
import { StringBuilder } from './helpers/string_builder.js'

/**
 * Generators used for scaffolding
 */
const generators = {
  /**
   * Creates the entity path and name from the user
   * input.
   */
  createEntity(entityName: string) {
    /**
     * Get rid of extensions
     */
    entityName = entityName.replace(new RegExp(`${extname(entityName)}$`), '')

    /**
     * Split to see if we are dealing with a path
     */
    const parts = entityName.split('/')

    /**
     * Last part is always the entity name
     */
    const [name] = parts.splice(-1)

    /**
     * Still have parts? Join them back
     */
    if (parts.length) {
      return {
        path: parts.join('/'),
        name,
      }
    }

    /**
     * Use relative current dir
     */
    return {
      path: './',
      name,
    }
  },

  /**
   * Construct paths to make an import path
   */
  importPath(...paths: string[]) {
    return join(...paths)
  },

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
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to model file name
   */
  modelFileName(entityName: string) {
    return new StringBuilder(this.modelName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a controller name
   */
  controllerName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('controller')
      .plural()
      .pascalCase()
      .suffix('Controller')
      .toString()
  },

  /**
   * Converts an entity name to a controller file name
   */
  controllerFileName(entityName: string) {
    return new StringBuilder(this.controllerName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to an event name
   */
  eventName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('event')
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to an event file name
   */
  eventFileName(entityName: string) {
    return new StringBuilder(this.eventName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to listener name
   */
  listenerName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('listener')
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to listener file name
   */
  listenerFileName(entityName: string) {
    return new StringBuilder(this.listenerName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to middleware name
   */
  middlewareName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('middleware')
      .pascalCase()
      .suffix('Middleware')
      .toString()
  },

  /**
   * Converts an entity name to middleware file name
   */
  middlewareFileName(entityName: string) {
    return new StringBuilder(this.middlewareName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to provider name
   */
  providerName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('provider')
      .singular()
      .pascalCase()
      .suffix('Provider')
      .toString()
  },

  /**
   * Converts an entity name to provider file name
   */
  providerFileName(entityName: string) {
    return new StringBuilder(this.providerName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to policy name
   */
  policyName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('policy')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Policy')
      .toString()
  },

  /**
   * Converts an entity name to policy file name
   */
  policyFileName(entityName: string) {
    return new StringBuilder(this.policyName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to factory name
   */
  factoryName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('factory')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Factory')
      .toString()
  },

  /**
   * Converts an entity name to factory file name
   */
  factoryFileName(entityName: string) {
    return new StringBuilder(this.factoryName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to service name
   */
  serviceName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('service')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Service')
      .toString()
  },

  /**
   * Converts an entity name to service file name
   */
  serviceFileName(entityName: string) {
    return new StringBuilder(this.serviceName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to seeder name
   */
  seederName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('seeder')
      .removeSuffix('model')
      .singular()
      .pascalCase()
      .suffix('Seeder')
      .toString()
  },

  /**
   * Converts an entity name to seeder file name
   */
  seederFileName(entityName: string) {
    return new StringBuilder(this.seederName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to command name
   */
  commandName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('command')
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to command file name
   */
  commandFileName(entityName: string) {
    return new StringBuilder(this.commandName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to validator name
   */
  validatorName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('validator')
      .singular()
      .pascalCase()
      .suffix('Validator')
      .toString()
  },

  /**
   * Converts an entity name to validator file name
   */
  validatorFileName(entityName: string) {
    return new StringBuilder(this.validatorName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to exception name
   */
  exceptionName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('exception')
      .pascalCase()
      .suffix('Exception')
      .toString()
  },

  /**
   * Converts an entity name to exception file name
   */
  exceptionFileName(entityName: string) {
    return new StringBuilder(this.exceptionName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to mailer name
   */
  mailerName(entityName: string, type: 'notification' | 'provision' = 'notification') {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('notification')
      .removeSuffix('provision')
      .removeSuffix('mailer')
      .pascalCase()
      .suffix(string.pascalCase(type))
      .toString()
  },

  /**
   * Converts an entity name to mailer file name
   */
  mailerFileName(entityName: string, type: 'notification' | 'provision' = 'notification') {
    return new StringBuilder(this.mailerName(entityName, type)).snakeCase().ext('.ts').toString()
  },
}

export default generators
