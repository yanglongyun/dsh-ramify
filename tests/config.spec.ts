import { describe, expect, it } from 'vitest'
import { resolveConfig } from '../src/config.js'

describe('resolveConfig', () => {
  it('supplies runtime defaults', () => {
    expect(resolveConfig()).toEqual({
      port: 9519,
      startupTimeoutMs: 5000,
      shutdownTimeoutMs: 3000,
    })
  })

  it('rejects invalid deployment values', () => {
    expect(() => resolveConfig({ port: 0 })).toThrow('port')
    expect(() => resolveConfig({ port: 1.5 })).toThrow('port')
    expect(() => resolveConfig({ startupTimeoutMs: 0 })).toThrow('startupTimeoutMs')
    expect(() => resolveConfig({ shutdownTimeoutMs: Number.NaN })).toThrow('shutdownTimeoutMs')
    expect(() => resolveConfig({ dataDir: ' ' })).toThrow('dataDir')
  })
})
