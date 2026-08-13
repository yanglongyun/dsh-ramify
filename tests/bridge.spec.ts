import { describe, expect, it } from 'vitest'
import { bridgeRequest, promptFor } from '../src/client/RamifySessionBridge.js'

describe('Ramify DSH session bridge', () => {
  it('accepts only the versioned create and branch protocol', () => {
    expect(bridgeRequest({ type: 'ramify:dsh-submit', version: 1, requestId: 'r1', action: 'create', projectId: 'p', rootId: 'root', prompt: '做海报', count: 3 }))
      .toMatchObject({ action: 'create', count: 3 })
    expect(bridgeRequest({ type: 'ramify:dsh-submit', version: 1, requestId: 'r2', action: 'branch', projectId: 'p', nodeId: 'n', nodeTitle: 'A', prompt: '深色', count: 2 }))
      .toMatchObject({ action: 'branch', nodeId: 'n' })
    expect(bridgeRequest({ type: 'ramify:dsh-submit', version: 1, requestId: 'r3', action: 'create', prompt: 'x', count: 6 })).toBeNull()
    expect(bridgeRequest({ type: 'ramify:dsh-submit', version: 1, requestId: 'r4', action: 'create', prompt: 'x', count: 2 })).toBeNull()
  })

  it('turns UI intents into explicit model instructions', () => {
    expect(promptFor({ type: 'ramify:dsh-submit', version: 1, requestId: 'r1', action: 'create', projectId: 'p1', rootId: 'root1', prompt: '三版海报', count: 3 }))
      .toContain('生成 3 个方向不同的方案')
    expect(promptFor({ type: 'ramify:dsh-submit', version: 1, requestId: 'r2', action: 'branch', projectId: 'p1', nodeId: 'n1', nodeTitle: '方案 A', prompt: '改成深色', count: 2 }))
      .toContain('以节点 n1（方案 A）为父节点创建 2 个新分支')
  })
})
