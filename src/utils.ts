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
 *
 * @param fileName - The name of the file to search for
 * @param sources - Array of directory paths to search in
 * @returns Promise resolving to file info object or null if not found
 *
 * @example
 * const result = await readFileFromSources('config.ts', ['./config', './defaults'])
 * if (result) {
 *   console.log(result.contents) // File contents
 *   console.log(result.filePath) // Full path to found file
 *   console.log(result.source)   // Source directory where file was found
 * }
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
 * Optionally read the contents of a file.
 * Returns null if the file doesn't exist instead of throwing an error.
 *
 * @param filePath - The path to the file to read (URL or string)
 * @returns Promise resolving to file contents or null if file doesn't exist
 *
 * @example
 * const content = await readFileOptional('./optional-config.ts')
 * if (content) {
 *   console.log('Config found:', content)
 * } else {
 *   console.log('Using default config')
 * }
 */
export async function readFileOptional(filePath: URL | string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch (error: any) {
    /* c8 ignore next 3 */
    if (error.code !== 'ENOENT') {
      throw error
    }

    return null
  }
}

/**
 * Check if a file or directory exists at the given path.
 * This is a safe wrapper around fs.access that returns a boolean.
 *
 * @param path - The path to check for existence
 * @returns Promise resolving to true if path exists, false otherwise
 *
 * @example
 * if (await pathExists('./config.ts')) {
 *   console.log('Config file exists')
 * }
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
 * Parses exports from a stub file by extracting metadata between
 * <!--EXPORT_START--> and <!--EXPORT_END--> markers.
 * These exports contain configuration for stub generation.
 *
 * @param contents - The stub file contents to parse
 * @returns Object containing parsed attributes and cleaned body content
 *
 * @example
 * const stub = `
 * // Some template code
 * <!--EXPORT_START-->{"to": "./app/models/user.ts"}<!--EXPORT_END-->
 * export class {{ name }} {}
 * `
 * const result = parseStubExports(stub)
 * // result.attributes = { to: './app/models/user.ts' }
 * // result.body = cleaned template without export markers
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
