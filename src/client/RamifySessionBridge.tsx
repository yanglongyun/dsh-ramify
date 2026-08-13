import { useEffect, type ReactNode } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ramifyWorkspaceFrame } from './store.js'

const RAMIFY_ORIGIN = 'http://127.0.0.1:9519'

type BridgeProps = PropsRuntime<'conversation.input.dock'>

type CreateRequest = {
  type: 'ramify:dsh-submit'
  version: 1
  requestId: string
  action: 'create'
  projectId: string
  rootId: string
  nodeIds: string[]
  prompt: string
  count: number
}

type BranchRequest = {
  type: 'ramify:dsh-submit'
  version: 1
  requestId: string
  action: 'branch'
  projectId: string
  nodeId: string
  nodeIds: string[]
  nodeTitle: string
  prompt: string
  count: number
}

export function bridgeRequest(value: unknown): CreateRequest | BranchRequest | null {
  if (typeof value !== 'object' || value === null) return null
  const row = value as Record<string, unknown>
  if (row.type !== 'ramify:dsh-submit' || row.version !== 1) return null
  if (typeof row.requestId !== 'string' || typeof row.prompt !== 'string') return null
  if (!Number.isInteger(row.count) || Number(row.count) < 1 || Number(row.count) > 5) return null
  if (row.action === 'create') {
    if (typeof row.projectId !== 'string' || typeof row.rootId !== 'string') return null
    if (!Array.isArray(row.nodeIds) || row.nodeIds.length !== row.count || !row.nodeIds.every((id) => typeof id === 'string')) return null
    return row as CreateRequest
  }
  if (row.action !== 'branch') return null
  if (typeof row.projectId !== 'string' || typeof row.nodeId !== 'string' || typeof row.nodeTitle !== 'string') return null
  if (!Array.isArray(row.nodeIds) || row.nodeIds.length !== row.count || !row.nodeIds.every((id) => typeof id === 'string')) return null
  return row as BranchRequest
}

export function promptFor(request: CreateRequest | BranchRequest): string {
  if (request.action === 'create') {
    return [
      `请继续完成已创建的 Ramify 项目 ${request.projectId}。`,
      `根节点是 ${request.rootId}，不要再次创建项目。`,
      `完整需求：${request.prompt.trim()}`,
      `画布已经创建了 ${request.count} 个生成中占位节点：${request.nodeIds.join('、')}。`,
      '请为每个占位节点确定一个明显不同的方向，并直接使用 ramify_node_complete 完整写入对应节点。',
      '不要新建项目，不要新建额外方案节点，也不要删除这些占位节点。',
      '完成后不要输出本地服务地址；Ramify 工作台会自动更新。',
    ].join('\n')
  }
  return [
    `请继续编辑 Ramify 项目 ${request.projectId}。`,
    `父节点是 ${request.nodeId}（${request.nodeTitle}）。`,
    `画布已经创建了 ${request.count} 个分支占位节点：${request.nodeIds.join('、')}。`,
    `修改要求：${request.prompt.trim()}`,
    '先读取项目树确认节点，再直接使用 ramify_node_complete 完整写入这些占位节点。不要再创建节点，保留原节点。',
  ].join('\n')
}

/** Session-scoped, renderless bridge from the embedded canvas to DSH's official composer actions. */
export function RamifySessionBridge({ inputActions }: BridgeProps): ReactNode {
  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== RAMIFY_ORIGIN || event.source !== ramifyWorkspaceFrame()) return
      const request = bridgeRequest(event.data)
      if (request === null || request.prompt.trim() === '') return
      inputActions.setDraft(promptFor(request))
      inputActions.submit()
      if (event.source !== null && 'postMessage' in event.source) {
        event.source.postMessage({ type: 'ramify:dsh-accepted', version: 1, requestId: request.requestId }, event.origin)
      }
    }
    window.addEventListener('message', onMessage)
    return () => { window.removeEventListener('message', onMessage) }
  }, [inputActions])
  return null
}
