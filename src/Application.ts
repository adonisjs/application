/*
 * @adonisjs/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/application.ts" />

import {
	RcFile,
	SemverNode,
	PreloadNode,
	ApplicationContract,
	AppEnvironments,
} from '@ioc:Adonis/Core/Application'

import { join } from 'path'
import { parse as semverParse } from 'semver'
import { IocContract } from '@adonisjs/fold'

import { parse } from './rcParser'

/**
 * Aliases for different environments
 */
const DEV_ENVS = ['dev', 'develop', 'development']
const STAGING_ENVS = ['stage', 'staging']
const PROD_ENVS = ['prod', 'production']
const TEST_ENVS = ['test', 'testing']

/**
 * The main application instance to know about the environment, filesystem
 * in which your AdonisJs app is running
 */
export class Application implements ApplicationContract {
	private cachedNodeEnv?: string

	/**
	 * A boolean to know if application has bootstrapped successfully
	 */
	public isReady: boolean = false

	/**
	 * Current working directory for the CLI and not the build directory
	 * The `ADONIS_CLI_CWD` is set by the cli
	 */
	public readonly cliCwd?: string = process.env.ADONIS_ACE_CWD

	/**
	 * A boolean to know if application has received a shutdown signal
	 * like `SIGINT` or `SIGTERM`.
	 */
	public isShuttingDown: boolean = false

	/**
	 * The environment in which application is running
	 */
	public environment: AppEnvironments = 'unknown'

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
	public directoriesMap: Map<string, string> = new Map()

	/**
	 * A map of directories aliases
	 */
	public aliasesMap: Map<string, string> = new Map()

	/**
	 * A map of namespaces that different parts of apps
	 * can use
	 */
	public namespacesMap: Map<string, string> = new Map()

	/**
	 * The application version. Again picked from `.adonisrc.json` file
	 */
	public readonly version: SemverNode | null

	/**
	 * `@adonisjs/core` version
	 */
	public readonly adonisVersion: SemverNode | null

	/**
	 * Reference to fully parser rcFile
	 */
	public readonly rcFile: RcFile

	/**
	 * The typescript flag indicates a couple of things, which can help tweak the tooling
	 * and runtime behavior of the application as well.
	 *
	 * 1. When `typescript=true`, it means that the project is written using typescript.
	 * 2. After compiling to Javascript, AdonisJs will set this value to `false` in the build folder.
	 * 3. At runtime when `typescript=true`, it means the app is using ts-node to start.
	 */
	public readonly typescript: boolean

	constructor(
		public readonly appRoot: string,
		public container: IocContract,
		rcContents: { [key: string]: any },
		pkgFile: Partial<
			{ name: string; version: string; adonisVersion: string } & { [key: string]: any }
		>
	) {
		this.rcFile = parse(rcContents)

		this.typescript = this.rcFile.typescript

		/**
		 * Fetching following info from the package file
		 */
		this.appName = pkgFile.name || 'adonis-app'
		this.version = this.parseVersion(pkgFile.version || '0.0.0')
		this.adonisVersion = pkgFile.adonisVersion ? this.parseVersion(pkgFile.adonisVersion) : null

		/**
		 * Fetching following info from the `.adonisrc.json` file.
		 */
		this.exceptionHandlerNamespace = this.rcFile.exceptionHandlerNamespace
		this.preloads = this.rcFile.preloads
		this.directoriesMap = new Map(Object.entries(this.rcFile.directories))
		this.aliasesMap = new Map(Object.entries(this.rcFile.aliases))
		this.namespacesMap = new Map(Object.entries(this.rcFile.namespaces))

		this.setEnvVars()
	}

