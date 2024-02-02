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
 * Parsers exports from a stub
 */
export function parseStubExports(contents: string) {
  const chunks = contents.split(/\r\n|\n/)
  const body: string[] = []
  const exportedBlocks: string[] = []

  chunks.forEach((line) => {
    if (line.includes('<!--EXPORT_START-->')) {
      let [inital, rest] = line.split('<!--EXPORT_START-->')
      let [exports, remaining] = rest.split('<!--EXPORT_END-->')
      inital = inital.trim()
      remaining = remaining.trim()

      const remainingContents =
        inital && remaining ? `${inital}\n${remaining}` : inital || remaining || ''

      exportedBlocks.push(exports)
      if (remainingContents) {
        body.push(remainingContents)
      }
    } else {
      body.push(line)
    }
  })

  const attributes = exportedBlocks.reduce(
    (result, block) => {
      Object.assign(result, JSON.parse(block))
      return result
    },
    {} as Record<string, any>
  )

  return { attributes, body: body.join('\n') }
}
