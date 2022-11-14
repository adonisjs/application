/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'semver'
import type { SemverNode } from '../types.js'
import { readFileOptional } from '../helpers.js'

/**
 * MetadataManager is used to load the metadata for the application.
 *
 * It reads the application package.json and the "@adonisjs/core" package.json
 * to read the version numbers, app name and app engines.
 */
export class MetaDataManager {
  #appRoot: URL

  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * The defined engines inside the "package.json" file
   */
  engines: Record<string, any> = {}

  /**
   * The application name defined inside the "package.json" file
   */
  appName: string = 'adonis-app'

  /**
   * The parsed version of the application defined in the "package.json"
   * file
   */
  version: SemverNode | null = null

  /**
   * The parsed version of the AdonisJS framework core
   */
  adonisVersion: SemverNode | null = null

  /**
   * Parses the version number using the semver formatting
   */
  #parseVersionNumber(version?: string): SemverNode | null {
    const parsed = parse(version)
    if (!parsed) {
      return null
    }

    return {
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease.map((release) => release),
      version: parsed.version,
      toString() {
        return this.version
      },
    }
  }

  /**
   * Parses the application "package.json" file and extracts the
   * app name, version and the engines.
   */
  async #parseAppPackageJsonFile() {
    const contents = await readFileOptional(new URL('./package.json', this.#appRoot))
    const appPackageJson = contents ? JSON.parse(contents) : {}

    this.appName = appPackageJson.name || 'adonisjs_app'
    this.version = this.#parseVersionNumber(appPackageJson.version) || null
    this.engines = appPackageJson.engines || {}
  }

  /**
   * Parses the adonisjs/core "packages.json" file and extracts
   * the package version.
   */
  async #parseCorePackageJsonFile() {
    const contents = await readFileOptional(new URL('@adonisjs/core/package.json', this.#appRoot))
    const corePackageJson = contents ? JSON.parse(contents) : null

    this.version = this.#parseVersionNumber(corePackageJson.version) || null
  }

  /**
   * Parse application and the framework core package.json files.
   */
  async process() {
    await this.#parseAppPackageJsonFile()
    await this.#parseCorePackageJsonFile()
  }
}