	/**
	 * Parses version string to an object.
	 */
	private parseVersion(version: string): SemverNode | null {
		const parsed = semverParse(version)
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
	 * Sets env variables based upon the provided application info.
	 */
	private setEnvVars() {
		process.env.APP_NAME = this.appName
		if (this.version) {
			process.env.APP_VERSION = this.version.version
		}
	}

	/**
	 * Normalizes node env
	 */
	private normalizeNodeEnv(env: string) {
		env = env.toLowerCase()

		if (DEV_ENVS.includes(env)) {
			return 'development'
		}

		if (STAGING_ENVS.includes(env)) {
			return 'staging'
		}

		if (PROD_ENVS.includes(env)) {
			return 'production'
		}

		if (TEST_ENVS.includes(env)) {
			return 'testing'
		}

		return env
	}

	/**
	 * The environment in which application is running
	 */
	public get nodeEnvironment(): string {
		/**
		 * If nodeEnv is undefined, then attempt to read the value from `NODE_ENV`
		 * and cache it (if defined)
		 */
		if (this.cachedNodeEnv === undefined && process.env.NODE_ENV) {
			this.cachedNodeEnv = this.normalizeNodeEnv(process.env.NODE_ENV)
		}

		/**
		 * If still undefined
		 */
		if (this.cachedNodeEnv === undefined) {
			return 'unknown'
		}

		return this.cachedNodeEnv
	}

	/**
	 * Return true when `this.nodeEnvironment === 'production'`
	 */
	public get inProduction(): boolean {
		return this.nodeEnvironment === 'production'
	}

	/**
	 * Opposite of [[this.isProduction]]
	 */
	public get inDev(): boolean {
		return !this.inProduction
	}

	/**
	 * Returns path for a given namespace by replacing the base namespace
	 * with the defined directories map inside the rc file.
	 */
	public resolveNamespaceDirectory(namespaceFor: string): string | null {
		/**
		 * Return null when rcfile doesn't have a special
		 * entry for namespaces
		 */
		if (!this.rcFile.namespaces[namespaceFor]) {
			return null
		}

		let output: string | null = null

		Object.keys(this.rcFile.aliases).forEach((baseNamespace) => {
			const autoloadPath = this.rcFile.aliases[baseNamespace]
			if (
				this.rcFile.namespaces[namespaceFor].startsWith(`${baseNamespace}/`) ||
				this.rcFile.namespaces[namespaceFor] === baseNamespace
			) {
				output = this.rcFile.namespaces[namespaceFor].replace(baseNamespace, autoloadPath)
			}
		})

		return output
	}

	/**
	 * Make path to a file or directory relative from
	 * the application path
	 */
	public makePath(...paths: string[]): string {
		return join(this.appRoot, ...paths)
	}

	/**
	 * Makes the path to a directory from `cliCwd` vs the `appRoot`. This is
	 * helpful when we want path inside the project root and not the
	 * build directory
	 */
	public makePathFromCwd(...paths: string[]): string {
		return join(this.cliCwd || this.appRoot, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the config directory
	 */
	public configPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('config')!, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the public path
	 */
	public publicPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('public')!, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the database path
	 */
	public databasePath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('database')!, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the migrations path
	 */
	public migrationsPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('migrations')!, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the seeds path
	 */
	public seedsPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('seeds')!, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the resources path
	 */
	public resourcesPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('resources')!, ...paths)
	}

	/**
	 * Make path to a file or directory relative from
	 * the views path
	 */
	public viewsPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('views')!, ...paths)
	}

	/**
	 * Makes path to the start directory
	 */
	public startPath(...paths: string[]): string {
		return this.makePath(this.directoriesMap.get('start')!, ...paths)
	}

	/**
	 * Makes path to the tmp directory. Since the tmp path is used for
	 * writing at the runtime, we use `cwd` path to the write to the
	 * source and not the build directory.
	 */
	public tmpPath(...paths: string[]): string {
		return this.makePathFromCwd(this.directoriesMap.get('tmp')!, ...paths)
	}

	/**
	 * Serialized output
	 */
	public toJSON() {
		return {
			isReady: this.isReady,
			isShuttingDown: this.isShuttingDown,
			environment: this.environment,
			nodeEnvironment: this.nodeEnvironment,
			appName: this.appName,
			version: this.version ? this.version.toString() : null,
			adonisVersion: this.adonisVersion ? this.adonisVersion.toString() : null,
		}
	}
}
