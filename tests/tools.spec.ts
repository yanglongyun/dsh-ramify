import type { Context } from '@deepseek-ai/cordis'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import { describe, expect, it, vi } from 'vitest'
import type { RamifyRuntime } from '../src/runtime.js'
import { registerRamifyTools } from '../src/tools.js'

function harness() {
  const tools: ToolDefinition[] = []
  const sections: Array<{ name: string; order: number; text: string }> = []
  const ctx = {
    tools: {
      register(tool: ToolDefinition) {
        tools.push(tool)
        return () => undefined
      },
    },
    systemPrompt: {
      section(section: { name: string; order: number; text: string }) {
        sections.push(section)
        return () => undefined
      },
    },
  } as unknown as Context
  return { ctx, tools, sections }
}

describe('Ramify tools', () => {
  it('registers the complete native tool surface and workflow guidance', () => {
    const { ctx, tools, sections } = harness()
    registerRamifyTools(ctx, {} as RamifyRuntime)
    expect(tools.map(tool => tool.name)).toEqual([
      'ramify_start',
      'ramify_project_create',
      'ramify_project_list',
      'ramify_project_tree',
      'ramify_node_add',
      'ramify_node_batch',
      'ramify_node_complete',
      'ramify_node_update',
      'ramify_settings',
    ])
    expect(sections).toHaveLength(1)
    expect(sections[0]?.name).toBe('tool:ramify')
    expect(sections[0]?.text).toContain('multiple creative directions')
    expect(sections[0]?.text).toContain('Use title cards')
    expect(sections[0]?.text).toContain('Use note cards')

    const add = tools.find(tool => tool.name === 'ramify_node_add')
    const parameters = add?.parameters as { required?: string[]; properties?: { cardType?: { enum?: string[] } } }
    const cardType = parameters.properties?.cardType
    expect(parameters.required).toContain('cardType')
    expect(cardType?.enum).toEqual(['title', 'note', 'html', 'markdown', 'svg', 'image', 'video', 'audio'])
  })

  it('maps project creation to the local API without exposing the loopback service URL', async () => {
    const { ctx, tools } = harness()
    const request = vi.fn().mockResolvedValue({
      id: 'project-1',
      rootId: 'root-1',
      title: 'Three directions',
      prompt: 'Explore three directions',
      created_at: '2026-08-14T00:00:00.000Z',
      updated_at: '2026-08-14T00:00:00.000Z',
    })
    const runtime = { request } as unknown as RamifyRuntime
    registerRamifyTools(ctx, runtime)
    const tool = tools.find(candidate => candidate.name === 'ramify_project_create')
    const result = await tool?.execute(
      { prompt: 'Explore three directions', title: 'Three directions' },
      { signal: new AbortController().signal } as never,
    )
    expect(result).toEqual({
      projectId: 'project-1',
      rootId: 'root-1',
      title: 'Three directions',
    })
    expect(request).toHaveBeenCalledWith('/api/projects', expect.objectContaining({ method: 'POST' }), expect.any(AbortSignal))
  })

  it('maps explicit title, note, and artifact card types to the node API', async () => {
    const { ctx, tools } = harness()
    const request = vi.fn().mockResolvedValue({ id: 'node-1' })
    registerRamifyTools(ctx, { request } as unknown as RamifyRuntime)
    const tool = tools.find(candidate => candidate.name === 'ramify_node_add')
    const signal = new AbortController().signal

    await tool?.execute({ projectId: 'p', parentId: 'root', title: 'Round 2', cardType: 'title' }, { signal } as never)
    await tool?.execute({ projectId: 'p', parentId: 'root', title: 'Insight', cardType: 'note', content: 'Keep the hierarchy shallow.' }, { signal } as never)
    await tool?.execute({ projectId: 'p', parentId: 'root', title: 'Landing page', cardType: 'html' }, { signal } as never)

    const bodies = request.mock.calls.map((call) => JSON.parse(call[1].body as string))
    expect(bodies).toEqual([
      { parentId: 'root', title: 'Round 2' },
      { parentId: 'root', title: 'Insight', content: 'Keep the hierarchy shallow.' },
      { parentId: 'root', title: 'Landing page', artifactType: 'html' },
    ])
  })

  it('rejects invalid content for explicit card types', async () => {
    const { ctx, tools } = harness()
    registerRamifyTools(ctx, { request: vi.fn() } as unknown as RamifyRuntime)
    const tool = tools.find(candidate => candidate.name === 'ramify_node_add')
    const exec = { signal: new AbortController().signal } as never

    await expect(tool?.execute({ projectId: 'p', parentId: 'root', title: 'Empty', cardType: 'note' }, exec)).rejects.toThrow('note cards require non-empty content')
    await expect(tool?.execute({ projectId: 'p', parentId: 'root', title: 'Wrong', cardType: 'title', content: 'No body' }, exec)).rejects.toThrow('title cards accept only a title')
  })
})
