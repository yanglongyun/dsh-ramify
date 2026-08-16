import type { Context } from '@deepseek-ai/cordis'
import { defineTool, type JsonValue } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { RamifyRuntime } from './runtime.js'

const ARTIFACT_TYPES = ['html', 'markdown', 'svg', 'image', 'video', 'audio'] as const
const CARD_TYPES = ['title', 'note', ...ARTIFACT_TYPES] as const
const THEMES = ['light', 'dark', 'system'] as const
const LOCALES = ['system', 'zh-CN', 'en', 'ja', 'es', 'de'] as const

type CardType = (typeof CARD_TYPES)[number]

function cardFields(input: { cardType: CardType; content?: string; artifact?: string }) {
  if (input.cardType === 'title') {
    if (input.content !== undefined || input.artifact !== undefined) {
      throw new Error('Ramify title cards accept only a title')
    }
    return {}
  }
  if (input.cardType === 'note') {
    if (input.content === undefined || !input.content.trim()) {
      throw new Error('Ramify note cards require non-empty content')
    }
    if (input.artifact !== undefined) throw new Error('Ramify note cards do not accept artifact source')
    return { content: input.content }
  }
  if (input.content !== undefined) {
    throw new Error(`Ramify ${input.cardType} cards do not accept inline note content`)
  }
  return {
    artifactType: input.cardType,
    ...(input.artifact === undefined ? {} : { artifact: input.artifact }),
  }
}

const PROJECT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    prompt: { type: 'string', required: true },
    created_at: { type: 'string', required: true },
    updated_at: { type: 'string', required: true },
  },
} as const

const NODE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    project_id: { type: 'string', required: true },
    parent_id: { required: true, oneOf: [{ type: 'string' }, { type: 'null' }] },
    position: { type: 'integer', required: true },
    type: { type: 'string', required: true, enum: ['text', 'html', 'markdown', 'svg', 'image', 'video', 'audio', 'error'] },
    title: { type: 'string', required: true },
    content: { required: true, oneOf: [{ type: 'string' }, { type: 'null' }] },
    created_at: { type: 'string', required: true },
    updated_at: { type: 'string', required: true },
  },
} as const

function jsonBody(value: unknown): string {
  return JSON.stringify(value)
}

