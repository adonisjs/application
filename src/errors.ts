/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError } from '@poppinss/utils'

/**
 * The exception is raised when the "pattern" property is missing
 * in the meta file object.
 */
export const E_MISSING_METAFILE_PATTERN = createError<[fileProperty: string]>(
  'Invalid metafile entry "%s". Missing pattern property',
  'E_MISSING_METAFILE_PATTERN'
)

/**
 * The exception is raised when the "file" property is missing
 * in the preload file object
 */
export const E_MISSING_PRELOAD_FILE = createError<[preloadProperty: string]>(
  'Invalid preload entry "%s". Missing file property',
  'E_MISSING_PRELOAD_FILE'
)

/**
 * The exception is raised when the "file" property is not a function
 */
export const E_INVALID_PRELOAD_FILE = createError<[preloadProperty: string]>(
  'Invalid preload entry "%s". The file property must be a function',
  'E_INVALID_PRELOAD_FILE'
)

/**
 * The exception is raised when the "file" property is missing
 * in the provider object
 */
export const E_MISSING_PROVIDER_FILE = createError<[preloadProperty: string]>(
  'Invalid provider entry "%s". Missing file property',
  'E_MISSING_PROVIDER_FILE'
)

/**
 * The exception is raised when the "file" property is not a function
 * in provider object
 */
export const E_INVALID_PROVIDER = createError<[preloadProperty: string]>(
  'Invalid provider entry "%s". The file property must be a function',
  'E_INVALID_PROVIDER'
)

/**
 * The exception is raised when the "name" property is missing
 * in the suite object
 */
export const E_MISSING_SUITE_NAME = createError<[suiteProperty: string]>(
  'Invalid suite entry "%s". Missing name property',
  'E_MISSING_SUITE_NAME'
)

/**
 * The exception is raised when the "files" property is missing
 * in the suite object
 */
export const E_MISSING_SUITE_FILES = createError<[suiteProperty: string]>(
  'Invalid suite entry "%s". Missing files property',
  'E_MISSING_SUITE_FILES'
)

/**
 * The exception is raised when the "devServerCommand" is missing
 * in assetsBundler object
 */
export const E_MISSING_BUNDLER_DEV_COMMAND = createError(
  'Invalid assetsBundler entry. Missing devServer property',
  'E_MISSING_BUNDLER_DEV_COMMAND'
)

/**
 * The exception is raised when the "buildCommand" is missing
 * in assetsBundler object
 */
export const E_MISSING_BUNDLER_BUILD_COMMAND = createError(
  'Invalid assetsBundler entry. Missing build property',
  'E_MISSING_BUNDLER_BUILD_COMMAND'
)

/**
 * The exception is raised when the "name" is missing
 * in assetsBundler object
 */
export const E_MISSING_BUNDLER_NAME = createError(
  'Invalid assetsBundler entry. Missing name property',
  'E_MISSING_BUNDLER_NAME'
)
