/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import type { PathLike } from 'node:fs'
import { access, readFile } from 'node:fs/promises'

/**
 * Attempts to read a file from multiple sources and returns the contents
 * of the first matching one. `null` is returned when file does not
 * exist in any of the sources.
 */
export async function readFileFromSources(fileName: string, sources: string[]) {
  for (let source of sources) {
    const filePath = join(source, fileName)
    const contents = await readFileOptional(filePath)
    if (contents !== null) {
      return {
        contents,
        filePath,
        fileName,
        source,
      }
    }
  }

  return null
}

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
 * Check if a file for the given path exists
 */
export async function pathExists(path: PathLike): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Escapes a JSON string, so that it can be safely parsed.
 *
 * This is done because the JSON written within the frontmatter
 * block might not be escaped when using helper methods to
 * generate values.
 *
 * Therefore, we have to escape it at the time of parsing it.
 */
export function escapeJSON(jsonString: string) {
  return jsonString.replace('\\', '\\\\')
}

/**
 * Parses frontend matter as JSON from a text string.
 */
export function parseJSONFrontMatter(contents: string) {
  const chunks = contents.split(/\n|\r\n/)

  const frontmatter: string[] = []
  const body: string[] = []
  let parsingState: 'pending' | 'started' | 'completed' = 'pending'

  chunks.forEach((line) => {
    if (line.trim() === '---') {
      if (parsingState === 'completed') {
        body.push(line)
      } else if (parsingState === 'pending') {
        parsingState = 'started'
      } else if (parsingState === 'started') {
        parsingState = 'completed'
      }
      return
    }

    if (parsingState === 'started') {
      frontmatter.push(line)
      return
    }

    body.push(line)
  })

  const attributes = frontmatter.length ? JSON.parse(escapeJSON(frontmatter.join(' '))) : {}
  return { attributes, body: body.join('\n') }
}
