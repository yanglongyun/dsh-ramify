import { useEffect, useRef, useState } from 'react';
import { api } from '../../api';
import type { TreeNode } from '../../types';
import { isArtifactType } from '../../../shared/types';
import { useI18n } from '../I18nProvider';

const DEFAULT_WIDTH = 480, MIN_WIDTH = 320;
type Props = {
  node: TreeNode;
  seq: number;
  onClose: () => void;
  onToast: (message: string) => void;
};

export function PreviewPanel({ node, seq, onClose, onToast }: Props) {
  const { t } = useI18n();
  const hasArtifact = isArtifactType(node.type) && !!node.content;
  const isMedia = node.type === 'image' || node.type === 'video' || node.type === 'audio';
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const drag = useRef({ active: false, sx: 0, sw: 0 });
  const previewRevision = `${node.updated_at}:${node.artifact_revision}`;
  const frameRevision = loadAttempt === 0 ? previewRevision : `${previewRevision}:retry-${loadAttempt}`;

  useEffect(() => {
    if (!hasArtifact) return;
    setLoadState('loading');
    const timeout = window.setTimeout(() => setLoadState((current) => current === 'loading' ? 'failed' : current), 8_000);
    return () => window.clearTimeout(timeout);
  }, [node.id, previewRevision, loadAttempt, hasArtifact]);

  async function copyCode() {
    try { await navigator.clipboard.writeText(await api.nodeArtifactSource(node.id)); onToast(t('preview.copied')); }
    catch { onToast(t('preview.copyFailed')); }
  }
  async function downloadContent() {
    try {
      const anchor = document.createElement('a');
      anchor.href = api.nodeArtifactUrl(node.id); anchor.download = '';
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
    } catch { onToast(t('preview.downloadFailed')); }
  }
  return <>
    <div className="cb-divider"
      onPointerDown={(event) => { drag.current = { active: true, sx: event.clientX, sw: width }; (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); event.preventDefault(); }}
      onPointerMove={(event) => { if (drag.current.active) setWidth(Math.max(MIN_WIDTH, Math.min(window.innerWidth * .7, drag.current.sw + drag.current.sx - event.clientX))); }}
      onPointerUp={() => { drag.current.active = false; }} />
    <div className="cb-preview" style={{ width }}>
      <div className="cb-preview-bar">
        <div className="cb-preview-topline">
          <span className="cb-preview-title"><span className="cb-node-seq">#{seq}</span>{node.title}</span>
          <div className="cb-preview-actions">
            {hasArtifact && <>
              <button className="cb-preview-button" title={isMedia ? t('preview.copyMedia') : t('preview.copySource')} onClick={() => void copyCode()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
              <button className="cb-preview-button" title={t('preview.download')} onClick={() => void downloadContent()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 12l5 5 5-5M5 21h14"/></svg></button>
              <button className="cb-preview-button" title={t('preview.open')} onClick={() => window.open(api.nodeHtmlUrl(node.id), '_blank', 'noopener')}>↗</button>
            </>}
            <button className="cb-preview-button is-close" title={t('preview.close')} onClick={onClose}>✕</button>
          </div>
        </div>
      </div>
      {node.type === 'text' && node.content && <div className="cb-preview-content">
        <div className="cb-preview-content-label">{t('preview.content')}</div>
        <div className="cb-preview-content-body">{node.content}</div>
      </div>}
      {hasArtifact && <div className="cb-preview-frame-shell">
        <iframe key={`${node.id}:${frameRevision}`} className="cb-preview-frame"
          src={api.nodeHtmlUrl(node.id, frameRevision)}
          title={node.title} onLoad={() => setLoadState('ready')} onError={() => setLoadState('failed')} />
        {loadState === 'loading' && <div className="cb-preview-loading" aria-live="polite">{t('preview.loading')}</div>}
        {loadState === 'failed' && <div className="cb-preview-loading is-failed" role="alert">
          <span>{t('preview.loadFailed')}</span>
          <button className="cb-preview-retry" onClick={() => setLoadAttempt((current) => current + 1)}>{t('preview.retry')}</button>
        </div>}
      </div>}
    </div>
  </>;
}
