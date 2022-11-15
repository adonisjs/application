/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readFile } from 'node:fs/promises'

/**
 * Optionally read the contents of a file
 */
export async function readFileOptional(filePath: URL | string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch (error) {
    /* c8 ignore next 3 */
    if (error.code !== 'ENOENT') {
      throw error
    }

    return null
  }
}

/**
 * Optionally resolve a module from a parent URL
 */
export async function resolveOptional(filePath: string, parent: URL): Promise<string | null> {
  try {
    return await import.meta.resolve!(filePath, parent)
  } catch (error) {
    /* c8 ignore next 3 */
    if (!error.message.includes('Cannot find')) {
      throw error
    }
  }

  return null
}
