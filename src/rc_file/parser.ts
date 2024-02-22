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
import { ObjectBuilder } from '@poppinss/utils'

import * as errors from '../errors.js'
import { directories } from '../directories.js'
import type {
  AppEnvironments,
  MetaFileNode,
  PreloadNode,
  PresetFn,
  ProviderNode,
  RcFile,
} from '../types.js'

/**
 * Rc file parser is used to parse and validate the `adonisrc.js` file contents.
 */
export class RcFileParser {
  /**
   * Defaults for the RcFile. This object initiates all
   * the known properties
   */
  #defaults: RcFile = {
    typescript: true,
    preloads: [],
    metaFiles: [],
    commandsAliases: {},
    commands: [],
    providers: [],
    directories: directories,
    tests: {
      suites: [],
      timeout: 2000,
      forceExit: true,
    },
    raw: {},
  }

  /**
   * RcFile merged with defaults
   */
  #rcFile: RcFile

  constructor(rcFile: Record<string, any>) {
    this.#rcFile = Object.assign(this.#defaults, rcFile)
    this.#rcFile.raw = rcFile
  }

  /**
   * An array of known environments
   */
  #knownEnvironments(): Exclude<AppEnvironments, 'unknown'>[] {
    return ['web', 'console', 'test', 'repl']
  }

  /**
   * Returns the assets bundler object
   */
  #getAssetsBundler(): RcFile['assetsBundler'] {
    if (this.#rcFile.assetsBundler === false) {
      return false
    }

    if (!this.#rcFile.assetsBundler) {
      return
    }

    if (!this.#rcFile.assetsBundler.name) {
      throw new errors.E_MISSING_BUNDLER_NAME()
    }

    if (!this.#rcFile.assetsBundler.devServer) {
      throw new errors.E_MISSING_BUNDLER_DEV_COMMAND()
    }

    if (!this.#rcFile.assetsBundler.build) {
      throw new errors.E_MISSING_BUNDLER_BUILD_COMMAND()
    }

    return {
      name: this.#rcFile.assetsBundler.name,
      devServer: this.#rcFile.assetsBundler.devServer,
      build: this.#rcFile.assetsBundler.build,
    }
  }

  /**
   * Returns the assembler runner object
   */
  #getAssemblerRunner(): NonNullable<RcFile['assembler']>['runner'] {
    if (!this.#rcFile.assembler?.runner) {
      return
    }

    if (!this.#rcFile.assembler.runner.name) {
      throw new errors.E_MISSING_ASSEMBLER_RUNNER_NAME()
    }

    if (!this.#rcFile.assembler.runner.command) {
      throw new errors.E_MISSING_ASSEMBLER_RUNNER_COMMAND()
    }

    return {
      name: this.#rcFile.assembler.runner.name,
      command: this.#rcFile.assembler.runner.command,
      args: this.#rcFile.assembler.runner.args,
    }
  }

  /**
   * Returns the assembler object
   */
  #getAssembler(): RcFile['assembler'] {
    if (!this.#rcFile.assembler) {
      return
    }

    const runner = this.#getAssemblerRunner()
    return new ObjectBuilder({})
      .add('runner', runner)
      .add('onBuildStarting', this.#rcFile.assembler.onBuildStarting)
      .add('onBuildCompleted', this.#rcFile.assembler.onBuildCompleted)
      .add('onDevServerClosed', this.#rcFile.assembler.onDevServerClosed)
      .add('onDevServerClosing', this.#rcFile.assembler.onDevServerClosing)
      .add('onDevServerStarted', this.#rcFile.assembler.onDevServerStarted)
      .add('onDevServerStarting', this.#rcFile.assembler.onDevServerStarting)
      .toObject()
  }

  /**
   * Returns a normalized array of preload files
   */
  #getPreloads(): PreloadNode[] {
    return this.#rcFile.preloads.map((preload: PreloadNode | PreloadNode['file']) => {
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
   * Returns a normalized array of providers
   */
  #getProviders(): ProviderNode[] {
    return this.#rcFile.providers.map((provider: ProviderNode | ProviderNode['file']) => {
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
   * Returns a nornalized array of meta files
   */
  #getMetaFiles(): MetaFileNode[] {
    return this.#rcFile.metaFiles.map((pattern: MetaFileNode | string) => {
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
   * Returns a normalized array of test suites
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
   * Apply presets functions to the given rcFile
   */
  #applyPresets(rcFile: RcFile) {
    const presets: PresetFn[] = this.#rcFile.raw?.presets || []

    presets.forEach((preset) => preset({ rcFile }))
  }

  /**
   * Parse and validate file contents and merge them with defaults
   */
  parse(): RcFile {
    const assembler = this.#getAssembler()
    const assetsBundler = this.#getAssetsBundler()

    const rcFile = {
      typescript: this.#rcFile.typescript,
      ...(assembler ? { assembler } : {}),
      ...(assetsBundler !== undefined ? { assetsBundler } : {}),
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
      raw: this.#rcFile.raw,
    }

    this.#applyPresets(rcFile)
    return rcFile
  }
}
