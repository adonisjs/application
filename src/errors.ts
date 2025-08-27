/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError } from '@poppinss/utils/exception'

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
 * The exception is raised when a hook is specified for an unknown
 * assembler event
 */
export const E_UNKNOWN_ASSEMBLER_HOOK = createError<[eventName: string]>(
  'Assembler hook defined for unknown event "%s"',
  'E_UNKNOWN_ASSEMBLER_HOOK'
)

/**
 * The exception is raised when hooks for an event are not specified as an
 * array of values
 */
export const E_INVALID_HOOKS_VALUE = createError<[eventName: string, value: string]>(
  'Expected hooks for event "%s" to be an array of dynamic imports. Instead received "%s"',
  'E_INVALID_HOOKS_VALUE'
)

/**
 * The exception is raised when the presets property is not an array
 */
export const E_INVALID_PRESETS_VALUE = createError<[value: string]>(
  'Expected presets to be an array of functions. Instead received "%s"',
  'E_INVALID_PRESETS_VALUE'
)

/**
 * The exception is raised when a preset is not a function
 */
export const E_INVALID_PRESET_FUNCTION = createError<[index: number, value: string]>(
  'Expected preset at index %s to be a function. Instead received "%s"',
  'E_INVALID_PRESET_FUNCTION'
)

/**
 * The exception is raised when a preset throws an error during execution
 */
export const E_PRESET_EXECUTION_ERROR = createError<[index: number, message: string]>(
  'Preset at index %s failed to execute: %s',
  'E_PRESET_EXECUTION_ERROR'
)
