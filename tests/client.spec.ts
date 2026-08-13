import { describe, expect, it, vi } from 'vitest'
import {
  ramifyWorkspaceOpen,
  setRamifyWorkspaceOpen,
  subscribeRamifyWorkspace,
} from '../src/client/store.js'
import { shouldAutoOpenRamifyProject } from '../src/client/RamifyToolCard.js'

describe('Ramify client workspace store', () => {
  it('shares visibility between the sidebar action and overlay', () => {
    setRamifyWorkspaceOpen(false)
    const listener = vi.fn()
    const dispose = subscribeRamifyWorkspace(listener)

    setRamifyWorkspaceOpen(true)
    expect(ramifyWorkspaceOpen()).toBe(true)
    expect(listener).toHaveBeenCalledOnce()

    setRamifyWorkspaceOpen(true)
    expect(listener).toHaveBeenCalledOnce()

    dispose()
    setRamifyWorkspaceOpen(false)
    expect(ramifyWorkspaceOpen()).toBe(false)
    expect(listener).toHaveBeenCalledOnce()
  })
})

describe('Ramify project tool card', () => {
  it('opens only after a live create call succeeds', () => {
    expect(shouldAutoOpenRamifyProject(true, true, false)).toBe(true)
    expect(shouldAutoOpenRamifyProject(false, true, false)).toBe(false)
    expect(shouldAutoOpenRamifyProject(true, false, false)).toBe(false)
    expect(shouldAutoOpenRamifyProject(true, true, true)).toBe(false)
  })
})
