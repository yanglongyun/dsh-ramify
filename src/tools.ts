import type { Context } from '@deepseek-ai/cordis'
import { defineTool, type JsonValue } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { RamifyRuntime } from './runtime.js'

const ARTIFACT_TYPES = ['html', 'markdown', 'svg', 'image', 'video', 'audio'] as const
const THEMES = ['light', 'dark', 'system'] as const
const LOCALES = ['zh-CN', 'en', 'ja', 'es', 'de'] as const

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
      'Create the project first, return its focused URL early, batch-create a balanced tree of titled placeholders, then complete nodes incrementally.',
      'Preserve alternatives: meaningful revisions become child nodes; later rounds belong under a titled round node instead of flattening every version under one parent.',
      'Ramify is a local presentation and versioning surface. You remain responsible for authoring every artifact.',
    ].join(' '),
  })

  ctx.tools.register(defineTool({
    name: 'ramify_start',
    description: 'Start or connect to the local Ramify creative canvas and return its URL.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          url: { type: 'string', required: true },
          reused: { type: 'boolean', required: true },
          version: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Ramify canvas: ${value.url}` }],
    },
    async execute() {
      return runtime.start()
    },
    presentCall: () => ({ card: 'generic', title: 'Open Ramify', kind: 'other' }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_project_create',
    description: 'Create a Ramify project and root node before generating alternative directions. Return the focused canvas URL immediately to the user.',
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
          url: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created Ramify project “${value.title}”: ${value.url}` }],
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
        url: runtime.projectUrl(projectId),
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
          url: { type: 'string', required: true },
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
        url: runtime.projectUrl(args.projectId),
      }
    },
    presentCall: args => ({ card: 'generic', title: 'Read Ramify tree', kind: 'read', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_node_add',
    description: 'Add one child node. Set artifactType without artifact to create a visible generating placeholder, then finish it with ramify_node_complete.',
    parameters: {
      projectId: { type: 'string', required: true },
      parentId: { type: 'string', required: true },
      title: { type: 'string', required: true },
      position: { type: 'integer' },
      content: { type: 'string', description: 'Inline text content; do not combine with artifactType.' },
      artifactType: { type: 'string', enum: [...ARTIFACT_TYPES] },
      artifact: { type: 'string', description: 'Optional artifact source; requires artifactType.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
          url: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created Ramify node ${value.id}: ${value.url}` }],
    },
    async execute(args, exec) {
      const result = objectValue(await runtime.request(`/api/projects/${encodeURIComponent(args.projectId)}/nodes`, {
        method: 'POST',
        body: jsonBody({
          parentId: args.parentId,
          title: args.title,
          ...(args.position === undefined ? {} : { position: args.position }),
          ...(args.content === undefined ? {} : { content: args.content }),
          ...(args.artifactType === undefined ? {} : { artifactType: args.artifactType }),
          ...(args.artifact === undefined ? {} : { artifact: args.artifact }),
        }),
      }, exec.signal), 'node creation')
      return { id: stringValue(result, 'id', 'node creation'), url: runtime.projectUrl(args.projectId) }
    },
    presentCall: args => ({ card: 'generic', title: args.title, kind: 'edit', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_node_batch',
    description: 'Atomically create up to 100 Ramify nodes. Use unique keys and parentKey to build a balanced multi-level tree in one call.',
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
            content: { type: 'string' },
            artifactType: { type: 'string', enum: [...ARTIFACT_TYPES] },
            artifact: { type: 'string' },
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
          url: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created ${value.nodes.length} Ramify nodes: ${value.url}` }],
    },
    async execute(args, exec) {
      const result = objectValue(await runtime.request(`/api/projects/${encodeURIComponent(args.projectId)}/nodes/batch`, {
        method: 'POST',
        body: jsonBody({ nodes: args.nodes }),
      }, exec.signal), 'batch node creation')
      const nodes = result.nodes
      if (!Array.isArray(nodes)) throw new Error('Ramify batch response is missing nodes')
      return {
        nodes: nodes.map((value) => {
          const node = objectValue(value, 'batch node creation')
          return {
            key: stringValue(node, 'key', 'batch node creation'),
            id: stringValue(node, 'id', 'batch node creation'),
          }
        }),
        url: runtime.projectUrl(args.projectId),
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
      artifact: { type: 'string', required: true, description: 'Artifact source. Media accepts a matching data URI, HTTPS URL, or loopback URL.' },
      expectedUpdatedAt: { type: 'string' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', required: true },
          nodeId: { type: 'string', required: true },
          url: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Completed Ramify node ${value.nodeId}: ${value.url}` }],
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
      return { ok: true, nodeId: args.nodeId, url: runtime.projectUrl(args.projectId) }
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
          url: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Updated Ramify node ${value.node.id}: ${value.url}` }],
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
      return { node: nodeValue(node, 'node update'), url: runtime.projectUrl(args.projectId) }
    },
    presentCall: args => ({ card: 'generic', title: 'Update Ramify node', kind: 'edit', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'ramify_settings',
    description: 'Change the Ramify canvas theme or interface language. Open canvases update immediately.',
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
          url: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Ramify settings updated (${value.theme}, ${value.locale}): ${value.url}` }],
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
        url: runtime.url,
      }
    },
    presentCall: args => ({ card: 'generic', title: 'Update Ramify settings', kind: 'edit', rawInput: args }),
  }))
}
