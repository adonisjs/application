/*
 * @adonisjs/app
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { copy } from 'fs-extra'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { RuntimeException, fsReadAll, slash } from '@poppinss/utils'

import debug from '../debug.js'
import { Stub } from './stub.js'
import { Application } from '../application.js'
import { readFileFromSources, resolveOptional } from '../helpers.js'

/**
 * Stub Manager is used to read and copy stubs from different sources. Also
 * allows creating resources from pre-existing stubs
 */
export class StubsManager {
  #app: Application<any, any>

  /**
   * Absolute path to the directory where stubs should
   * be published or read from with priority
   */
  #publishTarget: string

  constructor(app: Application<any, any>, publishTarget: string) {
    this.#app = app
    this.#publishTarget = publishTarget
  }

  /**
   * Returns the path to the stubs source directory of a package
   */
  async #getPackageSource(packageName: string) {
    const packageJSON = await resolveOptional(
      slash(join(packageName, 'package.json')),
      this.#app.appRoot
    )
    if (!packageJSON) {
      throw new RuntimeException(
        `Cannot resolve stubs from package "${packageName}". Make sure the package exports the "package.json" file via exports map`
      )
    }

    return join(dirname(fileURLToPath(packageJSON)), 'stubs')
  }

  /**
   * Create an instance of stub by its name. The lookup is performed inside
   * the publishTarget and the optional source or pkg destination.
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
   * Copy one or more stub files from a custom location to publish
   * target.
   */
  async copy(
    stubPath: string,
    options: { overwrite?: boolean } & ({ source: string } | { pkg: string })
  ) {
    const filesCopied: string[] = []
    const copyOptions = {
      recursive: true,
      overwrite: options.overwrite === true ? true : false,
    }

    /**
     * Getting the source absolute path
     */
    const source =
      'source' in options
        ? join(options.source, stubPath)
        : join(await this.#getPackageSource(options.pkg), stubPath)

    const files = await fsReadAll(source, {
      filter: (path) => path === '' || path.endsWith('.stub'),
    })

    debug('copying stubs from "%s" with options %O', source, copyOptions)
    debug('preparing to copy stubs "%s"', files)

    /**
     * Copy all files one by one and maintain the files structure
     */
    for (let filePath of files) {
      const sourcePath = join(source, filePath)
      const destinationPath = join(this.#publishTarget, stubPath, filePath)
      await copy(sourcePath, destinationPath, copyOptions)
      filesCopied.push(destinationPath)
    }

    return filesCopied
  }
}
