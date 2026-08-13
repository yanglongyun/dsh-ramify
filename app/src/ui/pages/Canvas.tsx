import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { BrandMark } from '../components/BrandMark';
import { Minimap } from '../components/Minimap';
import { NodeCard } from '../components/NodeCard';
import { ChatBubble } from '../components/ChatBubble';
import { PreviewPanel } from '../components/canvas/PreviewPanel';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useProjectTree } from '../hooks/useProjectTree';
import { edgePath, layoutTree } from '../lib/layout';
import type { Id } from '../types';
import { isArtifactType } from '../../shared/types';
import { useI18n } from '../components/I18nProvider';
import { isDshEmbedded, submitToDsh } from '../lib/dshBridge';
import '../styles/pages/Canvas.css';

const RENDER_OVERSCAN_PX = 700;
const PREVIEW_MIN_ZOOM = .3;
/** 同时挂载的缩略图上限。
 *
 * 每张缩略图是一个 iframe,按 415% 放大再缩回去 —— 一张就是 780×598 的整页排版。
 * 剔除逻辑只管「在不在视野里」,而视野里塞得下十几张卡:一支作品密集的分支
 * 一旦对准,几十份完整文档会在同一帧里解析、布局、栅格化,画布就停在那儿转。
 * 所以按离视野中心的距离取前 N 张,其余留骨架 —— 看得见的那几张先出来。 */
const THUMB_BUDGET = 8;

function intersectsViewport(position: { x: number; y: number; w: number; h: number }, rect: { x1: number; y1: number; x2: number; y2: number }) {
  const x1 = position.x - position.w / 2, x2 = position.x + position.w / 2;
  const y1 = position.y - position.h / 2, y2 = position.y + position.h / 2;
  return x2 >= rect.x1 && x1 <= rect.x2 && y2 >= rect.y1 && y1 <= rect.y2;
}

