import { useEffect, useRef, type ReactNode } from 'react'
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client'
import { setRamifyWorkspaceOpen } from './store.js'

export function shouldAutoOpenRamifyProject(wasRunning: boolean, settled: boolean, failed: boolean): boolean {
  return wasRunning && settled && !failed
}

/** Native DSH result row for a newly created Ramify project. */
export function RamifyProjectToolCard({ block }: ToolCallViewProps): ReactNode {
  const settled = 'kind' in block
  const failed = settled && block.isError
  const wasRunning = useRef(!settled)

  useEffect(() => {
    if (!settled) {
      wasRunning.current = true
      return
    }
    // Only a call observed transitioning on this page may open the workspace.
    // Historical settled cards never pop the surface open after page reload.
    if (shouldAutoOpenRamifyProject(wasRunning.current, settled, failed)) {
      wasRunning.current = false
      setRamifyWorkspaceOpen(true)
    } else if (settled) {
      wasRunning.current = false
    }
  }, [failed, settled])

  return (
    <div className="ramify-tool" data-state={failed ? 'error' : settled ? 'done' : 'running'}>
      <span className="ramify-tool__seal" aria-hidden="true">
        <span className="ramify-entry__mark">
          <span className="ramify-entry__stem" />
          <span className="ramify-entry__leaf ramify-entry__leaf--left" />
          <span className="ramify-entry__leaf ramify-entry__leaf--right" />
        </span>
      </span>
      <span className="ramify-tool__copy">
        <strong>{failed ? 'Ramify 项目创建失败' : settled ? 'Ramify 项目已就绪' : '正在创建 Ramify 项目'}</strong>
        <small>{failed ? '展开轨迹查看错误' : settled ? '项目已同步到内置工作台' : '正在准备根节点与画布'}</small>
      </span>
      <button
        className="ramify-tool__open"
        type="button"
        disabled={failed}
        onClick={() => { setRamifyWorkspaceOpen(true) }}
      >
        打开 Ramify
        <span aria-hidden="true">↗</span>
      </button>
      {!settled ? <span className="ramify-tool__sweep" aria-hidden="true" /> : null}
    </div>
  )
}
