/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname, join } from 'node:path'
import string from '@poppinss/utils/string'
import StringBuilder from '@poppinss/utils/string_builder'

/**
 * Generators used for scaffolding various AdonisJS entities.
 * Provides utilities for creating standardized names, file names,
 * and paths for models, controllers, middleware, and other framework components.
 */
const generators = {
  /**
   * List of controller names that should always be generated in singular form.
   * These are typically system/admin controllers or special-purpose controllers
   * that don't represent plural resources.
   *
   * @example
   * // These will remain singular:
   * // 'home' -> 'HomeController'
   * // 'admin' -> 'AdminController'
   * // 'auth' -> 'AuthController'
   */
  singularControllerNames: [
    'home',
    'admin',
    'session',
    'application',
    'money',
    'signup',
    'login',
    'auth',
    'authentication',
    'adonis',
    'adonisjs',
    'dashboard',
    'api',
    'about',
    'contact',
    'blog',
    'library',
    'password',
    'password_link',
    'new_password',
    'profile',
    'account',
    'new_account',
    'avatar',
    'forum',
  ],

  /**
   * Creates the entity path and name from user input.
   * Parses the entity name to separate directory path from the actual name,
   * handling file extensions and nested paths.
   *
   * @param entityName - The entity name which may include path and extension
   * @returns Object containing the parsed path and name
   *
   * @example
   * createEntity('admin/users') // { path: 'admin', name: 'users' }
   * createEntity('user.ts') // { path: './', name: 'user' }
   * createEntity('profile') // { path: './', name: 'profile' }
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
   * Constructs a Unix-style import path from given path segments.
   * Ensures consistent path separators regardless of the operating system.
   *
   * @param paths - Path segments to join
   * @returns Unix-style path string
   *
   * @example
   * importPath('app', 'models', 'user') // 'app/models/user'
   */
  importPath(...paths: string[]) {
    return string.toUnixSlash(join(...paths))
  },

  /**
   * Converts an entity name to a database table name.
   * Removes 'table' suffix, converts to model name format,
   * then pluralizes and converts to snake_case.
   *
   * @param entityName - The entity name to convert
   * @returns Database table name in snake_case plural form
   *
   * @example
   * tableName('User') // 'users'
   * tableName('BlogPost') // 'blog_posts'
   * tableName('UserTable') // 'users'
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
   * Converts an entity name to a model class name.
   * Removes file extension and 'model' suffix, singularizes,
   * and converts to PascalCase.
   *
   * @param entityName - The entity name to convert
   * @returns Model class name in PascalCase singular form
   *
   * @example
   * modelName('users') // 'User'
   * modelName('blog-posts') // 'BlogPost'
   * modelName('user.model.ts') // 'User'
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
   * Converts an entity name to a model file name.
   * Uses the model name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Model file name in snake_case with .ts extension
   *
   * @example
   * modelFileName('User') // 'user.ts'
   * modelFileName('BlogPost') // 'blog_post.ts'
   */
  modelFileName(entityName: string) {
    return new StringBuilder(this.modelName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a controller class name.
   * Removes file extension and 'controller' suffix, then applies
   * singularization rules based on special names list or parameter.
   *
   * @param entityName - The entity name to convert
   * @param singular - Force singular form regardless of special names
   * @returns Controller class name in PascalCase with 'Controller' suffix
   *
   * @example
   * controllerName('users') // 'UsersController'
   * controllerName('admin') // 'AdminController' (from singular list)
   * controllerName('posts', true) // 'PostController' (forced singular)
   */
  controllerName(entityName: string, singular: boolean = false) {
    const controller = new StringBuilder(entityName).removeExtension().removeSuffix('controller')

    if (this.singularControllerNames.includes(controller.toString().toLowerCase())) {
      controller.singular()
    } else if (singular) {
      controller.singular()
    } else {
      controller.plural()
    }

    return controller.pascalCase().suffix('Controller').toString()
  },

  /**
   * Converts an entity name to a controller file name.
   * Uses the controller name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @param singular - Force singular form for the controller name
   * @returns Controller file name in snake_case with .ts extension
   *
   * @example
   * controllerFileName('users') // 'users_controller.ts'
   * controllerFileName('admin') // 'admin_controller.ts'
   */
  controllerFileName(entityName: string, singular: boolean = false) {
    return new StringBuilder(this.controllerName(entityName, singular))
      .snakeCase()
      .ext('.ts')
      .toString()
  },

  /**
   * Converts an entity name to an event class name.
   * Removes file extension and 'event' suffix, then converts to PascalCase.
   *
   * @param entityName - The entity name to convert
   * @returns Event class name in PascalCase
   *
   * @example
   * eventName('user-registered') // 'UserRegistered'
   * eventName('order.event.ts') // 'Order'
   */
  eventName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('event')
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to an event file name.
   * Uses the event name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Event file name in snake_case with .ts extension
   *
   * @example
   * eventFileName('UserRegistered') // 'user_registered.ts'
   */
  eventFileName(entityName: string) {
    return new StringBuilder(this.eventName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a listener class name.
   * Removes file extension and 'listener' suffix, then converts to PascalCase.
   *
   * @param entityName - The entity name to convert
   * @returns Listener class name in PascalCase
   *
   * @example
   * listenerName('send-email') // 'SendEmail'
   * listenerName('notification.listener.ts') // 'Notification'
   */
  listenerName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('listener')
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to a listener file name.
   * Uses the listener name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Listener file name in snake_case with .ts extension
   *
   * @example
   * listenerFileName('SendEmail') // 'send_email.ts'
   */
  listenerFileName(entityName: string) {
    return new StringBuilder(this.listenerName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a middleware class name.
   * Removes file extension and 'middleware' suffix, then converts to PascalCase
   * with 'Middleware' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Middleware class name in PascalCase with 'Middleware' suffix
   *
   * @example
   * middlewareName('auth') // 'AuthMiddleware'
   * middlewareName('cors.middleware.ts') // 'CorsMiddleware'
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
   * Converts an entity name to a middleware file name.
   * Uses the middleware name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Middleware file name in snake_case with .ts extension
   *
   * @example
   * middlewareFileName('Auth') // 'auth_middleware.ts'
   */
  middlewareFileName(entityName: string) {
    return new StringBuilder(this.middlewareName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a provider class name.
   * Removes file extension and 'provider' suffix, singularizes,
   * then converts to PascalCase with 'Provider' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Provider class name in PascalCase with 'Provider' suffix
   *
   * @example
   * providerName('database') // 'DatabaseProvider'
   * providerName('redis.provider.ts') // 'RedisProvider'
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
   * Converts an entity name to a provider file name.
   * Uses the provider name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Provider file name in snake_case with .ts extension
   *
   * @example
   * providerFileName('Database') // 'database_provider.ts'
   */
  providerFileName(entityName: string) {
    return new StringBuilder(this.providerName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a policy class name.
   * Removes file extension, 'policy' and 'model' suffixes, singularizes,
   * then converts to PascalCase with 'Policy' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Policy class name in PascalCase with 'Policy' suffix
   *
   * @example
   * policyName('users') // 'UserPolicy'
   * policyName('post.policy.ts') // 'PostPolicy'
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
   * Converts an entity name to a policy file name.
   * Uses the policy name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Policy file name in snake_case with .ts extension
   *
   * @example
   * policyFileName('User') // 'user_policy.ts'
   */
  policyFileName(entityName: string) {
    return new StringBuilder(this.policyName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a factory class name.
   * Removes file extension, 'factory' and 'model' suffixes, singularizes,
   * then converts to PascalCase with 'Factory' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Factory class name in PascalCase with 'Factory' suffix
   *
   * @example
   * factoryName('users') // 'UserFactory'
   * factoryName('post.factory.ts') // 'PostFactory'
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
   * Converts an entity name to a factory file name.
   * Uses the factory name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Factory file name in snake_case with .ts extension
   *
   * @example
   * factoryFileName('User') // 'user_factory.ts'
   */
  factoryFileName(entityName: string) {
    return new StringBuilder(this.factoryName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a service class name.
   * Removes file extension, 'service' and 'model' suffixes, singularizes,
   * then converts to PascalCase with 'Service' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Service class name in PascalCase with 'Service' suffix
   *
   * @example
   * serviceName('users') // 'UserService'
   * serviceName('email.service.ts') // 'EmailService'
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
   * Converts an entity name to a service file name.
   * Uses the service name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Service file name in snake_case with .ts extension
   *
   * @example
   * serviceFileName('User') // 'user_service.ts'
   */
  serviceFileName(entityName: string) {
    return new StringBuilder(this.serviceName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a seeder class name.
   * Removes file extension, 'seeder' and 'model' suffixes, singularizes,
   * then converts to PascalCase with 'Seeder' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Seeder class name in PascalCase with 'Seeder' suffix
   *
   * @example
   * seederName('users') // 'UserSeeder'
   * seederName('post.seeder.ts') // 'PostSeeder'
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
   * Converts an entity name to a seeder file name.
   * Uses the seeder name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Seeder file name in snake_case with .ts extension
   *
   * @example
   * seederFileName('User') // 'user_seeder.ts'
   */
  seederFileName(entityName: string) {
    return new StringBuilder(this.seederName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a command terminal name.
   * Creates a namespaced command name using dash-case format,
   * where the first part becomes the namespace and remaining parts
   * are joined with colons.
   *
   * @param entityName - The entity name to convert
   * @returns Command terminal name in namespace:command format
   *
   * @example
   * commandTerminalName('MakeUser') // 'make:user'
   * commandTerminalName('DbSeed') // 'db:seed'
   * commandTerminalName('Clear') // 'clear'
   */
  commandTerminalName(entityName: string) {
    const dashCase = new StringBuilder(this.commandName(entityName)).dashCase().toString()

    const [namespace, ...rest] = dashCase.split('-')
    if (!rest.length) {
      return namespace
    }

    return `${namespace}:${rest.join('-')}`
  },

  /**
   * Converts an entity name to a command class name.
   * Removes file extension and 'command' suffix, then converts to PascalCase.
   *
   * @param entityName - The entity name to convert
   * @returns Command class name in PascalCase
   *
   * @example
   * commandName('make-user') // 'MakeUser'
   * commandName('db.seed.command.ts') // 'DbSeed'
   */
  commandName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('command')
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name to a command file name.
   * Uses the command name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Command file name in snake_case with .ts extension
   *
   * @example
   * commandFileName('MakeUser') // 'make_user.ts'
   */
  commandFileName(entityName: string) {
    return new StringBuilder(this.commandName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a validator class name.
   * Removes file extension and 'validator' suffix, singularizes,
   * then converts to PascalCase.
   *
   * @param entityName - The entity name to convert
   * @returns Validator class name in PascalCase
   *
   * @example
   * validatorName('users') // 'User'
   * validatorName('create-post.validator.ts') // 'CreatePost'
   */
  validatorName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('validator')
      .singular()
      .pascalCase()
      .toString()
  },

  /**
   * Converts an entity name and action to a validator action name.
   * Creates a camelCase name by prefixing with action and suffixing with 'validator'.
   *
   * @param entityName - The entity name to convert
   * @param action - The action name (e.g., 'create', 'update')
   * @returns Validator action name in camelCase
   *
   * @example
   * validatorActionName('User', 'create') // 'createUserValidator'
   * validatorActionName('BlogPost', 'update') // 'updateBlogPostValidator'
   */
  validatorActionName(entityName: string, action: string) {
    return new StringBuilder(this.validatorName(entityName))
      .prefix(`${action}_`)
      .suffix('_validator')
      .camelCase()
      .toString()
  },

  /**
   * Converts an entity name to a validator file name.
   * Uses the validator name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Validator file name in snake_case with .ts extension
   *
   * @example
   * validatorFileName('User') // 'user.ts'
   */
  validatorFileName(entityName: string) {
    return new StringBuilder(this.validatorName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to an exception class name.
   * Removes file extension and 'exception' suffix, then converts to PascalCase
   * with 'Exception' suffix.
   *
   * @param entityName - The entity name to convert
   * @returns Exception class name in PascalCase with 'Exception' suffix
   *
   * @example
   * exceptionName('validation-error') // 'ValidationErrorException'
   * exceptionName('not-found.exception.ts') // 'NotFoundException'
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
   * Converts an entity name to an exception file name.
   * Uses the exception name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @returns Exception file name in snake_case with .ts extension
   *
   * @example
   * exceptionFileName('ValidationError') // 'validation_error_exception.ts'
   */
  exceptionFileName(entityName: string) {
    return new StringBuilder(this.exceptionName(entityName)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a mailer class name.
   * Removes file extension and various suffixes, then converts to PascalCase
   * with the specified type suffix.
   *
   * @param entityName - The entity name to convert
   * @param type - The mailer type ('notification' or 'provision')
   * @returns Mailer class name in PascalCase with type suffix
   *
   * @example
   * mailerName('welcome-email') // 'WelcomeEmailNotification'
   * mailerName('user-signup', 'provision') // 'UserSignupProvision'
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
   * Converts an entity name to a mailer file name.
   * Uses the mailer name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @param type - The mailer type ('notification' or 'provision')
   * @returns Mailer file name in snake_case with .ts extension
   *
   * @example
   * mailerFileName('WelcomeEmail') // 'welcome_email_notification.ts'
   */
  mailerFileName(entityName: string, type: 'notification' | 'provision' = 'notification') {
    return new StringBuilder(this.mailerName(entityName, type)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity name to a class-based mail name.
   * Removes file extension and various suffixes, then converts to PascalCase
   * with the specified type suffix. Similar to mailerName but with more flexible type.
   *
   * @param entityName - The entity name to convert
   * @param type - The mail type (default: 'notification')
   * @returns Mail class name in PascalCase with type suffix
   *
   * @example
   * mailName('welcome') // 'WelcomeNotification'
   * mailName('password-reset', 'email') // 'PasswordResetEmail'
   */
  mailName(entityName: string, type: string = 'notification') {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix(type)
      .removeSuffix('mailer', { similarWords: ['emailer'] })
      .removeSuffix('mail', { similarWords: ['email'] })
      .pascalCase()
      .suffix(string.pascalCase(type))
      .toString()
  },

  /**
   * Converts an entity name to a class-based mail file name.
   * Uses the mail name and converts to snake_case with .ts extension.
   *
   * @param entityName - The entity name to convert
   * @param type - The mail type (default: 'notification')
   * @returns Mail file name in snake_case with .ts extension
   *
   * @example
   * mailFileName('Welcome') // 'welcome_notification.ts'
   * mailFileName('PasswordReset', 'email') // 'password_reset_email.ts'
   */
  mailFileName(entityName: string, type: string = 'notification') {
    return new StringBuilder(this.mailName(entityName, type)).snakeCase().ext('.ts').toString()
  },

  /**
   * Converts an entity to a test group name.
   * Creates a human-readable test group name by combining path and name,
   * removing extensions and converting to sentence case.
   *
   * @param entity - Object containing path and name properties
   * @returns Test group name in sentence case
   *
   * @example
   * testGroupName({ path: 'controllers', name: 'users' }) // 'Controllers users'
   * testGroupName({ path: 'models', name: 'user.spec' }) // 'Models user'
   */
  testGroupName(entity: { path: string; name: string }) {
    return new StringBuilder(`${entity.path}/${entity.name}`)
      .removeExtension()
      .removeSuffix('.spec')
      .sentenceCase()
      .toString()
  },

  /**
   * Converts an entity name to a test file name.
   * Removes file extension and '.spec' suffix, converts to snake_case,
   * then adds '.spec.ts' extension.
   *
   * @param entityName - The entity name to convert
   * @returns Test file name in snake_case with .spec.ts extension
   *
   * @example
   * testFileName('UserController') // 'user_controller.spec.ts'
   * testFileName('auth-service.spec') // 'auth_service.spec.ts'
   */
  testFileName(entityName: string) {
    return new StringBuilder(entityName)
      .removeExtension()
      .removeSuffix('.spec')
      .snakeCase()
      .ext('.spec.ts')
      .toString()
  },

  /**
   * Converts an entity name to a view template file name.
   * Removes file extension, converts to snake_case, and adds '.edge' extension
   * for Edge template files.
   *
   * @param entityName - The entity name to convert
   * @returns View file name in snake_case with .edge extension
   *
   * @example
   * viewFileName('UserProfile') // 'user_profile.edge'
   * viewFileName('admin-dashboard') // 'admin_dashboard.edge'
   */
  viewFileName(entityName: string) {
    return new StringBuilder(entityName).removeExtension().snakeCase().ext('.edge').toString()
  },
}

export default generators
