import { test } from '@japa/runner'

declare module '@japa/runner' {
  interface TestContext {
    assert: Assert
  }
}
