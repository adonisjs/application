/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import globParent from 'glob-parent'

import * as errors from '../errors.ts'
import { directories } from '../directories.ts'
import type {
  RcFile,
  PreloadNode,
  ProviderNode,
  MetaFileNode,
  AppEnvironments,
  NormalizedRcFileInput,
} from '../types.ts'

const KNOWN_ASSEMBLER_HOOKS: (keyof NonNullable<RcFile['hooks']>)[] = [
  'init',
  'routesCommitted',
  'routesScanning',
  'routesScanned',
  'routesCommitted',
  'buildStarting',
  'buildFinished',
  'devServerStarting',
  'devServerStarted',
  'testsStarting',
  'testsFinished',
  'fileAdded',
  'fileChanged',
  'fileRemoved',
]

/**
 * RcFileParser processes and validates the adonisrc.js configuration file.
 * It merges user configuration with defaults, applies presets, validates structure,
 * and transforms the configuration into a normalized format.
 *
 * The parser handles:
 * - Merging user config with framework defaults
 * - Applying configuration presets
 * - Validating providers, preloads, and hooks
 * - Normalizing directory paths
 * - Processing environment-specific configurations
 *
 * @example
 * const parser = new RcFileParser({
 *   typescript: true,
 *   providers: [() => import('./providers/app_provider')]
 * })
 * const rcFile = parser.parse()
 */
