/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { directories } from '../../src/directories.js'
import { RcFileParser } from '../../src/rc_file/parser.js'
import { type PresetFn } from '../../src/types.ts'

test.group('Rc Parser | presets', () => {
  test('mutate the RcFile using the preset function', ({ assert }) => {
    const provider = async () => ({})
    const onBuildCompleted = async () => ({}) as any
    const commands = async () => {}

    function bunPreset(): PresetFn {
      return function ({ rcFile }) {
        rcFile.hooks ??= {}
        rcFile.hooks.buildFinished = [...(rcFile.hooks?.buildFinished || []), onBuildCompleted]

        rcFile.commands.push(commands)
        rcFile.providers.push({ environment: ['web'], file: provider })
        rcFile.tests.timeout = 3000
      }
    }

    const preset = bunPreset()
    const parser = new RcFileParser({ presets: [preset] })

    assert.deepEqual(parser.parse(), {
      raw: { presets: [preset] },
      typescript: true,
      preloads: [],
      directories,
      metaFiles: [],
      commands: [commands],
      commandsAliases: {},
      providers: [{ environment: ['web'], file: provider }],
      experimental: {},
      hooks: {
        buildFinished: [onBuildCompleted],
      },
      tests: {
        suites: [],
        timeout: 3000,
        forceExit: true,
      },
    })
  })

  test('apply multiple presets in order', ({ assert }) => {
    const provider1 = async () => ({})
    const provider2 = async () => ({})
    const command1 = async () => {}
    const command2 = async () => {}

    function firstPreset(): PresetFn {
      return function ({ rcFile }) {
        rcFile.commands.push(command1)
        rcFile.providers.push({ file: provider1, environment: ['web'] })
        rcFile.typescript = false
      }
    }

    function secondPreset(): PresetFn {
      return function ({ rcFile }) {
        rcFile.commands.push(command2)
        rcFile.providers.push({ file: provider2, environment: ['console'] })
        rcFile.tests.forceExit = false
      }
    }

    const preset1 = firstPreset()
    const preset2 = secondPreset()
    const parser = new RcFileParser({ presets: [preset1, preset2] })

    assert.deepEqual(parser.parse(), {
      raw: { presets: [preset1, preset2] },
      typescript: false,
      preloads: [],
      directories,
      metaFiles: [],
      commands: [command1, command2],
      commandsAliases: {},
      providers: [
        { environment: ['web'], file: provider1 },
        { environment: ['console'], file: provider2 },
      ],
      experimental: {},
      hooks: {},
      tests: {
        suites: [],
        timeout: 2000,
        forceExit: false,
      },
    })
  })

  test('preset modifications get also validated', ({ assert }) => {
    function invalidPreset(): PresetFn {
      return function ({ rcFile }) {
        // This should throw during validation because file is not a function
        rcFile.providers.push({ file: 'invalid-string' as any, environment: ['web'] })
      }
    }

    const preset = invalidPreset()
    const parser = new RcFileParser({ presets: [preset] })

    const fn = () => parser.parse()
    assert.throws(
      fn,
      "Invalid provider entry \"{ file: 'invalid-string', environment: [ 'web' ] }\". The file property must be a function"
    )
  })

  test('multiple presets can modify same property arrays', ({ assert }) => {
    const provider1 = async () => ({})
    const provider2 = async () => ({})
    const command1 = async () => {}
    const command2 = async () => {}

    function firstPreset(): PresetFn {
      return function ({ rcFile }) {
        rcFile.providers.push({ file: provider1, environment: ['web'] })
        rcFile.commands.push(command1)
      }
    }

    function secondPreset(): PresetFn {
      return function ({ rcFile }) {
        rcFile.providers.push({ file: provider2, environment: ['console'] })
        rcFile.commands.push(command2)
      }
    }

    const preset1 = firstPreset()
    const preset2 = secondPreset()
    const parser = new RcFileParser({
      presets: [preset1, preset2],
      providers: [async () => ({}) as any],
      commands: [async () => {}],
    })

    const result = parser.parse()

    assert.lengthOf(result.providers, 3)
    assert.lengthOf(result.commands, 3)
  })

  test('throw error when presets is not an array', ({ assert }) => {
    const parser = new RcFileParser({ presets: 'invalid' })

    const fn = () => parser.parse()
    assert.throws(
      fn,
      'Expected presets to be an array of functions. Instead received "\'invalid\'"'
    )
  })

  test('throw error when preset is not a function', ({ assert }) => {
    const parser = new RcFileParser({ presets: ['invalid', () => {}] })

    const fn = () => parser.parse()
    assert.throws(fn, 'Expected preset at index 0 to be a function. Instead received "\'invalid\'"')
  })

  test('throw error with correct index when multiple presets and one fails', ({ assert }) => {
    function workingPreset(): PresetFn {
      return function () {}
    }

    function failingPreset(): PresetFn {
      return function () {
        throw new Error('Second preset failed')
      }
    }

    const preset1 = workingPreset()
    const preset2 = failingPreset()
    const parser = new RcFileParser({ presets: [preset1, preset2] })

    const fn = () => parser.parse()
    assert.throws(fn, 'Preset at index 1 failed to execute: Second preset failed')
  })
})
