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
 * The exception is raised when a module is missing a default
 * export
 */
export const E_MISSING_DEFAULT_EXPORT = createError<[importPath: string]>(
  'Missing default export from "%s"',
  'E_MISSING_DEFAULT_EXPORT'
)

/**
 * The exception is raised when a default export of a module is not
 * a class constructor
 */
export const E_NOT_A_CLASS = createError<[value: string, importPath: string]>(
  '"%s" exported by "%s" is not a class',
  'E_NOT_A_CLASS'
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