export class RcFileParser {
  /**
   * Default configuration values for an RcFile. This object initializes all known
   * properties with sensible defaults that will be merged with user configuration.
   *
   * @private
   */
  #defaults: NormalizedRcFileInput = {
    typescript: true,
    preloads: [],
    metaFiles: [],
    presets: [],
    commandsAliases: {},
    commands: [],
    providers: [],
    directories: directories,
    tests: {
      suites: [],
      timeout: 2000,
      forceExit: true,
    },
    hooks: {},
    experimental: {},
  }

  /**
   * The parsed RcFile configuration merged with default values.
   * This represents the final configuration after applying user overrides.
   *
   * @private
   */
  #rcFile: NormalizedRcFileInput

  /**
   * Reference to the original raw configuration object before processing.
   * Preserved for debugging and error reporting purposes.
   *
   * @private
   * @type {Record<string, any>}
   */
  #raw: Record<string, any>

  /**
   * Creates a new RcFileParser instance.
   *
   * @param {Record<string, any>} rcFile - The raw RC file configuration object to parse and validate
   */
  constructor(rcFile: Record<string, any>) {
    this.#rcFile = Object.assign(this.#defaults, rcFile)
    this.#raw = rcFile
  }

  /**
   * Returns all valid application environments excluding 'unknown'.
   * These environments can be used for conditional provider and preload loading.
   *
   * @private
   * @returns {Exclude<AppEnvironments, 'unknown'>[]} Array of valid environment names
   */
  #knownEnvironments(): Exclude<AppEnvironments, 'unknown'>[] {
    return ['web', 'console', 'test', 'repl']
  }

  /**
   * Validates and extracts assembler hooks from the configuration.
   * Hooks allow extending the build process at specific lifecycle events.
   *
   * @private
   * @returns {RcFile['hooks']} Validated hooks object or undefined
   * @throws {E_UNKNOWN_ASSEMBLER_HOOK} When an unknown hook event is encountered
   * @throws {E_INVALID_HOOKS_VALUE} When a hook value is not an array
   */
  #getHooks(): RcFile['hooks'] {
    const hooks = this.#rcFile.hooks
    if (!hooks) {
      return
    }

    return Object.keys(hooks).reduce<NonNullable<RcFile['hooks']>>((result, eventName) => {
      if (!KNOWN_ASSEMBLER_HOOKS.includes(eventName as keyof NonNullable<RcFile['hooks']>)) {
        throw new errors.E_UNKNOWN_ASSEMBLER_HOOK([eventName])
      }

      const eventHooks = hooks[eventName as keyof NonNullable<RcFile['hooks']>]
      if (!Array.isArray(eventHooks)) {
        throw new errors.E_INVALID_HOOKS_VALUE([eventName, inspect(eventHooks)])
      }

      ;(result as any)[eventName] = eventHooks
      return result
    }, {})
  }

  /**
   * Normalizes and validates the preload files configuration.
   * Converts simple function references to full PreloadNode objects with environment targeting.
   *
   * @throws {E_MISSING_PRELOAD_FILE} When a preload entry is missing the file property
   * @throws {E_INVALID_PRELOAD_FILE} When a preload file is not a function
   * @private
   */
  #getPreloads(): PreloadNode[] {
    return this.#rcFile.preloads.map((preload) => {
      const normalizedPreload =
        typeof preload === 'function'
          ? {
              file: preload,
              environment: this.#knownEnvironments(),
            }
          : preload

      if (!normalizedPreload.file) {
        throw new errors.E_MISSING_PRELOAD_FILE([inspect(preload)])
      }

      if (typeof normalizedPreload.file !== 'function') {
        throw new errors.E_INVALID_PRELOAD_FILE([inspect(preload)])
      }

      return {
        file: normalizedPreload.file,
        environment: normalizedPreload.environment ?? this.#knownEnvironments(),
      }
    })
  }

  /**
   * Normalizes and validates the service providers configuration.
   * Converts simple function references to full ProviderNode objects with environment targeting.
   *
   * @throws {E_MISSING_PROVIDER_FILE} When a provider entry is missing the file property
   * @throws {E_INVALID_PROVIDER} When a provider file is not a function
   * @private
   */
  #getProviders(): ProviderNode[] {
    return this.#rcFile.providers.map((provider) => {
      const normalizedProvider =
        typeof provider === 'function'
          ? {
              file: provider,
              environment: this.#knownEnvironments(),
            }
          : provider

      if (!normalizedProvider.file) {
        throw new errors.E_MISSING_PROVIDER_FILE([inspect(provider)])
      }

      if (typeof normalizedProvider.file !== 'function') {
        throw new errors.E_INVALID_PROVIDER([inspect(provider)])
      }

      return {
        file: normalizedProvider.file,
        environment: normalizedProvider.environment ?? this.#knownEnvironments(),
      }
    })
  }

  /**
   * Normalizes and validates the meta files configuration.
   * Meta files are patterns that define files to watch for changes during development.
   *
   * @throws {E_MISSING_METAFILE_PATTERN} When a meta file entry is missing the pattern property
   * @private
   */
  #getMetaFiles(): MetaFileNode[] {
    return this.#rcFile.metaFiles.map((pattern) => {
      const normalizeMetaFile =
        typeof pattern === 'string'
          ? {
              pattern: pattern,
              reloadServer: true,
            }
          : pattern

      if (!normalizeMetaFile.pattern) {
        throw new errors.E_MISSING_METAFILE_PATTERN([inspect(pattern)])
      }

      return {
        pattern: normalizeMetaFile.pattern,
        reloadServer: normalizeMetaFile.reloadServer ?? true,
      }
    })
  }

  /**
   * Normalizes and validates the test suites configuration.
   * Each suite must have a name and file patterns, and automatically determines
   * the base directories for file watching.
   *
   * @throws {E_MISSING_SUITE_NAME} When a test suite is missing the name property
   * @throws {E_MISSING_SUITE_FILES} When a test suite is missing the files property
   * @private
   */
  #getSuites() {
    const suites = this.#rcFile.tests.suites || []

    return suites.map((suite) => {
      if (!suite.name) {
        throw new errors.E_MISSING_SUITE_NAME([inspect(suite)])
      }

      if (!suite.files) {
        throw new errors.E_MISSING_SUITE_FILES([inspect(suite)])
      }

      const files = Array.isArray(suite.files) ? [...suite.files] : [suite.files]
      return {
        name: suite.name,
        files: files,
        directories: files.map((file) => globParent(file)),
        timeout: suite.timeout,
      }
    })
  }

  /**
   * Applies preset functions to modify the RC file configuration before parsing.
   * Presets are functions that can programmatically modify the configuration,
   * allowing for dynamic setup and shared configurations.
   *
   * @throws {E_INVALID_PRESETS_VALUE} When presets is not an array
   * @throws {E_INVALID_PRESET_FUNCTION} When a preset is not a function
   * @throws {E_PRESET_EXECUTION_ERROR} When a preset function throws an error
   * @private
   */
  #applyPresets(): void {
    if (this.#rcFile.presets.length === 0) {
      return
    }

    if (!Array.isArray(this.#rcFile.presets)) {
      throw new errors.E_INVALID_PRESETS_VALUE([inspect(this.#rcFile.presets)])
    }

    this.#rcFile.presets.forEach((preset, index) => {
      if (typeof preset !== 'function') {
        throw new errors.E_INVALID_PRESET_FUNCTION([index, inspect(preset)])
      }

      try {
        preset({ rcFile: this.#rcFile })
      } catch (error: any) {
        throw new errors.E_PRESET_EXECUTION_ERROR([index, error.message])
      }
    })
  }

  /**
   * Parses and validates the RC file configuration, applying all normalization
   * and validation rules. This is the main entry point for processing RC file data.
   *
   * The parsing process:
   * 1. Applies any preset functions to modify the configuration
   * 2. Normalizes all configuration sections (preloads, providers, etc.)
   * 3. Validates the structure and values
   * 4. Merges with defaults to create the final configuration
   */
  parse(): RcFile {
    this.#applyPresets()

    const rcFile = {
      typescript: this.#rcFile.typescript,
      preloads: this.#getPreloads(),
      metaFiles: this.#getMetaFiles(),
      commands: [...this.#rcFile.commands],
      directories: { ...directories, ...this.#rcFile.directories },
      commandsAliases: { ...this.#rcFile.commandsAliases },
      providers: this.#getProviders(),
      tests: {
        suites: this.#getSuites(),
        timeout: this.#rcFile.tests.timeout ?? 2000,
        forceExit: this.#rcFile.tests.forceExit ?? true,
      },
      hooks: this.#getHooks(),
      experimental: this.#rcFile.experimental,
      raw: this.#raw,
    }

    return rcFile
  }
}