function objectValue(value: JsonValue, operation: string): Record<string, JsonValue> {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Ramify ${operation} returned an invalid response`)
  }
  return value
}

function stringValue(record: Record<string, JsonValue>, key: string, operation: string): string {
  const value = record[key]
  if (typeof value !== 'string') throw new Error(`Ramify ${operation} response is missing ${key}`)
  return value
}

function integerValue(record: Record<string, JsonValue>, key: string, operation: string): number {
  const value = record[key]
  if (!Number.isInteger(value)) throw new Error(`Ramify ${operation} response has an invalid ${key}`)
  return value as number
}

function nullableStringValue(record: Record<string, JsonValue>, key: string, operation: string): string | null {
  const value = record[key]
  if (value !== null && typeof value !== 'string') throw new Error(`Ramify ${operation} response has an invalid ${key}`)
  return value
}

function projectValue(value: JsonValue, operation: string) {
  const project = objectValue(value, operation)
  return {
    id: stringValue(project, 'id', operation),
    title: stringValue(project, 'title', operation),
    prompt: stringValue(project, 'prompt', operation),
    created_at: stringValue(project, 'created_at', operation),
    updated_at: stringValue(project, 'updated_at', operation),
  }
}

function projectSummaryValue(value: JsonValue) {
  const project = objectValue(value, 'project list')
  return {
    ...projectValue(value, 'project list'),
    node_count: integerValue(project, 'node_count', 'project list'),
    generating_count: integerValue(project, 'generating_count', 'project list'),
    preview_node_id: nullableStringValue(project, 'preview_node_id', 'project list'),
  }
}

function nodeValue(value: JsonValue, operation: string) {
  const node = objectValue(value, operation)
  const type = stringValue(node, 'type', operation)
  if (!['text', 'html', 'markdown', 'svg', 'image', 'video', 'audio', 'error'].includes(type)) {
    throw new Error(`Ramify ${operation} response has an invalid node type`)
  }
  return {
    id: stringValue(node, 'id', operation),
    project_id: stringValue(node, 'project_id', operation),
    parent_id: nullableStringValue(node, 'parent_id', operation),
    position: integerValue(node, 'position', operation),
    type: type as 'text' | 'html' | 'markdown' | 'svg' | 'image' | 'video' | 'audio' | 'error',
    title: stringValue(node, 'title', operation),
    content: nullableStringValue(node, 'content', operation),
    created_at: stringValue(node, 'created_at', operation),
    updated_at: stringValue(node, 'updated_at', operation),
  }
}

function renderJson(value: JsonValue): Array<{ type: 'text'; text: string }> {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

/** Register Ramify guidance and all model-facing canvas tools. */
export function registerRamifyTools(ctx: Context, runtime: RamifyRuntime): void {
  ctx.systemPrompt.section({
    name: 'tool:ramify',
    order: 160,
    text: [
      'Use Ramify when the user wants multiple creative directions, visual comparison, or branching revisions.',
      'Create the project first, tell the user it is available from the Ramify entry in the DSH sidebar, then build a balanced tree with the appropriate cardType for every node.',
      'Use title cards as compact hierarchy, round, category, or decision-point capsules. Use note cards for briefs, constraints, observations, rationale, copy, summaries, and other concise text that should remain visible on the canvas.',
      'Use HTML, Markdown, SVG, image, video, or audio cards only for actual rendered deliverables. Mix title, note, and artifact cards when that makes the canvas easier to scan; do not turn every thought into an artifact.',
      'Artifact cards may be created without artifact source as visible generating placeholders and completed incrementally with ramify_node_complete. Title cards have no content; note cards require content.',
      'Preserve alternatives: meaningful revisions become child nodes; later rounds belong under a titled round node instead of flattening every version under one parent.',
      'Ramify is a local presentation and versioning surface. You remain responsible for authoring every artifact.',
      'Never present the loopback Ramify service URL as the primary result. The integrated DSH workspace is the primary UI; the standalone URL is only an implementation detail and optional fallback.',
    ].join(' '),
  })

  ctx.tools.register(defineTool({
    name: 'ramify_start',
    description: 'Start or connect to the Ramify workspace embedded in DeepSeek Harness.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ready: { type: 'boolean', required: true },
          reused: { type: 'boolean', required: true },
          version: { type: 'string', required: true },
        },
      },
      render: () => [{ type: 'text', text: 'Ramify is ready in the DSH sidebar.' }],
    },
    async execute() {
      const status = await runtime.start()
      return { ready: true, reused: status.reused, version: status.version }
    },
    presentCall: () => ({ card: 'generic', title: 'Open Ramify', kind: 'other' }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_project_create',
    description: 'Create a Ramify project and root node before generating alternative directions. Tell the user to open the integrated Ramify workspace from the DSH sidebar.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'The complete creative request represented by this project.' },
      title: { type: 'string', description: 'Optional concise project title.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          projectId: { type: 'string', required: true },
          rootId: { type: 'string', required: true },
          title: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created Ramify project “${value.title}”. Open Ramify from the DSH sidebar to view it.` }],
    },
    async execute(args, exec) {
      const value = objectValue(await runtime.request('/api/projects', {
        method: 'POST',
        body: jsonBody({ prompt: args.prompt, ...(args.title === undefined ? {} : { title: args.title }) }),
      }, exec.signal), 'project creation')
      const projectId = stringValue(value, 'id', 'project creation')
      return {
        projectId,
        rootId: stringValue(value, 'rootId', 'project creation'),
        title: stringValue(value, 'title', 'project creation'),
      }
    },
    presentCall: args => ({ card: 'generic', title: args.title ?? 'Create Ramify project', kind: 'edit', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_project_list',
    description: 'List existing Ramify projects so work can continue in the correct creative tree.',
    parameters: {},
    output: {
      schema: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ...PROJECT_SCHEMA.properties,
            node_count: { type: 'integer', required: true },
            generating_count: { type: 'integer', required: true },
            preview_node_id: { required: true, oneOf: [{ type: 'string' }, { type: 'null' }] },
          },
        },
      },
      render: (_args, value) => renderJson(value),
    },
    async execute(_args, exec) {
      const value = await runtime.request('/api/projects', {}, exec.signal)
      if (!Array.isArray(value)) throw new Error('Ramify project list returned an invalid response')
      return value.map(projectSummaryValue)
    },
    presentCall: () => ({ card: 'generic', title: 'List Ramify projects', kind: 'search' }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_project_tree',
    description: 'Read one complete Ramify tree. Use the returned stable node ids for all later additions and revisions.',
    parameters: {
      projectId: { type: 'string', required: true },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          project: { ...PROJECT_SCHEMA, required: true },
          nodes: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                ...NODE_SCHEMA.properties,
                seq: { type: 'integer', required: true },
                artifact_revision: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => renderJson(value),
    },
    async execute(args, exec) {
      const tree = objectValue(await runtime.request(`/api/projects/${encodeURIComponent(args.projectId)}/tree`, {}, exec.signal), 'tree read')
      if (!Array.isArray(tree.nodes)) throw new Error('Ramify tree response is missing nodes')
      return {
        project: projectValue(tree.project, 'tree read'),
        nodes: tree.nodes.map((value) => {
          const record = objectValue(value, 'tree read')
          return {
            ...nodeValue(value, 'tree read'),
            seq: integerValue(record, 'seq', 'tree read'),
            artifact_revision: stringValue(record, 'artifact_revision', 'tree read'),
          }
        }),
      }
    },
    presentCall: args => ({ card: 'generic', title: 'Read Ramify tree', kind: 'read', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_node_add',
    description: 'Add one child card with an explicit visual type. Use title for a compact hierarchy capsule, note for a taped text card, or an artifact card type for a rendered deliverable.',
    parameters: {
      projectId: { type: 'string', required: true },
      parentId: { type: 'string', required: true },
      title: { type: 'string', required: true },
      position: { type: 'integer' },
      cardType: { type: 'string', required: true, enum: [...CARD_TYPES], description: 'Visual card form. title is a compact capsule; note is a taped text card; the remaining values are rendered artifact cards.' },
      content: { type: 'string', description: 'Required only for note cards. Keep it concise enough to scan directly on the canvas.' },
      artifact: { type: 'string', description: 'Optional source for artifact cards. Omit it to create a visible generating placeholder.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created Ramify node ${value.id}. The integrated workspace updates automatically.` }],
    },
    async execute(args, exec) {
      const result = objectValue(await runtime.request(`/api/projects/${encodeURIComponent(args.projectId)}/nodes`, {
        method: 'POST',
        body: jsonBody({
          parentId: args.parentId,
          title: args.title,
          ...(args.position === undefined ? {} : { position: args.position }),
          ...cardFields(args),
        }),
      }, exec.signal), 'node creation')
      return { id: stringValue(result, 'id', 'node creation') }
    },
    presentCall: args => ({ card: 'generic', title: args.title, kind: 'edit', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_node_batch',
    description: 'Atomically create up to 100 explicitly typed Ramify cards. Combine title capsules, note cards, and artifact cards to build a balanced, readable multi-level tree.',
    parameters: {
      projectId: { type: 'string', required: true },
      nodes: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            key: { type: 'string', required: true },
            parentId: { type: 'string', description: 'Existing parent node id.' },
            parentKey: { type: 'string', description: 'Key of a preceding node in this batch.' },
            title: { type: 'string', required: true },
            position: { type: 'integer' },
            cardType: { type: 'string', required: true, enum: [...CARD_TYPES], description: 'title capsule, note card, or rendered artifact card type.' },
            content: { type: 'string', description: 'Required only for note cards.' },
            artifact: { type: 'string', description: 'Optional source for artifact cards; omit for a generating placeholder.' },
          },
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          nodes: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                key: { type: 'string', required: true },
                id: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created ${value.nodes.length} Ramify nodes. The integrated workspace updates automatically.` }],
    },
    async execute(args, exec) {
      const requestNodes = args.nodes.map(node => ({
        key: node.key,
        ...(node.parentId === undefined ? {} : { parentId: node.parentId }),
        ...(node.parentKey === undefined ? {} : { parentKey: node.parentKey }),
        title: node.title,
        ...(node.position === undefined ? {} : { position: node.position }),
        ...cardFields(node),
      }))
      const result = objectValue(await runtime.request(`/api/projects/${encodeURIComponent(args.projectId)}/nodes/batch`, {
        method: 'POST',
        body: jsonBody({ nodes: requestNodes }),
      }, exec.signal), 'batch node creation')
      const responseNodes = result.nodes
      if (!Array.isArray(responseNodes)) throw new Error('Ramify batch response is missing nodes')
      return {
        nodes: responseNodes.map((value) => {
          const node = objectValue(value, 'batch node creation')
          return {
            key: stringValue(node, 'key', 'batch node creation'),
            id: stringValue(node, 'id', 'batch node creation'),
          }
        }),
      }
    },
    presentCall: args => ({ card: 'generic', title: `Create ${args.nodes.length} Ramify nodes`, kind: 'edit', rawInput: args.nodes }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_node_complete',
    description: 'Finish or replace a Ramify artifact placeholder with authored HTML, Markdown, SVG, image, video, or audio source.',
    parameters: {
      projectId: { type: 'string', required: true },
      nodeId: { type: 'string', required: true },
      artifactType: { type: 'string', required: true, enum: [...ARTIFACT_TYPES] },
      artifact: { type: 'string', required: true, description: 'Artifact source. May contain executable markup or any media URL supported by the browser.' },
      expectedUpdatedAt: { type: 'string' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', required: true },
          nodeId: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Completed Ramify node ${value.nodeId}. The integrated workspace updates automatically.` }],
    },
    async execute(args, exec) {
      await runtime.request(`/api/nodes/${encodeURIComponent(args.nodeId)}/artifact`, {
        method: 'PUT',
        body: jsonBody({
          artifactType: args.artifactType,
          artifact: args.artifact,
          ...(args.expectedUpdatedAt === undefined ? {} : { expectedUpdatedAt: args.expectedUpdatedAt }),
        }),
      }, exec.signal)
      return { ok: true, nodeId: args.nodeId }
    },
    presentCall: args => ({ card: 'generic', title: `Complete ${args.artifactType} node`, kind: 'edit', rawInput: { nodeId: args.nodeId } }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_node_update',
    description: 'Update a node title, inline text, parent, or position. Use a new child node instead when the revision is worth comparing.',
    parameters: {
      projectId: { type: 'string', required: true },
      nodeId: { type: 'string', required: true },
      title: { type: 'string' },
      content: { oneOf: [{ type: 'string' }, { type: 'null' }] },
      parentId: { type: 'string' },
      position: { type: 'integer' },
      expectedUpdatedAt: { type: 'string' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          node: { ...NODE_SCHEMA, required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Updated Ramify node ${value.node.id}. The integrated workspace updates automatically.` }],
    },
    async execute(args, exec) {
      const node = await runtime.request(`/api/nodes/${encodeURIComponent(args.nodeId)}`, {
        method: 'PUT',
        body: jsonBody({
          ...(args.title === undefined ? {} : { title: args.title }),
          ...(args.content === undefined ? {} : { content: args.content }),
          ...(args.parentId === undefined ? {} : { parentId: args.parentId }),
          ...(args.position === undefined ? {} : { position: args.position }),
          ...(args.expectedUpdatedAt === undefined ? {} : { expectedUpdatedAt: args.expectedUpdatedAt }),
        }),
      }, exec.signal)
      return { node: nodeValue(node, 'node update') }
    },
    presentCall: args => ({ card: 'generic', title: 'Update Ramify node', kind: 'edit', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_settings',
    description: 'Change the Ramify canvas theme or interface language. Use system to follow the current DSH theme or language. Open canvases update immediately.',
    parameters: {
      theme: { type: 'string', enum: [...THEMES] },
      locale: { type: 'string', enum: [...LOCALES] },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          theme: { type: 'string', required: true, enum: [...THEMES] },
          locale: { type: 'string', required: true, enum: [...LOCALES] },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Ramify settings updated (${value.theme}, ${value.locale}).` }],
    },
    async execute(args, exec) {
      if (args.theme !== undefined) {
        await runtime.request('/api/settings/theme', { method: 'PUT', body: jsonBody({ theme: args.theme }) }, exec.signal)
      }
      if (args.locale !== undefined) {
        await runtime.request('/api/settings/locale', { method: 'PUT', body: jsonBody({ locale: args.locale }) }, exec.signal)
      }
      const settings = objectValue(await runtime.request('/api/settings', {}, exec.signal), 'settings read')
      return {
        theme: stringValue(settings, 'theme', 'settings read') as typeof THEMES[number],
        locale: stringValue(settings, 'locale', 'settings read') as typeof LOCALES[number],
      }
    },
    presentCall: args => ({ card: 'generic', title: 'Update Ramify settings', kind: 'edit', rawInput: args }),
  }))
}
