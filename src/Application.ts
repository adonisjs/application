/**
 * @module @poppinss/application
 */

/*
* @poppinss/application
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join } from 'path'
import { IocContract } from '@adonisjs/fold'
import { coerce } from 'semver'

import { parse } from './rcParser'
import { PreloadNode, ApplicationContract, SemverNode } from './contracts'

/**
 * The main application instance to know about the environment, filesystem
 * in which your AdonisJs app is running
 */
export class Application implements ApplicationContract {
  /**
   * A boolean to know if application has bootstrapped successfully
   */
  public isReady: boolean = false

  /**
   * Current working directory for the CLI and not the build directory
   * The `ADONIS_CLI_CWD` is set by the cli
   */
  public readonly cliCwd?: string = process.env.ADONIS_CLI_CWD

  /**
   * A boolean to know if application has received a shutdown signal
   * like `SIGINT` or `SIGTERM`.
   */
  public isShuttingDown: boolean = false

  /**
   * Is current environment production.
   */
  public inProduction: boolean = process.env.NODE_ENV === 'production'

  /**
   * Inverse of `inProduction`
   */
  public inDev: boolean = !this.inProduction

  /**
   * The environment in which application is running
   */
  public environment: 'web' | 'console' | 'test' | 'unknown' = 'unknown'

  /**
   * The name of the application picked from `.adonisrc.json` file. This can
   * be used to prefix logs.
   */
  public readonly appName: string

  /**
   * The namespace of exception handler that will handle exceptions
   */
  public exceptionHandlerNamespace: string

  /**
   * A array of files to be preloaded
   */
  public preloads: PreloadNode[] = []

  /**
   * A map of pre-configured directories
   */
  public directoriesMap: Map<(string), string> = new Map()

  /**
   * A map of directories to autoload (aka alias)
   */
  public autoloadsMap: Map<string, string> = new Map()

  /**
   * The application version. Again picked from `.adonisrc.json` file
   */
  public readonly version: SemverNode | null

  /**
   * `@adonisjs/core` version
   */
  public readonly adonisVersion: SemverNode | null

  constructor (
    public readonly appRoot: string,
    public container: IocContract,
    rcContents: any,
    pkgFile: Partial<{ name: string, version: string, dependencies: any } & { [key: string]: any }>,
  ) {
    const parsed = parse(rcContents)

    /**
     * Fetching following info from the package file
     */
    this.appName = pkgFile.name || 'adonis-app'
    this.version = this._parseVersion(pkgFile.version || '0.0.0')
    this.adonisVersion = (pkgFile.dependencies && pkgFile.dependencies['@adonisjs/core'])
      ? this._parseVersion(pkgFile.dependencies['@adonisjs/core'])
      : null

    /**
     * Fetching following info from the `.adonisrc.json` file.
     */
    this.exceptionHandlerNamespace = parsed.exceptionHandlerNamespace
    this.preloads = parsed.preloads
    this.directoriesMap = new Map(Object.entries(parsed.directories))
    this.autoloadsMap = new Map(Object.entries(parsed.autoloads))

    this._setEnvVars()
  }

  /**
   * Parses version string to an object.
   */
  private _parseVersion (version: string): SemverNode | null {
    const parsed = coerce(version)
    if (!parsed) {
      return null
    }

    return {
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease.map((release) => release),
      version: parsed.version,
    }
  }

  /**
   * Sets env variables based upon the provided application info.
   */
  private _setEnvVars () {
    process.env.APP_NAME = this.appName
    if (this.version) {
      process.env.APP_VERSION = this.version.version
    }
  }

  /**
   * Make path to a file or directory relative from
   * the application path
   */
  public makePath (...paths: string[]): string {
    return join(this.appRoot, ...paths)
  }

  /**
   * Makes the path to a directory from `cliCwd` vs the `appRoot`. This is
   * helpful when we want path inside the project root and not the
   * build directory
   */
  public makePathFromCwd (...paths: string[]): string {
    return join(this.cliCwd || this.appRoot, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the config directory
   */
  public configPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('config')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the public path
   */
  public publicPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('public')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the database path
   */
  public databasePath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('database')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the migrations path
   */
  public migrationsPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('migrations')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the seeds path
   */
  public seedsPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('seeds')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the resources path
   */
  public resourcesPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('resources')!, ...paths)
  }

  /**
   * Make path to a file or directory relative from
   * the views path
   */
  public viewsPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('views')!, ...paths)
  }

  /**
   * Makes path to the start directory
   */
  public startPath (...paths: string[]): string {
    return this.makePath(this.directoriesMap.get('start')!, ...paths)
  }
}
