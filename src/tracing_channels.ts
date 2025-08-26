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
 * Traces service provider lifecycle hooks
 */
export const providerRegister = diagnostics_channel.tracingChannel<
  'adonisjs.provider.register',
  ContainerProviderContract
>('adonisjs.provider.register')

export const providerBoot = diagnostics_channel.tracingChannel<
  'adonisjs.provider.boot',
  ContainerProviderContract
>('adonisjs.provider.boot')

export const providerStart = diagnostics_channel.tracingChannel<
  'adonisjs.provider.start',
  ContainerProviderContract
>('adonisjs.provider.start')

export const providerReady = diagnostics_channel.tracingChannel<
  'adonisjs.provider.ready',
  ContainerProviderContract
>('adonisjs.provider.ready')

export const providerShutdown = diagnostics_channel.tracingChannel<
  'adonisjs.provider.shutdown',
  ContainerProviderContract
>('adonisjs.provider.shutdown')
