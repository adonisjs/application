/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { cp, stat } from 'node:fs/promises'
import { fsReadAll } from '@poppinss/utils/fs'
import { RuntimeException } from '@poppinss/utils/exception'

import debug from '../debug.ts'
import { Stub } from './stub.ts'
import { type Application } from '../application.ts'
import { readFileFromSources } from '../utils.ts'

/**
 * StubsManager handles reading, copying, and building stubs from various sources.
 * Stubs are template files used for code generation in AdonisJS applications.
 *
 * The manager can source stubs from:
 * - Application's local stubs directory (publishTarget)
 * - Custom file system paths
 * - Package exports with stubsRoot
 *
 * @example
 * const stubsManager = new StubsManager(app, '/path/to/stubs')
 * const stub = await stubsManager.build('controller.stub')
 * const files = await stubsManager.copy('models', { pkg: '@adonisjs/lucid' })
 */
export class StubsManager {
  /**
   * Reference to the application instance for importing packages
   * and accessing application context.
   *
   * @private
   * @type {Application<any>}
   */
  #app: Application<any>

  /**
   * Absolute path to the directory where stubs should be published
   * or read from with highest priority. This is typically the
   * application's stubs directory.
   *
   * @private
   * @type {string}
   */
  #publishTarget: string

  /**
   * Creates a new StubsManager instance.
   *
   * @param {Application<any>} app - The application instance
   * @param {string} publishTarget - Absolute directory path where stubs should be published
   */
  constructor(app: Application<any>, publishTarget: string) {
    this.#app = app
    this.#publishTarget = publishTarget
  }

  /**
   * Resolves the stubs directory path from a package's main export.
   * The package must export a 'stubsRoot' variable pointing to its stubs directory.
   *
   * @private
   * @param {string} packageName - The name of the package to get stubs from
   * @returns {Promise<string>} Promise that resolves to the package's stubs directory path
   * @throws {RuntimeException} When package doesn't export stubsRoot
   */
  async #getPackageSource(packageName: string) {
    const pkgMainExports = await this.#app.import(packageName)
    if (!pkgMainExports.stubsRoot) {
      throw new RuntimeException(
        `Cannot resolve stubs from package "${packageName}". Make sure the package entrypoint exports "stubsRoot" variable`
      )
    }

    return pkgMainExports.stubsRoot
  }

  /**
   * Creates a Stub instance by locating and loading a stub file.
   * Searches in publishTarget first, then optional source or package locations.
   *
   * @param {string} stubName - Name of the stub file to build (e.g., 'controller.stub')
   * @param {Object} [options] - Optional configuration for stub source
   * @param {string} [options.source] - Custom file system path to search for stubs
   * @param {string} [options.pkg] - Package name to source stubs from
   * @returns {Promise<Stub>} Promise that resolves to a Stub instance
   * @throws {RuntimeException} When stub file cannot be found in any source
   */
  async build(stubName: string, options?: { source?: string; pkg?: string }) {
    const sources: string[] = [this.#publishTarget]

    /**
     * Push custom source (if defined)
     */
    if (options?.source) {
      sources.push(options.source)
    }

    /**
     * Push pkg source (if defined)
     */
    if (options?.pkg) {
      sources.push(await this.#getPackageSource(options.pkg))
    }

    debug('finding stub "%s" in sources "%O"', stubName, sources)

    /**
     * Attempt to read file from one of the available sources
     */
    const file = await readFileFromSources(stubName, sources)
    if (!file) {
      throw new RuntimeException(`Unable to find stub "${stubName}"`, {
        cause: `Scanned locations: \n${sources.join('\n')}`,
      })
    }

    debug('building stub "%s"', file.filePath)
    return new Stub(this.#app, file.contents, file.filePath)
  }

  /**
   * Copies stub files from a source location to the publish target directory.
   * Can copy individual files or entire directories recursively.
   *
   * @param {string} stubPath - Relative path to the stub file or directory to copy
   * @param {Object} options - Copy configuration options
   * @param {boolean} [options.overwrite] - Whether to overwrite existing files
   * @param {string} [options.source] - Source file system path (mutually exclusive with pkg)
   * @param {string} [options.pkg] - Package name to copy from (mutually exclusive with source)
   * @returns {Promise<string[]>} Promise that resolves to an array of copied file paths
   * @throws {Error} When source path cannot be found
   */
  async copy(
    stubPath: string,
    options: { overwrite?: boolean } & ({ source: string } | { pkg: string })
  ) {
    const filesCopied: string[] = []
    const copyOptions = {
      recursive: true,
      force: options.overwrite === true ? true : false,
    }

    /**
     * Getting the source absolute path
     */
    const source =
      'source' in options
        ? join(options.source, stubPath)
        : join(await this.#getPackageSource(options.pkg), stubPath)

    try {
      let files: string[] = []
      const sourceEntry = await stat(source)
      if (sourceEntry.isFile()) {
        if (source.endsWith('.stub')) {
          files = ['']
        }
      } else {
        files = await fsReadAll(source, {
          filter: (path) => path === '' || path.endsWith('.stub'),
        })
      }

      debug('copying stubs from "%s" with options %O', source, copyOptions)
      debug('preparing to copy stubs "%s"', files)

      /**
       * Copy all files one by one and maintain the files structure
       */
      for (let filePath of files) {
        const sourcePath = join(source, filePath)
        const destinationPath = join(this.#publishTarget, stubPath, filePath)
        await cp(sourcePath, destinationPath, copyOptions)
        filesCopied.push(destinationPath)
      }

      return filesCopied
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const readingSource = 'source' in options ? options.source : options.pkg
        throw new Error(`Cannot find "${stubPath}" stub in "${readingSource}" destination`)
      }
      throw error
    }
  }
}
