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
 * Exception raised when the "pattern" property is missing in a metafile entry.
 * Metafiles define file patterns for copying or watching operations.
 */
export const E_MISSING_METAFILE_PATTERN = createError<[fileProperty: string]>(
  'Invalid metafile entry "%s". Missing pattern property',
  'E_MISSING_METAFILE_PATTERN'
)

/**
 * Exception raised when the "file" property is missing in a preload entry.
 * Preload entries must specify a file property containing an import function.
 */
export const E_MISSING_PRELOAD_FILE = createError<[preloadProperty: string]>(
  'Invalid preload entry "%s". Missing file property',
  'E_MISSING_PRELOAD_FILE'
)

/**
 * Exception raised when the "file" property in a preload entry is not a function.
 * The file property must be a dynamic import function that returns a module.
 */
export const E_INVALID_PRELOAD_FILE = createError<[preloadProperty: string]>(
  'Invalid preload entry "%s". The file property must be a function',
  'E_INVALID_PRELOAD_FILE'
)

/**
 * Exception raised when the "file" property is missing in a provider entry.
 * Provider entries must specify a file property containing an import function.
 */
export const E_MISSING_PROVIDER_FILE = createError<[preloadProperty: string]>(
  'Invalid provider entry "%s". Missing file property',
  'E_MISSING_PROVIDER_FILE'
)

/**
 * Exception raised when the "file" property in a provider entry is not a function.
 * The file property must be a dynamic import function that returns a provider class.
 */
export const E_INVALID_PROVIDER = createError<[preloadProperty: string]>(
  'Invalid provider entry "%s". The file property must be a function',
  'E_INVALID_PROVIDER'
)

/**
 * Exception raised when the "name" property is missing in a test suite entry.
 * Test suites must have a unique name identifier.
 */
export const E_MISSING_SUITE_NAME = createError<[suiteProperty: string]>(
  'Invalid suite entry "%s". Missing name property',
  'E_MISSING_SUITE_NAME'
)

/**
 * Exception raised when the "files" property is missing in a test suite entry.
 * Test suites must specify which files or patterns to include.
 */
export const E_MISSING_SUITE_FILES = createError<[suiteProperty: string]>(
  'Invalid suite entry "%s". Missing files property',
  'E_MISSING_SUITE_FILES'
)

/**
 * Exception raised when a hook is defined for an unknown assembler event.
 * Only predefined assembler events support hooks.
 */
export const E_UNKNOWN_ASSEMBLER_HOOK = createError<[eventName: string]>(
  'Assembler hook defined for unknown event "%s"',
  'E_UNKNOWN_ASSEMBLER_HOOK'
)

/**
 * Exception raised when hooks for an event are not specified as an array.
 * Hooks must be provided as an array of dynamic import functions.
 */
export const E_INVALID_HOOKS_VALUE = createError<[eventName: string, value: string]>(
  'Expected hooks for event "%s" to be an array of dynamic imports. Instead received "%s"',
  'E_INVALID_HOOKS_VALUE'
)

/**
 * Exception raised when the presets property is not an array.
 * Presets must be provided as an array of configuration functions.
 */
export const E_INVALID_PRESETS_VALUE = createError<[value: string]>(
  'Expected presets to be an array of functions. Instead received "%s"',
  'E_INVALID_PRESETS_VALUE'
)

/**
 * Exception raised when a preset at a specific index is not a function.
 * Each preset must be a function that modifies the RC file configuration.
 */
export const E_INVALID_PRESET_FUNCTION = createError<[index: number, value: string]>(
  'Expected preset at index %s to be a function. Instead received "%s"',
  'E_INVALID_PRESET_FUNCTION'
)

/**
 * Exception raised when a preset function throws an error during execution.
 * This indicates an issue with the preset implementation or configuration.
 */
export const E_PRESET_EXECUTION_ERROR = createError<[index: number, message: string]>(
  'Preset at index %s failed to execute: %s',
  'E_PRESET_EXECUTION_ERROR'
)
