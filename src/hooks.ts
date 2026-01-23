/*
 * @adonisjs/assembler
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type AsyncOrSync } from '@poppinss/utils/types'
import { type AllHooks, type HookParams } from '@adonisjs/assembler/types'

/**
 * Collection of hooks that can be used to listen for various events during
 * the application lifecycle. These hooks allow you to execute custom logic
 * at specific points in the development server, build process, and testing.
 *
 * @example
 * const { hooks } = await import('@adonisjs/application')
 *
 * hooks.init((app) => {
 *   console.log('Application initialized')
 * })
 *
 * hooks.devServerStarted((server) => {
 *   console.log('Dev server started on port', server.port)
 * })
 */
export const hooks: {
  [K in keyof AllHooks]: (
    callback: (...args: HookParams<K>) => AsyncOrSync<void>
  ) => (...args: HookParams<K>) => AsyncOrSync<void>
} = {
  /**
   * Hook called during application initialization. This is the first hook
   * that gets executed when the assembler starts up.
   *
   * @param callback - Function to execute when the init event occurs
   *
   * @example
   * hooks.init((app) => {
   *   console.log('Application is initializing')
   *   // Setup global configurations
   * })
   */
  init(callback) {
    return callback
  },
  /**
   * Hook called after routes have been committed to the router.
   * This occurs after all route definitions have been processed.
   *
   * @param callback - Function to execute when routes are committed
   *
   * @example
   * hooks.routesCommitted((router) => {
   *   console.log('All routes have been committed to the router')
   *   // Perform route-based setup
   * })
   */
  routesCommitted(callback) {
    return callback
  },
  /**
   * Hook called when the assembler starts scanning for route files.
   * This happens before any route files are actually processed.
   *
   * @param callback - Function to execute when route scanning begins
   *
   * @example
   * hooks.routesScanning(() => {
   *   console.log('Starting to scan for route files')
   *   // Setup route scanning configurations
   * })
   */
  routesScanning(callback) {
    return callback
  },
  /**
   * Hook called after all route files have been scanned and processed.
   * This occurs once the route scanning phase is complete.
   *
   * @param callback - Function to execute when route scanning is finished
   *
   * @example
   * hooks.routesScanned((scannedRoutes) => {
   *   console.log('Route scanning completed')
   *   // Process scanned route information
   * })
   */
  routesScanned(callback) {
    return callback
  },
  /**
   * Hook called when a file is modified during development.
   * This is triggered by the file watcher when changes are detected.
   *
   * @param callback - Function to execute when a file changes
   *
   * @example
   * hooks.fileChanged((filePath, stats) => {
   *   console.log(`File changed: ${filePath}`)
   *   // Handle file change logic
   * })
   */
  fileChanged(callback) {
    return callback
  },
  /**
   * Hook called when a new file is added during development.
   * This is triggered by the file watcher when new files are created.
   *
   * @param callback - Function to execute when a file is added
   *
   * @example
   * hooks.fileAdded((filePath, stats) => {
   *   console.log(`New file added: ${filePath}`)
   *   // Handle new file logic
   * })
   */
  fileAdded(callback) {
    return callback
  },
  /**
   * Hook called when a file is removed during development.
   * This is triggered by the file watcher when files are deleted.
   *
   * @param callback - Function to execute when a file is removed
   *
   * @example
   * hooks.fileRemoved((filePath) => {
   *   console.log(`File removed: ${filePath}`)
   *   // Handle file removal logic
   * })
   */
  fileRemoved(callback) {
    return callback
  },
  /**
   * Hook called when the development server is about to start.
   * This occurs before the server begins listening for connections.
   *
   * @param callback - Function to execute when dev server is starting
   *
   * @example
   * hooks.devServerStarting((server) => {
   *   console.log('Development server is starting')
   *   // Setup server configurations
   * })
   */
  devServerStarting(callback) {
    return callback
  },
  /**
   * Hook called after the development server has successfully started.
   * This occurs once the server is listening and ready to accept requests.
   *
   * @param callback - Function to execute when dev server has started
   *
   * @example
   * hooks.devServerStarted((server) => {
   *   console.log(`Development server started on port ${server.port}`)
   *   // Notify external services or open browser
   * })
   */
  devServerStarted(callback) {
    return callback
  },
  /**
   * Hook called when the build process is about to start.
   * This occurs before any build tasks are executed.
   *
   * @param callback - Function to execute when build is starting
   *
   * @example
   * hooks.buildStarting((buildConfig) => {
   *   console.log('Build process is starting')
   *   // Setup build configurations or clean directories
   * })
   */
  buildStarting(callback) {
    return callback
  },
  /**
   * Hook called after the build process has completed.
   * This occurs once all build tasks have finished executing.
   *
   * @param callback - Function to execute when build is finished
   *
   * @example
   * hooks.buildFinished((buildResult) => {
   *   console.log('Build process completed')
   *   // Deploy artifacts or notify build completion
   * })
   */
  buildFinished(callback) {
    return callback
  },
  /**
   * Hook called when the test suite is about to start.
   * This occurs before any test files are executed.
   *
   * @param callback - Function to execute when tests are starting
   *
   * @example
   * hooks.testsStarting((testConfig) => {
   *   console.log('Test suite is starting')
   *   // Setup test database or mock services
   * })
   */
  testsStarting(callback) {
    return callback
  },
  /**
   * Hook called after the test suite has completed.
   * This occurs once all test files have finished executing.
   *
   * @param callback - Function to execute when tests are finished
   *
   * @example
   * hooks.testsFinished((testResults) => {
   *   console.log('Test suite completed')
   *   // Generate test reports or cleanup test resources
   * })
   */
  testsFinished(callback) {
    return callback
  },
}
