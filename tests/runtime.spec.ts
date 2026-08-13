import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { RamifyRuntime } from '../src/runtime.js'

async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('failed to reserve a test port')
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return address.port
}

const runtimes: RamifyRuntime[] = []
const directories: string[] = []

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map(runtime => runtime.stop()))
  await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })))
})

describe('RamifyRuntime', () => {
  it('starts the packaged canvas and serves project operations', async () => {
    const dataDir = await mkdtemp(join(tmpdir(), 'dsh-ramify-'))
    directories.push(dataDir)
    const runtime = new RamifyRuntime({
      port: await freePort(),
      dataDir,
      startupTimeoutMs: 10_000,
      shutdownTimeoutMs: 2_000,
    })
    runtimes.push(runtime)

    const status = await runtime.start()
    expect(status.reused).toBe(false)
    expect(status.url).toBe(runtime.url)

    const created = await runtime.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create three landing-page directions', title: 'Landing page' }),
    }) as Record<string, string>
    expect(created.id).toBeTruthy()
    expect(created.rootId).toBeTruthy()

    await runtime.request(`/api/projects/${created.id}/nodes/batch`, {
      method: 'POST',
      body: JSON.stringify({
        nodes: [
          { key: 'a', parentId: created.rootId, title: 'Editorial', artifactType: 'html' },
          { key: 'b', parentId: created.rootId, title: 'Technical', content: 'Technical direction' },
        ],
      }),
    })

    const tree = await runtime.request(`/api/projects/${created.id}/tree`) as { nodes: unknown[] }
    expect(tree.nodes).toHaveLength(3)

    const html = await fetch(runtime.projectUrl(created.id))
    expect(html.ok).toBe(true)
    expect(await html.text()).toContain('id="root"')
  })
})
