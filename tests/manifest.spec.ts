import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('package manifest', () => {
  it('declares an installable public DSH bundle', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    expect(manifest.name).toBe('@ramify/dsh-ramify')
    expect(manifest.private).not.toBe(true)
    expect(manifest.dsh).toEqual({ bundle: { patch: './cordis.patch.yml' } })
    expect(manifest.main).toBe('./lib/index.js')
  })

  it('mounts the package through the bundle patch', async () => {
    const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
    expect(patch).toContain("id: ramify")
    expect(patch).toContain("name: '@ramify/dsh-ramify'")
  })
})
