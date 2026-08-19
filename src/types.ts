/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type AssemblerRcFile } from '@adonisjs/assembler/types'
import { type Prettify, type AsyncOrSync } from '@poppinss/utils/types'
import type { Application } from './application.ts'

export type { AllHooks } from '@adonisjs/assembler/types'

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
 * - 'warming'      Calling `app.warmUp()` method sets the state to 'warming'. The service
 *                  providers start methods are called and the preload files are imported
 *                  during this phase.
 *
 * - 'warmed'       The app has been fully assembled. Every provider has been registered,
 *                  booted and started and all the preload files have been imported.
 *
 *                  This is the terminal state for an app created with the "warmup" mode.
 *                  Otherwise the app moves to the 'ready' state.
 *
 * - 'ready'        Calling `app.start()` method sets the state to `ready`. The app is
 *                  warmed up first and then a set of post start operations are performed
 *                  inside this method.
 *
 *                  The service providers shutdown and application terminating hooks are
 *                  called during post-start phase.
 *
 * - 'terminated'   Calling `app.terminate' method sets the state to `terminated`. The service
 *                  providers shutdown methods are called in this state.
 */
export type ApplicationStates =
  'created' | 'initiated' | 'booted' | 'warming' | 'warmed' | 'ready' | 'terminated'

/**
 * Known application modes. The mode defines how far the application intends to
 * go within its lifecycle and is declared upfront when creating the app.
 *
 * - 'run'     The app is booting in order to run. It will be taken all the way to
 *             the 'ready' state and the long running side-effects registered by the
 *             providers (HTTP server, queue workers, and so on) are expected to kick in.
 *
 * - 'warmup'  The app is booting only to be assembled and inspected. It will stop at
 *             the 'warmed' state and `app.start` may not be called on it.
 *
 *             Providers must use the mode to skip their side-effects. They must never
 *             use it to register different bindings, since the inspected app has to
 *             match the app that runs.
 */
export type ApplicationModes = 'run' | 'warmup'

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
   *
   * The method is called before the preload files are imported and therefore
   * it must not rely upon anything registered by them.
   */
  start?(): AsyncOrSync<void>

  /**
   * The ready method is called when the application is fully ready.
   * For HTTP servers, this is called after the server starts listening.
   * Preloaded files have been imported and the app is ready to serve requests.
   *
   * The method is never called for an app booted in the "warmup" mode.
   */
  ready?(): AsyncOrSync<void>

  /**
   * The shutdown method is called during graceful application shutdown.
   * Use this method to clean up resources, close connections, and perform
   * other cleanup tasks. Avoid long-running operations to prevent forceful termination.
   *
   * The method is only called for an app that has been started. An app booted
   * in the "warmup" mode never opens any resources and therefore terminates
   * without invoking this method.
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

/**
 * Represents a prepared stub ready for file generation.
 * Contains the rendered content and metadata extracted from the stub template,
 * but has not yet been written to disk.
 *
 * @example
 * const preparedStub: PreparedStub = {
 *   contents: 'export class User {}',
 *   destination: '/app/models/user.ts',
 *   force: false,
 *   attributes: { to: '/app/models/user.ts' }
 * }
 */
export type PreparedStub = {
  /** The rendered contents of the stub template */
  contents: string
  /** The absolute path where the file should be written */
  destination: string
  /** Whether to overwrite existing files */
  force: boolean
  /** Additional metadata exported from the stub template */
  attributes: Record<string, any>
}

/**
 * Base type for generated stubs, excluding the 'force' property
 * which is only relevant during preparation phase.
 */
export type GeneratedStubBase = Omit<PreparedStub, 'force'>

/**
 * Represents the result of stub generation after attempting to write to disk.
 * Indicates whether the file was created, skipped, or force-created with reasons.
 *
 * @example
 * // File created successfully
 * const result: GeneratedStub = {
 *   status: 'created',
 *   skipReason: null,
 *   contents: '...',
 *   destination: '/path/to/file.ts',
 *   attributes: {}
 * }
 *
 * @example
 * // File already exists and force was not enabled
 * const result: GeneratedStub = {
 *   status: 'skipped',
 *   skipReason: 'File already exists',
 *   contents: '...',
 *   destination: '/path/to/file.ts',
 *   attributes: {}
 * }
 */
export type GeneratedStub =
  | (GeneratedStubBase & {
      /** File generation was skipped */
      status: 'skipped'
      /** Reason why the file was skipped */
      skipReason: string
    })
  | (GeneratedStubBase & {
      /** File was successfully created */
      status: 'created'
      skipReason: null
    })
  | (GeneratedStubBase & {
      /** File was overwritten because force option was enabled */
      status: 'force_created'
      skipReason: null
    })
