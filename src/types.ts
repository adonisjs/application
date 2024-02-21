/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Application } from './application.js'

/**
 * Known application environments. The list is strictly limited to
 * AdonisJS known environments and custom environments are not
 * supported as of now
 */
export type AppEnvironments = 'web' | 'console' | 'test' | 'repl' | 'unknown'

/**
 * Known application states.
 *
 * - 'created'      Creating an application class instance sets the state to 'created'.
 *
 * - 'initiated'    Calling `app.init()` method sets the state to 'initiated'.
 *                  The rc file contents and environment variables are parsed during
 *                  init phase.
 *
 * - 'booted'       Calling `app.boot()` method sets the state to `booted`. The service
 *                  providers are registered and booted in this state.
 *
 * - 'ready'        Calling `app.start()` method sets the state to `ready`. A set of
 *                  pre and post start operations inside this method.
 *
 *                  The service providers start methods are called during pre-start phase.
 *                  The service providers shutdown and application terminating hooks are
 *                  called during post-start phase.
 *
 * - 'terminated'   Calling `app.terminate' method sets the state to `terminated`. The service
 *                  providers shutdown methods are called in this state.
 */
export type ApplicationStates = 'created' | 'initiated' | 'booted' | 'ready' | 'terminated'

/**
 * State shared with hooks
 */
export type HooksState<ContainerBindings extends Record<any, any>> = [
  [Application<ContainerBindings>],
  [Application<ContainerBindings>],
]

/**
 * Shape of directories object with known and unknown
 * directories
 */
export interface DirectoriesNode {
  [key: string]: string
  config: string
  public: string
  contracts: string
  providers: string
  languageFiles: string
  migrations: string
  seeders: string
  factories: string
  views: string
  start: string
  tmp: string
  httpControllers: string
  models: string
  services: string
  exceptions: string
  mailers: string
  middleware: string
  policies: string
  validators: string
  commands: string
  events: string
  listeners: string
  stubs: string
}

/**
 * Shape of preload files
 */
export type PreloadNode = {
  file: () => Promise<any>
  environment: Exclude<AppEnvironments, 'unknown'>[]
}

/**
 * Shape of provider modules
 */
export type ProviderNode = {
  file: () => Promise<{ default?: new (app: Application<any>) => ContainerProviderContract }>
  environment: Exclude<AppEnvironments, 'unknown'>[]
}

/**
 * Shape of semver node
 */
export type SemverNode = {
  major: number
  minor: number
  patch: number
  prerelease: (string | number)[]
  version: string
  toString(): string
}

/**
 * Shape of the meta file inside the `metaFiles` array inside
 * `adonisrc.js` file.
 */
export type MetaFileNode = {
  pattern: string
  reloadServer: boolean
}

/**
 * Shape of the adonisrc.js file
 */
export type RcFile = {
  /**
   * Configure a custom assets bundler to bundle and serve
   * assets.
   *
   * This config can be used to configure assets bundler apart from
   * vite and encore (since both are auto-detected)
   *
   * Set it to `false` to disable the assets bundler
   */
  assetsBundler?:
    | {
        name: string
        devServer: {
          command: string
          args?: string[]
        }
        build: {
          command: string
          args?: string[]
        }
      }
    | false

  /**
   * Is it a TypeScript project
   */
  typescript: boolean

  /**
   * List of configured directories
   */
  directories: DirectoriesNode & { [key: string]: string }

  /**
   * An array of files to load after the application
   * has been booted
   */
  preloads: PreloadNode[]

  /**
   * An array of files to load after the application
   * has been booted
   */
  metaFiles: MetaFileNode[]

  /**
   * Providers to register.
   *
   * - The "base" key is used to register providers in all the environments.
   * - The environment specific keys are used to register providers for a specific env.
   */
  providers: ProviderNode[]

  /**
   * An array of commands to register
   */
  commands: (() => Promise<any>)[]

  /**
   * Custom command aliases
   */
  commandsAliases: {
    [key: string]: string
  }

  /**
   * Register test suites
   */
  tests: {
    suites: {
      name: string
      files: string | string[]
      directories: string[]
      timeout?: number
    }[]
    forceExit: boolean
    timeout: number
  }

  /**
   * Reference to `adonisrc.js` file raw contents
   */
  raw: Record<string, any>
}

/**
 * RcFile input is the partial copy of the RcFile
 */
export interface RcFileInput {
  assetsBundler?: RcFile['assetsBundler']
  typescript?: RcFile['typescript']
  directories?: Partial<DirectoriesNode> & { [key: string]: string }
  preloads?: (PreloadNode | PreloadNode['file'])[]
  metaFiles?: string[] | RcFile['metaFiles']
  commands?: RcFile['commands']
  commandsAliases?: RcFile['commandsAliases']
  tests?: {
    suites: {
      name: string
      files: string | string[]
      timeout?: number
    }[]
    forceExit?: boolean
    timeout?: number
  }
  providers?: (ProviderNode | ProviderNode['file'])[]
}

/**
 * Shape of the container provider class instance.
 */
export interface ContainerProviderContract {
  /**
   * The register method on the provider class is meant to
   * register bindings in the container
   */
  register?(): void

  /**
   * The boot method on the provider class is meant to boot
   * any state that application might need.
   *
   * For example: Registering macros/getters, defining middleware,
   * or repl bindings.
   */
  boot?(): void | Promise<void>

  /**
   * The start method on the provider class is called right the
   * boot method.
   *
   * This method is best place to use existing container bindings before
   * the application gets started. Also, at this stage you can be sure
   * that all providers have been booted.
   */
  start?(): void | Promise<void>

  /**
   * The ready method is called after the preloaded files have been
   * imported and the app is considered ready. In case of an HTTP
   * server, the server will be ready to receive incoming HTTP requests
   * before this hook gets called.
   */
  ready?(): void | Promise<void>

  /**
   * The shutdown method on the provider class is meant to perform
   * cleanup for graceful shutdown. You should avoid executing
   * long running tasks in this method.
   *
   * If the shutdown process takes time, the application might get
   * forcefully killed based upon the event that occurred shutdown
   * in first place.
   */
  shutdown?(): void | Promise<void>
}

/**
 * The importer is used to import modules in context of the
 * an AdonisJS application.
 *
 * Anytime AdonisJS wants to import a module from a bare string, it
 * will call this function
 */
export type Importer = (moduleIdentifier: string, options?: ImportCallOptions) => any
