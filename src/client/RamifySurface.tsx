import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  ramifyWorkspaceOpen,
  setRamifyWorkspaceOpen,
  subscribeRamifyWorkspace,
} from './store.js'

const RAMIFY_URL = 'http://127.0.0.1:9519/'

function SproutMark(): ReactNode {
  return (
    <span className="ramify-entry__mark" aria-hidden="true">
      <span className="ramify-entry__stem" />
      <span className="ramify-entry__leaf ramify-entry__leaf--left" />
      <span className="ramify-entry__leaf ramify-entry__leaf--right" />
    </span>
  )
}

/** Additive action rendered above Settings in the DSH sidebar. */
export function RamifySidebarAction({ wide }: { readonly wide: boolean }): ReactNode {
  return (
    <button
      type="button"
      className={`ramify-entry${wide ? '' : ' ramify-entry--rail'}`}
      aria-label="打开 Ramify 工作台"
      title={wide ? undefined : 'Ramify'}
      onClick={() => { setRamifyWorkspaceOpen(true) }}
    >
      <SproutMark />
      {wide ? <span className="ramify-entry__label">Ramify</span> : null}
    </button>
  )
}

function ExternalIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9.5 2.5h4v4M13.2 2.8 7.5 8.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.7v3.1c0 .94-.76 1.7-1.7 1.7H4.2c-.94 0-1.7-.76-1.7-1.7V5.7c0-.94.76-1.7 1.7-1.7h3.1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  )
}

/** Frame-wide Ramify workspace hosted by the DSH shell overlay slot. */
export function RamifyWorkspaceOverlay(): ReactNode {
  const open = useSyncExternalStore(subscribeRamifyWorkspace, ramifyWorkspaceOpen, ramifyWorkspaceOpen)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open) return
    setReady(false)
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setRamifyWorkspaceOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [open])

  if (!open) return null
  return (
    <div className="ramify-layer" role="dialog" aria-modal="true" aria-labelledby="ramify-workspace-title">
      <section className="ramify-shell">
        <header className="ramify-bar">
          <div className="ramify-brand">
            <span className="ramify-brand__seal"><SproutMark /></span>
            <strong className="ramify-brand__name" id="ramify-workspace-title">Ramify</strong>
            <span className="ramify-brand__meta">creative branching workspace</span>
          </div>
          <div className="ramify-status" aria-live="polite">
            <span className="ramify-status__dot" />
            {ready ? '工作台已连接' : '正在唤醒工作台'}
          </div>
          <div className="ramify-actions">
            <a className="ramify-icon-button" href={RAMIFY_URL} target="_blank" rel="noreferrer" aria-label="在新窗口打开 Ramify" title="在新窗口打开">
              <ExternalIcon />
            </a>
            <button className="ramify-icon-button" type="button" aria-label="关闭 Ramify" title="关闭 (Esc)" onClick={() => { setRamifyWorkspaceOpen(false) }}>
              <CloseIcon />
            </button>
          </div>
        </header>
        <div className="ramify-stage">
          {!ready ? (
            <div className="ramify-loading">
              <span><span className="ramify-loading__sprout">🌱</span>枝叶正在展开</span>
            </div>
          ) : null}
          <iframe
            className={`ramify-frame${ready ? ' ramify-frame--ready' : ''}`}
            src={RAMIFY_URL}
            title="Ramify 工作台"
            onLoad={() => { setReady(true) }}
          />
        </div>
      </section>
    </div>
  )
}
