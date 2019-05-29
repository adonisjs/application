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
import { PreloadNode, ApplicationContract } from './contracts'
import { parse } from './rcParser'

/**
 * The main application instance to know about the environment, filesystem
 * in which your AdonisJs app is running
 */
export class Application implements ApplicationContract {
  public ready: boolean = false
  public inProduction: boolean = process.env.NODE_ENV === 'production'
  public inDev: boolean = !this.inProduction
  public environment: 'web' | 'console' | 'test' | 'unknown' = 'unknown'

  public readonly appName: string
  public exceptionHandlerNamespace: string
  public preloads: PreloadNode[] = []
  public directoriesMap: Map<(string), string> = new Map()
  public autoloadsMap: Map<string, string> = new Map()

  constructor (
    public readonly version: string,
    public readonly appRoot: string,
    public container: IocContract,
    rcContents: any,
  ) {
    const parsed = parse(rcContents)
    this.appName = parsed.name
    this.exceptionHandlerNamespace = parsed.exceptionHandlerNamespace
    this.preloads = parsed.preloads
    this.directoriesMap = new Map(Object.entries(parsed.directories))
    this.autoloadsMap = new Map(Object.entries(parsed.autoloads))
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
