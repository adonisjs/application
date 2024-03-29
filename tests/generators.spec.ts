/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import generators from '../src/generators.js'

test.group('Generator', () => {
  test('convert user input to entity', ({ assert }) => {
    assert.deepEqual(generators.createEntity('user'), { path: './', name: 'user' })
  })

  test('remove extension from user input', ({ assert }) => {
    assert.deepEqual(generators.createEntity('user.ts'), { path: './', name: 'user' })
  })

  test('parse relative paths from user input', ({ assert }) => {
    assert.deepEqual(generators.createEntity('invoicing/user'), { path: 'invoicing', name: 'user' })
  })

  test('make import path', ({ assert }) => {
    assert.deepEqual(generators.importPath('user'), 'user')
    assert.deepEqual(generators.importPath('#models', 'user'), '#models/user')
    assert.deepEqual(generators.importPath('#models', './', 'user.js'), '#models/user.js')
    assert.deepEqual(
      generators.importPath('#models', '/invoicing', 'user.js'),
      '#models/invoicing/user.js'
    )
    assert.deepEqual(
      generators.importPath('#models', 'invoicing', 'user.js'),
      '#models/invoicing/user.js'
    )
  })

  test('convert entity name to model name', ({ assert }) => {
    assert.equal(generators.modelName('user'), 'User')
    assert.equal(generators.modelName('userModel'), 'User')
    assert.equal(generators.modelName('user_model'), 'User')
    assert.equal(generators.modelName('users'), 'User')
    assert.equal(generators.modelName('usersModel'), 'User')
    assert.equal(generators.modelName('users_model'), 'User')
  })

  test('convert entity name to model filename', ({ assert }) => {
    assert.equal(generators.modelFileName('user'), 'user.ts')
    assert.equal(generators.modelFileName('userModel'), 'user.ts')
    assert.equal(generators.modelFileName('user_model'), 'user.ts')
    assert.equal(generators.modelFileName('users'), 'user.ts')
    assert.equal(generators.modelFileName('usersModel'), 'user.ts')
    assert.equal(generators.modelFileName('users_model'), 'user.ts')
    assert.equal(generators.modelFileName('users_model.ts'), 'user.ts')
    assert.equal(generators.modelFileName('usersModel.js'), 'user.ts')
  })

  test('convert entity name to database table name', ({ assert }) => {
    assert.equal(generators.tableName('user'), 'users')
    assert.equal(generators.tableName('userModel'), 'users')
    assert.equal(generators.tableName('user_model'), 'users')
    assert.equal(generators.tableName('users'), 'users')
    assert.equal(generators.tableName('usersModel'), 'users')
    assert.equal(generators.tableName('users_model'), 'users')
  })

  test('convert entity name to controller name', ({ assert }) => {
    assert.equal(generators.controllerName('user'), 'UsersController')
    assert.equal(generators.controllerName('usersController'), 'UsersController')
    assert.equal(generators.controllerName('userController'), 'UsersController')
    assert.equal(generators.controllerName('users'), 'UsersController')
    assert.equal(generators.controllerName('users_controller'), 'UsersController')
    assert.equal(generators.controllerName('user_controller'), 'UsersController')
  })

  test('keep certain controller names always singular', ({ assert }) => {
    assert.equal(generators.controllerName('AdminController'), 'AdminController')
    assert.equal(generators.controllerName('ApiController'), 'ApiController')
    assert.equal(generators.controllerName('api'), 'ApiController')
  })

  test('make singular controller name', ({ assert }) => {
    assert.equal(generators.controllerName('user', true), 'UserController')
    assert.equal(generators.controllerName('admin', true), 'AdminController')
  })

  test('make singular controller filename', ({ assert }) => {
    assert.equal(generators.controllerFileName('user', true), 'user_controller.ts')
    assert.equal(generators.controllerFileName('admin', true), 'admin_controller.ts')
  })

  test('convert entity name to controller filename', ({ assert }) => {
    assert.equal(generators.controllerFileName('user'), 'users_controller.ts')
    assert.equal(generators.controllerFileName('usersController'), 'users_controller.ts')
    assert.equal(generators.controllerFileName('userController'), 'users_controller.ts')
    assert.equal(generators.controllerFileName('users'), 'users_controller.ts')
    assert.equal(generators.controllerFileName('users_controller'), 'users_controller.ts')
    assert.equal(generators.controllerFileName('user_controller'), 'users_controller.ts')
  })

  test('convert entity name to event name', ({ assert }) => {
    assert.equal(generators.eventName('userCreated'), 'UserCreated')
    assert.equal(generators.eventName('user_created'), 'UserCreated')
    assert.equal(generators.eventName('UserCreatedEvent'), 'UserCreated')
    assert.equal(generators.eventName('orders_shipped'), 'OrdersShipped')
  })

  test('convert entity name to event filename', ({ assert }) => {
    assert.equal(generators.eventFileName('userCreated'), 'user_created.ts')
    assert.equal(generators.eventFileName('user_created'), 'user_created.ts')
    assert.equal(generators.eventFileName('UserCreatedEvent'), 'user_created.ts')
    assert.equal(generators.eventFileName('orders_shipped'), 'orders_shipped.ts')
  })

  test('convert entity name to listener name', ({ assert }) => {
    assert.equal(generators.listenerName('sendVerificationEmail'), 'SendVerificationEmail')
    assert.equal(generators.listenerName('send_email_listener'), 'SendEmail')
    assert.equal(generators.listenerName('send_email'), 'SendEmail')
  })

  test('convert entity name to listener filename', ({ assert }) => {
    assert.equal(generators.listenerFileName('sendVerificationEmail'), 'send_verification_email.ts')
    assert.equal(generators.listenerFileName('send_email_listener'), 'send_email.ts')
    assert.equal(generators.listenerFileName('send_email'), 'send_email.ts')
  })

  test('convert entity name to middleware name', ({ assert }) => {
    assert.equal(generators.middlewareName('bodyParser'), 'BodyParserMiddleware')
    assert.equal(generators.middlewareName('body_parser'), 'BodyParserMiddleware')
    assert.equal(generators.middlewareName('bodyParserMiddleware'), 'BodyParserMiddleware')
  })

  test('convert entity name to middleware filename', ({ assert }) => {
    assert.equal(generators.middlewareFileName('bodyParser'), 'body_parser_middleware.ts')
    assert.equal(generators.middlewareFileName('body_parser'), 'body_parser_middleware.ts')
    assert.equal(generators.middlewareFileName('bodyParserMiddleware'), 'body_parser_middleware.ts')
  })

  test('convert entity name to provider name', ({ assert }) => {
    assert.equal(generators.providerName('appProvider'), 'AppProvider')
    assert.equal(generators.providerName('servers'), 'ServerProvider')
    assert.equal(generators.providerName('http'), 'HttpProvider')
    assert.equal(generators.providerName('router_provider'), 'RouterProvider')
    assert.equal(generators.providerName('middleware_provider'), 'MiddlewareProvider')
  })

  test('convert entity name to provider filename', ({ assert }) => {
    assert.equal(generators.providerFileName('appProvider'), 'app_provider.ts')
    assert.equal(generators.providerFileName('servers'), 'server_provider.ts')
    assert.equal(generators.providerFileName('http'), 'http_provider.ts')
    assert.equal(generators.providerFileName('router_provider'), 'router_provider.ts')
    assert.equal(generators.providerFileName('middleware_provider'), 'middleware_provider.ts')
  })

  test('convert entity name to policy name', ({ assert }) => {
    assert.equal(generators.policyName('user'), 'UserPolicy')
    assert.equal(generators.policyName('users'), 'UserPolicy')
    assert.equal(generators.policyName('usersPolicy'), 'UserPolicy')
    assert.equal(generators.policyName('user_policy'), 'UserPolicy')
    assert.equal(generators.policyName('user_model_policy'), 'UserPolicy')
  })

  test('convert entity name to policy filename', ({ assert }) => {
    assert.equal(generators.policyFileName('user'), 'user_policy.ts')
    assert.equal(generators.policyFileName('users'), 'user_policy.ts')
    assert.equal(generators.policyFileName('usersPolicy'), 'user_policy.ts')
    assert.equal(generators.policyFileName('user_policy'), 'user_policy.ts')
    assert.equal(generators.policyFileName('user_model_policy'), 'user_policy.ts')
  })

  test('convert entity name to model factory name', ({ assert }) => {
    assert.equal(generators.factoryName('user'), 'UserFactory')
    assert.equal(generators.factoryName('users'), 'UserFactory')
    assert.equal(generators.factoryName('usersFactory'), 'UserFactory')
    assert.equal(generators.factoryName('user_factory'), 'UserFactory')
    assert.equal(generators.factoryName('user_model_factory'), 'UserFactory')
  })

  test('convert entity name to model factory filename', ({ assert }) => {
    assert.equal(generators.factoryFileName('user'), 'user_factory.ts')
    assert.equal(generators.factoryFileName('users'), 'user_factory.ts')
    assert.equal(generators.factoryFileName('usersFactory'), 'user_factory.ts')
    assert.equal(generators.factoryFileName('user_factory'), 'user_factory.ts')
    assert.equal(generators.factoryFileName('user_model_factory'), 'user_factory.ts')
  })

  test('convert entity name to service name', ({ assert }) => {
    assert.equal(generators.serviceName('user'), 'UserService')
    assert.equal(generators.serviceName('users'), 'UserService')
    assert.equal(generators.serviceName('usersService'), 'UserService')
    assert.equal(generators.serviceName('user_service'), 'UserService')
    assert.equal(generators.serviceName('user_model_service'), 'UserService')
    assert.equal(generators.serviceName('colors_service'), 'ColorService')
    assert.equal(generators.serviceName('taxation'), 'TaxationService')
  })

  test('convert entity name to service filename', ({ assert }) => {
    assert.equal(generators.serviceFileName('user'), 'user_service.ts')
    assert.equal(generators.serviceFileName('users'), 'user_service.ts')
    assert.equal(generators.serviceFileName('usersService'), 'user_service.ts')
    assert.equal(generators.serviceFileName('user_service'), 'user_service.ts')
    assert.equal(generators.serviceFileName('user_model_service'), 'user_service.ts')
    assert.equal(generators.serviceFileName('colors_service'), 'color_service.ts')
    assert.equal(generators.serviceFileName('taxation'), 'taxation_service.ts')
  })

  test('convert entity name to seeder name', ({ assert }) => {
    assert.equal(generators.seederName('user'), 'UserSeeder')
    assert.equal(generators.seederName('users'), 'UserSeeder')
    assert.equal(generators.seederName('usersSeeder'), 'UserSeeder')
    assert.equal(generators.seederName('user_seeder'), 'UserSeeder')
    assert.equal(generators.seederName('post_model_seeder'), 'PostSeeder')
    assert.equal(generators.seederName('db_seeder'), 'DbSeeder')
  })

  test('convert entity name to seeder filename', ({ assert }) => {
    assert.equal(generators.seederFileName('user'), 'user_seeder.ts')
    assert.equal(generators.seederFileName('users'), 'user_seeder.ts')
    assert.equal(generators.seederFileName('usersSeeder'), 'user_seeder.ts')
    assert.equal(generators.seederFileName('user_seeder'), 'user_seeder.ts')
    assert.equal(generators.seederFileName('post_model_seeder'), 'post_seeder.ts')
    assert.equal(generators.seederFileName('db_seeder'), 'db_seeder.ts')
  })

  test('convert entity name to command name', ({ assert }) => {
    assert.equal(generators.commandName('makeController'), 'MakeController')
    assert.equal(generators.commandName('publish_asset'), 'PublishAsset')
    assert.equal(generators.commandName('publish_config_command'), 'PublishConfig')
    assert.equal(generators.commandName('create_users_command'), 'CreateUsers')
  })

  test('convert entity name to command filename', ({ assert }) => {
    assert.equal(generators.commandFileName('makeController'), 'make_controller.ts')
    assert.equal(generators.commandFileName('publish_asset'), 'publish_asset.ts')
    assert.equal(generators.commandFileName('publish_config_command'), 'publish_config.ts')
    assert.equal(generators.commandFileName('create_users_command'), 'create_users.ts')
  })

  test('convert entity name to command terminal name', ({ assert }) => {
    assert.equal(generators.commandTerminalName('makeController'), 'make:controller')
    assert.equal(generators.commandTerminalName('publish_asset'), 'publish:asset')
    assert.equal(generators.commandTerminalName('serve'), 'serve')
    assert.equal(generators.commandTerminalName('publish_config_command'), 'publish:config')
    assert.equal(generators.commandTerminalName('create_users_command'), 'create:users')
    assert.equal(generators.commandTerminalName('create_admin_users_command'), 'create:admin-users')
  })

  test('convert entity name to validator name', ({ assert }) => {
    assert.equal(generators.validatorName('user'), 'User')
    assert.equal(generators.validatorName('comments'), 'Comment')
  })

  test('convert entity name to validator filename', ({ assert }) => {
    assert.equal(generators.validatorFileName('user'), 'user.ts')
    assert.equal(generators.validatorFileName('comments'), 'comment.ts')
  })

  test('convert entity name to validator action name', ({ assert }) => {
    assert.equal(generators.validatorActionName('user', 'create'), 'createUserValidator')
    assert.equal(generators.validatorActionName('user', 'update'), 'updateUserValidator')
    assert.equal(generators.validatorActionName('comment', 'delete'), 'deleteCommentValidator')
  })

  test('convert entity name to exception name', ({ assert }) => {
    assert.equal(generators.exceptionName('commandValidation'), 'CommandValidationException')
    assert.equal(generators.exceptionName('commandNotFound'), 'CommandNotFoundException')
    assert.equal(generators.exceptionName('routeNotFoundException'), 'RouteNotFoundException')
    assert.equal(generators.exceptionName('route_not_found_exception'), 'RouteNotFoundException')
  })

  test('convert entity name to exception filename', ({ assert }) => {
    assert.equal(
      generators.exceptionFileName('commandValidation'),
      'command_validation_exception.ts'
    )
    assert.equal(generators.exceptionFileName('commandNotFound'), 'command_not_found_exception.ts')
    assert.equal(
      generators.exceptionFileName('routeNotFoundException'),
      'route_not_found_exception.ts'
    )
    assert.equal(
      generators.exceptionFileName('route_not_found_exception'),
      'route_not_found_exception.ts'
    )
  })

  test('convert entity name to mailer name', ({ assert }) => {
    assert.equal(generators.mailerName('email_verified'), 'EmailVerifiedNotification')
    assert.equal(generators.mailerName('email_verified_mailer'), 'EmailVerifiedNotification')
    assert.equal(
      generators.mailerName('emailVerifiedMailerNotification'),
      'EmailVerifiedNotification'
    )
    assert.equal(generators.mailerName('password_reset', 'provision'), 'PasswordResetProvision')
    assert.equal(generators.mailerName('team_invite', 'provision'), 'TeamInviteProvision')
  })

  test('convert entity name to mailer filename', ({ assert }) => {
    assert.equal(generators.mailerFileName('email_verified'), 'email_verified_notification.ts')
    assert.equal(
      generators.mailerFileName('email_verified_mailer'),
      'email_verified_notification.ts'
    )
    assert.equal(
      generators.mailerFileName('emailVerifiedMailerNotification'),
      'email_verified_notification.ts'
    )
    assert.equal(
      generators.mailerFileName('password_reset', 'provision'),
      'password_reset_provision.ts'
    )
    assert.equal(generators.mailerFileName('team_invite', 'provision'), 'team_invite_provision.ts')
  })

  test('convert entity to test group name', ({ assert }) => {
    assert.equal(
      generators.testGroupName(generators.createEntity('users/send_email')),
      'Users send email'
    )

    assert.equal(
      generators.testGroupName(generators.createEntity('rc_file/parser')),
      'Rc file parser'
    )

    assert.equal(generators.testGroupName(generators.createEntity('posts/create')), 'Posts create')
  })

  test('convert entity name to test file name', ({ assert }) => {
    assert.equal(
      generators.testFileName(generators.createEntity('users/send_email').name),
      'send_email.spec.ts'
    )

    assert.equal(
      generators.testFileName(generators.createEntity('users/send_email.spec').name),
      'send_email.spec.ts'
    )

    assert.equal(
      generators.testFileName(generators.createEntity('users/send_email.spec.ts').name),
      'send_email.spec.ts'
    )

    assert.equal(
      generators.testFileName(generators.createEntity('users/send_email.ts').name),
      'send_email.spec.ts'
    )
  })

  test('convert entity name to template file name', ({ assert }) => {
    assert.equal(
      generators.viewFileName(generators.createEntity('pages/posts/index').name),
      'index.edge'
    )

    assert.equal(
      generators.viewFileName(generators.createEntity('createPost').name),
      'create_post.edge'
    )
  })

  test('convert entity name to mail name', ({ assert }) => {
    assert.equal(generators.mailName('email_verified'), 'EmailVerifiedNotification')
    assert.equal(generators.mailName('email_verified_mailer'), 'EmailVerifiedNotification')
    assert.equal(
      generators.mailName('emailVerifiedMailerNotification'),
      'EmailVerifiedNotification'
    )
    assert.equal(generators.mailName('password_reset', 'provision'), 'PasswordResetProvision')
    assert.equal(generators.mailName('team_invite', 'provision'), 'TeamInviteProvision')
  })

  test('convert entity name to mail filename', ({ assert }) => {
    assert.equal(generators.mailFileName('email_verified'), 'email_verified_notification.ts')
    assert.equal(generators.mailFileName('email_verified_mailer'), 'email_verified_notification.ts')
    assert.equal(
      generators.mailFileName('emailVerifiedMailerNotification'),
      'email_verified_notification.ts'
    )
    assert.equal(
      generators.mailFileName('password_reset', 'provision'),
      'password_reset_provision.ts'
    )
    assert.equal(generators.mailFileName('team_invite', 'provision'), 'team_invite_provision.ts')
  })
})
