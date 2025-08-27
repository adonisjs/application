/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import diagnostics_channel from 'node:diagnostics_channel'
import { type ContainerProviderContract } from './types.ts'

/**
 * Tracing channel for service provider register lifecycle hook.
 * This channel traces when a provider's register() method is called during
 * the application initialization phase.
 *
 * @example
 * // Subscribe to register events
 * providerRegister.subscribe({
 *   start(provider) {
 *     console.log('Provider registering:', provider.constructor.name)
 *   },
 *   end(provider) {
 *     console.log('Provider registered:', provider.constructor.name)
 *   }
 * })
 */
export const providerRegister = diagnostics_channel.tracingChannel<
  'adonisjs.provider.register',
  ContainerProviderContract
>('adonisjs.provider.register')

/**
 * Tracing channel for service provider boot lifecycle hook.
 * This channel traces when a provider's boot() method is called during
 * the application boot phase, after all providers have been registered.
 *
 * @example
 * // Monitor boot performance
 * providerBoot.subscribe({
 *   asyncStart(provider) {
 *     console.time(`boot-${provider.constructor.name}`)
 *   },
 *   asyncEnd(provider) {
 *     console.timeEnd(`boot-${provider.constructor.name}`)
 *   }
 * })
 */
export const providerBoot = diagnostics_channel.tracingChannel<
  'adonisjs.provider.boot',
  ContainerProviderContract
>('adonisjs.provider.boot')

/**
 * Tracing channel for service provider start lifecycle hook.
 * This channel traces when a provider's start() method is called during
 * the application start phase, after all providers have been booted.
 *
 * @example
 * // Track provider startup order
 * const startupOrder: string[] = []
 * providerStart.subscribe({
 *   asyncStart(provider) {
 *     startupOrder.push(provider.constructor.name)
 *   }
 * })
 */
export const providerStart = diagnostics_channel.tracingChannel<
  'adonisjs.provider.start',
  ContainerProviderContract
>('adonisjs.provider.start')

/**
 * Tracing channel for service provider ready lifecycle hook.
 * This channel traces when a provider's ready() method is called after
 * the application is fully ready and serving requests.
 *
 * @example
 * // Log when providers are ready
 * providerReady.subscribe({
 *   asyncStart(provider) {
 *     console.log('Provider ready:', provider.constructor.name)
 *   },
 *   error(provider, error) {
 *     console.error('Provider ready failed:', provider.constructor.name, error)
 *   }
 * })
 */
export const providerReady = diagnostics_channel.tracingChannel<
  'adonisjs.provider.ready',
  ContainerProviderContract
>('adonisjs.provider.ready')

/**
 * Tracing channel for service provider shutdown lifecycle hook.
 * This channel traces when a provider's shutdown() method is called during
 * graceful application termination.
 *
 * @example
 * // Monitor shutdown process
 * providerShutdown.subscribe({
 *   asyncStart(provider) {
 *     console.log('Provider shutting down:', provider.constructor.name)
 *   },
 *   asyncEnd(provider) {
 *     console.log('Provider shutdown complete:', provider.constructor.name)
 *   },
 *   error(provider, error) {
 *     console.error('Provider shutdown error:', provider.constructor.name, error)
 *   }
 * })
 */
export const providerShutdown = diagnostics_channel.tracingChannel<
  'adonisjs.provider.shutdown',
  ContainerProviderContract
>('adonisjs.provider.shutdown')
