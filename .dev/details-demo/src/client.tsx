import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

const CSS = String.raw`
.details-demo-open {
  width: 100%; height: 36px; display: flex; align-items: center; gap: 9px;
  padding: 0 10px; border: 0; border-radius: 10px; color: var(--dsw-alias-label-secondary);
  background: transparent; font: inherit; cursor: pointer;
}
.details-demo-open:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.details-demo-open__icon {
  width: 17px; height: 17px; flex: none; box-sizing: border-box;
  border: 1.5px solid currentColor; border-radius: 3px; position: relative;
}
.details-demo-open__icon::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 5px; width: 1px; background: currentColor; opacity: .55;
}
.details-demo-open__label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 14px; }
.details-demo-panel {
  --demo-accent: #e1693f;
  height: 100%; min-width: 0; display: flex; flex-direction: column; box-sizing: border-box;
  color: var(--dsw-alias-label-primary); background:
    linear-gradient(90deg, color-mix(in srgb, var(--demo-accent) 5%, transparent) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(color-mix(in srgb, var(--demo-accent) 5%, transparent) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--dsw-alias-bg-base);
  border-left: 1px solid var(--dsw-alias-border-l2);
}
.details-demo-head {
  height: 54px; flex: none; display: flex; align-items: center; gap: 10px; padding: 0 12px 0 16px;
  box-sizing: border-box; border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 92%, transparent); backdrop-filter: blur(12px);
}
.details-demo-kicker { color: var(--demo-accent); font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; }
.details-demo-title { margin-top: 4px; font: 600 14px/1.1 Charter, Georgia, serif; }
.details-demo-close {
  width: 28px; height: 28px; margin-left: auto; display: grid; place-items: center; border: 0;
  border-radius: 50%; color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer;
}
.details-demo-close:hover { background: var(--dsw-alias-interactive-bg-hover); }
.details-demo-body { flex: 1; min-height: 0; overflow: auto; padding: 18px 16px 28px; }
.details-demo-ruler {
  height: 28px; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 3px 5px;
  border-bottom: 1px solid color-mix(in srgb, var(--demo-accent) 45%, transparent);
  background: repeating-linear-gradient(90deg, transparent 0 11px, color-mix(in srgb, var(--demo-accent) 30%, transparent) 11px 12px) left bottom / auto 8px no-repeat;
  color: var(--demo-accent); font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
}
.details-demo-width { margin: 18px 0 4px; font: 700 clamp(36px, 10vw, 58px)/.9 Charter, Georgia, serif; letter-spacing: -.055em; }
.details-demo-unit { margin-left: 5px; color: var(--dsw-alias-label-tertiary); font: 500 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0; }
.details-demo-caption { margin: 0 0 22px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.details-demo-grid { display: grid; gap: 8px; }
.details-demo-row {
  display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 10px; padding: 10px 11px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent);
}
.details-demo-row dt { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
.details-demo-row dd { margin: 0; overflow: hidden; color: var(--dsw-alias-label-primary); font: 500 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.details-demo-warning { margin-top: 18px; padding: 12px; border-left: 3px solid var(--demo-accent); background: color-mix(in srgb, var(--demo-accent) 9%, transparent); font-size: 12px; line-height: 18px; }
.details-demo-drag { margin-top: 16px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
`

function installStyles(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = '@ramify/dsh-details-demo'
  style.textContent = CSS
  document.head.append(style)
  return () => { style.remove() }
}

function DetailsDemoAction({ wide, openDetails }: { readonly wide: boolean; readonly openDetails: () => void }): ReactNode {
  const [notice, setNotice] = useState<string | null>(null)
  const open = (): void => {
    openDetails()
    const required = wide ? 1220 : 996
    setNotice(window.innerWidth < required
      ? `${window.innerWidth}px 太窄 · 需要 ≥${required}px`
      : null)
  }
  return (
    <button className="details-demo-open" type="button" aria-label="打开 Details 测试" title={notice ?? 'Details 测试'} onClick={open}>
      <span className="details-demo-open__icon" aria-hidden="true" />
      {wide ? <span className="details-demo-open__label">{notice ?? 'Details 测试'}</span> : null}
    </button>
  )
}

function DetailsDemoPanel({ sessionId, closeDetails }: { readonly sessionId: SessionId; readonly closeDetails: () => void }): ReactNode {
  const root = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (root.current === null) return
    const observer = new ResizeObserver(([entry]) => { setWidth(Math.round(entry?.contentRect.width ?? 0)) })
    observer.observe(root.current)
    return () => { observer.disconnect() }
  }, [])
  return (
    <aside className="details-demo-panel" ref={root} aria-label="DSH Details 测试面板">
      <header className="details-demo-head">
        <div><div className="details-demo-kicker">SINGLE · SESSION</div><div className="details-demo-title">Details column</div></div>
        <button className="details-demo-close" type="button" aria-label="关闭 Details 测试" onClick={closeDetails}>×</button>
      </header>
      <div className="details-demo-body">
        <div className="details-demo-ruler"><span>300</span><span>360 default</span><span>520</span></div>
        <div className="details-demo-width">{width}<span className="details-demo-unit">px</span></div>
        <p className="details-demo-caption">拖动面板左边缘，观察 DSH 在 300–520px 之间约束宽度。</p>
        <dl className="details-demo-grid">
          <div className="details-demo-row"><dt>slot</dt><dd>details</dd></div>
          <div className="details-demo-row"><dt>kind</dt><dd>single</dd></div>
          <div className="details-demo-row"><dt>scope</dt><dd>session</dd></div>
          <div className="details-demo-row"><dt>session</dt><dd title={String(sessionId)}>{String(sessionId)}</dd></div>
        </dl>
        <div className="details-demo-warning"><strong>现在看到的是替换效果。</strong><br />这个测试插件占用了 single 插槽，因此 DSH 原来的工具 Input / Output 详情面板暂时被替换。</div>
        <p className="details-demo-drag">窗口变窄时，DSH 会先压缩此列；无法保证中间区域至少 640px 时，会自动把 Details 收成 0px。</p>
      </div>
    </aside>
  )
}

export const inject = ['slots', 'layout']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => installStyles(), 'details-demo: styles')
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action', id: 'details-demo', order: -9, label: 'Details 测试',
    inject: () => ({ openDetails: () => { ctx.layout.openDetails() } }),
  }, DetailsDemoAction))
  ctx.slots.inject('details', () => ctx.slots.register({
    name: 'details',
    // Static client packages otherwise tie the shipped DetailsPanel at 0.
    // Single slots require a distinct priority; the lowest entry renders.
    priority: -100,
    inject: () => ({ closeDetails: () => { ctx.layout.closeDetails() } }),
  }, DetailsDemoPanel))
}
