/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { outputFile } from 'fs-extra'
import { fileURLToPath } from 'node:url'
import lodash from '@poppinss/utils/lodash'
import type { AppEnvironments, PreloadNode, ProviderNode, RcFile } from '../types.js'

/**
 * The RcFile editor class exposes the API to edit and save the ".adonisrc.json"
 * file. The formatting and whitespaces are not retained during the edit.
 */
export class RcFileEditor {
  #rcFile: Partial<RcFile>
  #filePath: URL

  constructor(filePath: URL, rcFile: Record<string, any>) {
    this.#filePath = filePath
    this.#rcFile = rcFile
  }

  /**
   * Check if environments array has a subset of available environments
   */
  #isInSpecificEnvironment(environments?: AppEnvironments[]): boolean {
    if (!environments) {
      return false
    }

    return !!(['web', 'console', 'test', 'repl'] as const).find(
      (env) => !environments.includes(env)
    )
  }

  /**
   * Add command to rcFile
   */
  addCommand(commandPath: string): this {
    this.#rcFile.commands = this.#rcFile.commands || []
    let entryIndex = this.#rcFile.commands.findIndex((command) => {
      return command === commandPath
    })

    entryIndex = entryIndex === -1 ? this.#rcFile.commands.length : entryIndex
    lodash.set(this.#rcFile.commands, entryIndex, commandPath)

    return this
  }

  /**
   * Add provider to rcFile
   */
  addProvider(providerPath: string, environments?: ProviderNode['environment']): this {
    this.#rcFile.providers = this.#rcFile.providers || []
    let entryIndex = this.#rcFile.providers.findIndex((provider) => {
      return typeof provider === 'string'
        ? provider === providerPath
        : provider.file === providerPath
    })

    entryIndex = entryIndex === -1 ? this.#rcFile.providers.length : entryIndex

    if (this.#isInSpecificEnvironment(environments)) {
      lodash.set(this.#rcFile.providers, entryIndex, {
        file: providerPath,
        environment: environments,
      })
    } else {
      lodash.set(this.#rcFile.providers, entryIndex, providerPath)
    }

    return this
  }

  /**
   * Add preload file to rcFile
   */
  addPreloadFile(modulePath: string, environments?: PreloadNode['environment']): this {
    this.#rcFile.preloads = this.#rcFile.preloads || []
    let entryIndex = this.#rcFile.preloads.findIndex((preloadFile) => {
      return typeof preloadFile === 'string'
        ? preloadFile === modulePath
        : preloadFile.file === modulePath
    })

    entryIndex = entryIndex === -1 ? this.#rcFile.preloads.length : entryIndex

    if (this.#isInSpecificEnvironment(environments)) {
      lodash.set(this.#rcFile.preloads, entryIndex, {
        file: modulePath,
        environment: environments,
      })
    } else {
      lodash.set(this.#rcFile.preloads, entryIndex, modulePath)
    }

    return this
  }

  /**
   * Add meta file to rcFile
   */
  addMetaFile(globPattern: string, reloadServer: boolean = false): this {
    this.#rcFile.metaFiles = this.#rcFile.metaFiles || []
    let entryIndex = this.#rcFile.metaFiles.findIndex((metaFile) => {
      return metaFile.pattern === globPattern
    })

    entryIndex = entryIndex === -1 ? this.#rcFile.metaFiles.length : entryIndex
    lodash.set(this.#rcFile.metaFiles, entryIndex, {
      pattern: globPattern,
      reloadServer: reloadServer,
    })

    return this
  }

  /**
   * Set directory name and path
   */
  setDirectory(key: string, value: string): this {
    lodash.set(this.#rcFile, `directories.${key}`, value)
    return this
  }

  /**
   * Set command alias
   */
  setCommandAlias(alias: string, command: string): this {
    lodash.set(this.#rcFile, `commandAliases.${alias}`, command)
    return this
  }

  /**
   * Add a new tests suite to the rcFile
   */
  addSuite(suiteName: string, files: string | string[], timeout?: number) {
    this.#rcFile.tests = this.#rcFile.tests || { suites: [], forceExit: true, timeout: 2000 }

    let entryIndex = this.#rcFile.tests.suites.findIndex((metaFile) => {
      return metaFile.name === suiteName
    })

    entryIndex = entryIndex === -1 ? this.#rcFile.tests.suites.length : entryIndex
    lodash.set(this.#rcFile.tests.suites, entryIndex, {
      name: suiteName,
      files,
      timeout,
    })

    return this
  }

  toJSON() {
    return this.#rcFile
  }

  /**
   * Writes updated rcFile to the disk
   */
  async save() {
    await outputFile(fileURLToPath(this.#filePath), JSON.stringify(this.toJSON()))
  }
}
