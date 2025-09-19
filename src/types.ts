/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Prettify, type AsyncOrSync } from '@poppinss/utils/types'
import { type AssemblerRcFile } from '@adonisjs/assembler/types'
import type { Application } from './application.ts'

/**
 * Known application environments. The list is strictly limited to
 * AdonisJS known environments and custom environments are not
 * supported as of now.
 *
 * @example
 * // Environment-specific behavior
 * if (app.getEnvironment() === 'test') {
 *   // Test-specific logic
 * }
 *
 * - 'web' - HTTP server environment
 * - 'console' - Command-line environment (ace commands)
 * - 'test' - Testing environment
 * - 'repl' - REPL environment
 * - 'unknown' - Fallback for unrecognized environments
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
 * State shared with hooks during application lifecycle.
 * Represents the application instance parameters passed to hook functions.
 *
 * @template ContainerBindings - Type representing the container bindings
 * @example
 * // Hook function receiving application state
 * function myHook(app: Application<ContainerBindings>) {
 *   // Access application instance
 * }
 */
export type HooksState<ContainerBindings extends Record<any, any>> = [
  [Application<ContainerBindings>],
  [Application<ContainerBindings>],
]

/**
 * Shape of directories object with known and unknown directories.
 * Defines the standard directory structure for an AdonisJS application.
 * Custom directories can be added via the index signature.
 *
 * @example
 * const directories: DirectoriesNode = {
 *   config: './config',
 *   public: './public',
 *   // ... other standard directories
 *   customDir: './custom' // Custom directory
 * }
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
  transformers: string
  stubs: string
  generatedClient: string
  generatedServer: string
}

/**
 * To be extended by packages that want to introduce experimental flags.
 * This interface can be augmented by packages to add their own experimental features.
 *
 * @example
 * // In a package's types file:
 * declare module '@adonisjs/application/types' {
 *   interface ExperimentalFlagsList {
 *     myExperimentalFeature: boolean
 *   }
 * }
 */
export interface ExperimentalFlagsList {}

/**
 * Shape of preload files configuration.
 * Preload files are automatically imported during application boot
 * for specific environments.
 *
 * @example
 * const preloadFile: PreloadNode = {
 *   file: () => import('./start/routes.js'),
 *   environment: ['web', 'console']
 * }
 */
export type PreloadNode = {
  file: () => Promise<any>
  environment: Exclude<AppEnvironments, 'unknown'>[]
}

/**
 * Shape of provider modules configuration.
 * Providers are service containers that register bindings and boot
 * application services for specific environments.
 *
 * @example
 * const provider: ProviderNode = {
 *   file: () => import('./providers/database_provider.js'),
 *   environment: ['web', 'console']
 * }
 */
export type ProviderNode = {
  file: () => Promise<{ default?: new (app: Application<any>) => ContainerProviderContract }>
  environment: Exclude<AppEnvironments, 'unknown'>[]
}

/**
 * Shape of semantic version node.
 * Represents a parsed semantic version with its components
 * and utility methods.
 *
 * @example
 * const version: SemverNode = {
 *   major: 1,
 *   minor: 2,
 *   patch: 3,
 *   prerelease: ['beta', 1],
 *   version: '1.2.3-beta.1',
 *   toString: () => '1.2.3-beta.1'
 * }
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
 * Shape of meta file configuration inside the `metaFiles` array
 * in the `adonisrc.js` file.
 * Meta files are watched for changes and can trigger server reloads.
 *
 * @example
 * const metaFile: MetaFileNode = {
 *   pattern: './config/**\/*.ts',
 *   reloadServer: true // Reload server when files matching pattern change
 * }
 */
export type MetaFileNode = {
  pattern: string
  reloadServer: boolean
}

/**
 * Shape of the adonisrc.js configuration file.
 * This is the main configuration file that defines the application structure,
 * providers, preloads, and other essential settings.
 *
 * @example
 * const rcFile: RcFile = {
 *   typescript: true,
 *   directories: { ... },
 *   providers: [...],
 *   preloads: [...],
 *   // ... other configurations
 * }
 */
