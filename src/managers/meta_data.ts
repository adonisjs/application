/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url'
import { parse, satisfies } from 'semver'
import { readFile } from 'node:fs/promises'
import type { SemverNode } from '../types.js'
import { resolveOptional } from '../helpers.js'
import { UnsupportedNodeVersion } from '../exceptions/unsupported_node_version.js'

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
  appName: string = 'adonisjs_app'

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
    /**
     * Optionally resolve module
     */
    const resolvedPath = await resolveOptional('./package.json', this.#appRoot)
    if (!resolvedPath) {
      return
    }

    const contents = await readFile(fileURLToPath(resolvedPath), 'utf-8')
    const appPackageJson = JSON.parse(contents)

    this.appName = appPackageJson.name || 'adonisjs_app'
    this.version = this.#parseVersionNumber(appPackageJson.version) || null
    this.engines = appPackageJson.engines || {}
  }

  /**
   * Parses the adonisjs/core "packages.json" file and extracts
   * the package version.
   */
  async #parseCorePackageJsonFile() {
    const resolvedPath = await resolveOptional('@adonisjs/core/package.json', this.#appRoot)
    if (!resolvedPath) {
      return
    }

    const contents = await readFile(fileURLToPath(resolvedPath), 'utf-8')
    const corePackageJson = JSON.parse(contents)

    this.adonisVersion = this.#parseVersionNumber(corePackageJson.version) || null
  }

  /**
   * Parse application and the framework core package.json files.
   */
  async process() {
    await this.#parseAppPackageJsonFile()
    await this.#parseCorePackageJsonFile()
  }

  /**
   * Verify the current node.js process against the defined
   * engine in the package.json file.
   */
  async verifyNodeEngine() {
    const nodeEngine = this.engines.node
    if (!nodeEngine) {
      return
    }

    if (!satisfies(process.version, nodeEngine)) {
      throw new UnsupportedNodeVersion(
        `The installed Node.js version "${process.version}" does not satisfy the expected Node.js version "${nodeEngine}" defined inside package.json file`
      )
    }
  }

  /**
   * Adds metadata about the app to the process.env
   */
  addMetaDataToEnv() {
    process.env.APP_NAME = this.appName
    if (this.version) {
      process.env.APP_VERSION = this.version.toString()
    }

    if (this.adonisVersion) {
      process.env.ADONIS_VERSION = this.adonisVersion.toString()
    }
  }
}