export default function Canvas() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { tree, nodes } = useProjectTree(projectId);
  const [selectedId, setSelectedId] = useState<Id | null>(null);
  const [previewId, setPreviewId] = useState<Id | null>(null);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const focusPending = useRef(searchParams.get('focus'));

  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const seqOf = useMemo(() => new Map(nodes.map((node) => [node.id, node.seq])), [nodes]);
  const childrenMap = useMemo(() => {
    const children = new Map<Id, Id[]>();
    for (const node of nodes) {
      if (!node.parent_id) continue;
      if (!children.has(node.parent_id)) children.set(node.parent_id, []);
      children.get(node.parent_id)!.push(node.id);
    }
    return children;
  }, [nodes]);

  const collapseKey = `ramify-collapsed-${projectId}`;
  const [collapsed, setCollapsed] = useState<Set<Id>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(collapseKey) ?? '[]')); }
    catch { return new Set(); }
  });
  function toggleCollapse(id: Id) {
    setCollapsed((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(collapseKey, JSON.stringify([...next]));
      return next;
    });
  }

  const visibleNodes = useMemo(() => {
    const root = nodes.find((node) => node.parent_id === null);
    if (!root) return [];
    const visible: typeof nodes = [];
    const walk = (id: Id) => {
      const node = byId.get(id);
      if (!node) return;
      visible.push(node);
      if (!collapsed.has(id)) (childrenMap.get(id) ?? []).forEach(walk);
    };
    walk(root.id);
    return visible;
  }, [nodes, byId, collapsed, childrenMap]);

  const descendantCount = useCallback((id: Id): number => {
    const children = childrenMap.get(id) ?? [];
    return children.length + children.reduce((sum, child) => sum + descendantCount(child), 0);
  }, [childrenMap]);

  const positions = useMemo(() => layoutTree(visibleNodes), [visibleNodes]);
  const clearSelection = useCallback(() => { setSelectedId(null); setBubbleOpen(false); }, []);
  const viewport = useCanvasViewport(positions, clearSelection);

  const renderRect = useMemo(() => {
    const pad = RENDER_OVERSCAN_PX / viewport.view.k;
    return {
      x1: -viewport.view.x / viewport.view.k - pad,
      y1: -viewport.view.y / viewport.view.k - pad,
      x2: (viewport.canvasSize.w - viewport.view.x) / viewport.view.k + pad,
      y2: (viewport.canvasSize.h - viewport.view.y) / viewport.view.k + pad,
    };
  }, [viewport.view, viewport.canvasSize]);
  const renderNodes = useMemo(() => visibleNodes.filter((node) => {
    const position = positions.get(node.id);
    return position ? intersectsViewport(position, renderRect) : false;
  }), [visibleNodes, positions, renderRect]);
  const renderNodeIds = useMemo(() => new Set(renderNodes.map((node) => node.id)), [renderNodes]);
  const thumbIds = useMemo(() => {
    if (viewport.view.k < PREVIEW_MIN_ZOOM) return new Set<Id>();
    const cx = (renderRect.x1 + renderRect.x2) / 2, cy = (renderRect.y1 + renderRect.y2) / 2;
    const ranked = renderNodes
      .filter((node) => isArtifactType(node.type))
      .map((node) => {
        const position = positions.get(node.id);
        const distance = position ? (position.x - cx) ** 2 + (position.y - cy) ** 2 : Infinity;
        return { id: node.id, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, THUMB_BUDGET);
    return new Set<Id>(ranked.map((entry) => entry.id));
  }, [renderNodes, positions, renderRect, viewport.view.k]);

  useEffect(() => { if (selectedId && !positions.has(selectedId)) setSelectedId(null); }, [positions, selectedId]);
  useEffect(() => {
    const wanted = focusPending.current;
    if (!wanted || !positions.size || viewport.canvasSize.w <= 1) return;
    const target = byId.has(wanted) ? wanted : nodes[Number(wanted) - 1]?.id;
    const position = target ? positions.get(target) : undefined;
    if (!target || !position) return;
    focusPending.current = null;
    viewport.focusAt(position);
    setSelectedId(target);
    const node = byId.get(target);
    if ((node?.type === 'text' && node.content) || (node && isArtifactType(node.type) && node.content)) setPreviewId(target);
  }, [positions, byId, nodes, viewport]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (bubbleOpen) setBubbleOpen(false);
      else if (previewId) setPreviewId(null);
      else setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewId, bubbleOpen]);

  const highlightedEdges = useMemo(() => {
    const edges = new Set<Id>();
    let current = selectedId ? byId.get(selectedId) : undefined;
    while (current?.parent_id) { edges.add(current.id); current = byId.get(current.parent_id); }
    return edges;
  }, [selectedId, byId]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast((current) => current === message ? null : current), 2400);
  }
  function onNodeClick(id: Id) {
    const node = byId.get(id);
    if (!node) return;
    setSelectedId(id);
    if (node.parent_id === null && isDshEmbedded()) {
      setPreviewId(null);
      setBubbleOpen(true);
      return;
    }
    setBubbleOpen(false);
    if (isArtifactType(node.type) && !node.content) { setPreviewId(null); showToast(t('canvas.artifactGenerating')); return; }
    if (node.type === 'error') { setPreviewId(null); showToast(node.content || t('canvas.artifactFailed')); return; }
    setPreviewId(node.type === 'text' ? node.content ? id : null : isArtifactType(node.type) && node.content ? id : null);
  }

  function onNodeBranch(id: Id) {
    setSelectedId(id);
    setBubbleOpen(true);
  }

  async function submitBranch(prompt: string, count: number) {
    if (!selectedId) return;
    const parent = byId.get(selectedId);
    if (!parent) return;
    setBubbleOpen(false);
    try {
      const placeholders = await api.createPlaceholders(projectId, parent.id, count);
      const nodeIds = placeholders.nodes.map((node) => node.id);
      await submitToDsh({ action: 'branch', projectId, nodeId: parent.id, nodeIds, nodeTitle: parent.title, prompt, count });
      showToast(t('dsh.accepted'));
    } catch {
      showToast(t('dsh.noSession'));
    }
  }

  const doneCount = nodes.filter((node) => isArtifactType(node.type) && node.content).length;
  const generatingCount = nodes.filter((node) => isArtifactType(node.type) && !node.content).length;
  const previewNode = previewId ? byId.get(previewId) : undefined;

  return <div className="cb-canvas">
    <div className="cb-canvas-bar">
      <button className="cb-canvas-back" title={t('canvas.back')} onClick={() => navigate('/')}>←</button>
      <span className="cb-bar-sep" /><BrandMark size={15} />
      <div className="cb-canvas-project-name">{tree?.project.title ?? '…'}</div>
      <span className="cb-bar-stat"><b>{doneCount}</b>{t('canvas.variants')}</span>
      {generatingCount > 0 && <span className="cb-bar-stat is-live"><b>{generatingCount}</b>{t('canvas.generating')}</span>}
    </div>

    <div className={`cb-canvas-layout${previewId ? ' has-preview' : ''}`}>
      <div ref={viewport.viewportRef} className="cb-viewport" onPointerDown={viewport.onPointerDown} onPointerMove={viewport.onPointerMove} onPointerUp={viewport.onPointerUp}>
        <div className="cb-world" style={{ transform: `translate(${viewport.view.x}px, ${viewport.view.y}px) scale(${viewport.view.k})` }}>
          <svg className="cb-edges">{visibleNodes.map((node) => {
            if (!node.parent_id) return null;
            const parent = positions.get(node.parent_id), child = positions.get(node.id);
            if (!parent || !child || (!renderNodeIds.has(node.parent_id) && !renderNodeIds.has(node.id))) return null;
            return <path key={node.id} className={`cb-edge${highlightedEdges.has(node.id) ? ' is-highlighted' : ''}`} d={edgePath(parent, child)} />;
          })}</svg>
          {renderNodes.map((node) => {
            const position = positions.get(node.id);
            if (!position) return null;
            return <NodeCard key={node.id} node={node} seq={seqOf.get(node.id) ?? 0} pos={position}
              selected={node.id === selectedId} collapsed={collapsed.has(node.id)}
              hiddenCount={collapsed.has(node.id) ? descendantCount(node.id) : 0}
              hasChildren={(childrenMap.get(node.id) ?? []).length > 0}
              renderPreview={thumbIds.has(node.id)} onClick={onNodeClick}
              onBranch={isDshEmbedded() ? onNodeBranch : undefined} onToggle={toggleCollapse} />;
          })}
          {bubbleOpen && selectedId && byId.get(selectedId) && positions.get(selectedId) && (
            <ChatBubble key={selectedId} node={byId.get(selectedId)!} pos={positions.get(selectedId)!}
              onSubmit={submitBranch} onClose={() => setBubbleOpen(false)} />
          )}
        </div>
        <div className="cb-zoom">
          <button onClick={() => viewport.zoomAt(viewport.canvasSize.w / 2, viewport.canvasSize.h / 2, viewport.view.k / 1.25)}>−</button>
          <span className="cb-zoom-value">{Math.round(viewport.view.k * 100)}%</span>
          <button onClick={() => viewport.zoomAt(viewport.canvasSize.w / 2, viewport.canvasSize.h / 2, viewport.view.k * 1.25)}>＋</button>
          <button className="cb-zoom-fit" onClick={viewport.fitView}>{t('canvas.fit')}</button>
        </div>
        <Minimap nodes={visibleNodes} positions={positions} view={viewport.view} canvasSize={viewport.canvasSize}
          onNavigate={(x, y) => viewport.setView((current) => ({ ...current, x: viewport.canvasSize.w / 2 - x * current.k, y: viewport.canvasSize.h / 2 - y * current.k }))} />
        <div className="cb-canvas-hint">{t('canvas.hint')}</div>
        {toast && <div className="cb-toast">{toast}</div>}
      </div>
      {previewNode && <PreviewPanel node={previewNode} seq={seqOf.get(previewNode.id) ?? 0} onClose={() => setPreviewId(null)} onToast={showToast} />}
    </div>
  </div>;
}
