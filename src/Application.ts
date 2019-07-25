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
import { parse as parseVersion } from 'semver'

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
  public ready: boolean = false

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
  public version: SemverNode

  /**
   * `@adonisjs/core` version
   */
  public adonisVersion?: SemverNode

  constructor (
    public readonly appRoot: string,
    public container: IocContract,
    rcContents: any,
    adonisVersion: string,
  ) {
    const parsed = parse(rcContents)
    this.appName = 'adonis-app'

    this.version = this._parseVersion('0.0.0')
    this.adonisVersion = adonisVersion ? this._parseVersion(adonisVersion) : undefined

    this.exceptionHandlerNamespace = parsed.exceptionHandlerNamespace
    this.preloads = parsed.preloads
    this.directoriesMap = new Map(Object.entries(parsed.directories))
    this.autoloadsMap = new Map(Object.entries(parsed.autoloads))

    this._setEnvVars()
    this._bindToContainer()
  }

  /**
   * Parses version string to an object.
   */
  private _parseVersion (version: string): SemverNode {
    const parsed = parseVersion(version, { includePrerelease: true, loose: false })!
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
    process.env.APP_VERSION = this.version.version
  }

  /**
   * Binds self to the AdonisJs IoC container
   */
  private _bindToContainer () {
    this.container.singleton('Application', () => this)
  }

  /**
   * Make path to a file or directory relative from
   * the application path
   */
  public makePath (...paths: string[]): string {
    return join(this.appRoot, ...paths)
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