export type RcFile = {
  /**
   * Indicates whether this is a TypeScript project.
   */
  typescript: boolean

  /**
   * List of configured directories for the application.
   * Combines standard AdonisJS directories with custom ones.
   */
  directories: DirectoriesNode & { [key: string]: string }

  /**
   * Array of files to preload after the application has been booted.
   * These files are automatically imported based on environment.
   */
  preloads: PreloadNode[]

  /**
   * Array of meta files to watch for changes.
   * Used by development tools to trigger server reloads.
   */
  metaFiles: MetaFileNode[]

  /**
   * Providers to register in the IoC container.
   * Providers are registered based on their environment configuration.
   */
  providers: ProviderNode[]

  /**
   * Array of Ace commands to register.
   * Each entry is a function that imports a command class.
   */
  commands: (() => Promise<any>)[]

  /**
   * Custom aliases for Ace commands.
   * Maps alias names to actual command names.
   *
   * @example
   * { 'm:c': 'make:controller', 'serve': 'serve' }
   */
  commandsAliases: {
    [key: string]: string
  }

  /**
   * Assembler hooks configuration for build processes.
   * Hooks are executed during various build lifecycle events.
   */
  hooks: AssemblerRcFile['hooks']

  /**
   * Test suites configuration for the application.
   * Defines test files, directories, and execution settings.
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
   * Reference to the raw contents of the `adonisrc.js` file.
   * Contains the original, unprocessed configuration object.
   */
  raw: Record<string, any>

  /**
   * Flags to enable experimental features.
   * Can be extended by packages to add their own experimental options.
   */
  experimental: ExperimentalFlagsList
}

/**
 * Input shape for RcFile configuration.
 * A partial version of RcFile used when creating or updating
 * the application configuration. Includes preset functions for
 * applying common configurations.
 *
 * @example
 * const input: RcFileInput = {
 *   typescript: true,
 *   presets: [webPreset()],
 *   directories: { controllers: './app/controllers' }
 * }
 */
export interface RcFileInput {
  /**
   * List of preset functions to apply to the configuration.
   * Presets provide common configuration patterns.
   */
  presets?: PresetFn[]

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
  hooks?: RcFile['hooks']

  /**
   * Optional flags to enable experimental features.
   * Can be extended by packages to add their own experimental options.
   */
  experimental?: ExperimentalFlagsList
}

/**
 * RCFile after has been normalized by the RCManager. This file is
 * shared with the presets
 */
export type NormalizedRcFileInput = Prettify<
  Required<
    Omit<RcFileInput, 'directories'> & {
      directories: RcFile['directories']
    }
  >
>

/**
 * Contract for service provider classes.
 * Service providers are used to register bindings in the IoC container
 * and boot application services during different lifecycle phases.
 *
 * @example
 * export default class MyProvider implements ContainerProviderContract {
 *   register() {
 *     this.app.container.singleton('myService', () => new MyService())
 *   }
 *
 *   boot() {
 *     // Boot logic
 *   }
 * }
 */
export interface ContainerProviderContract {
  /**
   * The register method is called to register bindings in the IoC container.
   * This is where you should bind services, singletons, and other dependencies.
   */
  register?(): void

  /**
   * The boot method is called to boot application state.
   * Use this method for registering macros, middleware, REPL bindings,
   * and other application-level configurations.
   */
  boot?(): AsyncOrSync<void>

  /**
   * The start method is called after all providers have been booted.
   * This is the ideal place to use existing container bindings and
   * perform startup operations that depend on other services.
   */
  start?(): AsyncOrSync<void>

  /**
   * The ready method is called when the application is fully ready.
   * For HTTP servers, this is called after the server starts listening.
   * Preloaded files have been imported and the app is ready to serve requests.
   */
  ready?(): AsyncOrSync<void>

  /**
   * The shutdown method is called during graceful application shutdown.
   * Use this method to clean up resources, close connections, and perform
   * other cleanup tasks. Avoid long-running operations to prevent forceful termination.
   */
  shutdown?(): AsyncOrSync<void>
}

/**
 * Function type for importing modules in the context of an AdonisJS application.
 * This function is called whenever AdonisJS needs to import a module from a string identifier.
 *
 * @param moduleIdentifier - The module identifier or path to import
 * @param options - Optional import call options
 * @returns The imported module
 *
 * @example
 * const importer: Importer = (id, options) => import(id)
 */
export type Importer = (moduleIdentifier: string, options?: ImportCallOptions) => any

/**
 * Type for AdonisRC preset functions.
 * Preset functions are used to apply common configuration patterns
 * to the RcFile configuration object.
 *
 * @param options - Object containing the RcFile to modify
 *
 * @example
 * const webPreset: PresetFn = ({ rcFile }) => {
 *   rcFile.providers.push(httpProvider)
 *   rcFile.preloads.push(routesPreload)
 * }
 */
export type PresetFn = (options: { rcFile: NormalizedRcFileInput }) => void
