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
export async function readFileOptional(fileURL: URL): Promise<string | null> {
  try {
    return await readFile(fileURL, 'utf-8')
  } catch (error) {
    /* c8 ignore next 3 */
    if (error.code !== 'ENOENT') {
      throw error
    }

    return null
  }
}
