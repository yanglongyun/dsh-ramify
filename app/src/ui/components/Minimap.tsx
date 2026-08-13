import { useEffect, useRef } from 'react';
import type { TreeNode } from '../types';
import { boundsOf, type Pos } from '../lib/layout';
import { isArtifactType } from '../../shared/types';

const W = 156, H = 104;

type View = { x: number; y: number; k: number };
type Props = {
  nodes: TreeNode[];
  positions: Map<string, Pos>;
  view: View;
  canvasSize: { w: number; h: number };
  onNavigate: (wx: number, wy: number) => void;
};

// 迷你地图:整树俯瞰 + 视口框,点击/拖动跳转。移植自 Picker,配色换 Flora。
export function Minimap({ nodes, positions, view, canvasSize, onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef({ s: 1, ox: 0, oy: 0 });

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const b = boundsOf(positions);
    const pad = 48;
    const s = Math.min(W / (b.x2 - b.x1 + pad * 2), H / (b.y2 - b.y1 + pad * 2));
    const ox = W / 2 - ((b.x1 + b.x2) / 2) * s;
    const oy = H / 2 - ((b.y1 + b.y2) / 2) * s;
    tRef.current = { s, ox, oy };

    ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 1;
    for (const n of nodes) {
      if (!n.parent_id) continue;
      const p = positions.get(n.parent_id), c = positions.get(n.id);
      if (!p || !c) continue;
      ctx.beginPath();
      ctx.moveTo(p.x * s + ox, p.y * s + oy);
      ctx.lineTo(c.x * s + ox, c.y * s + oy);
      ctx.stroke();
    }
    for (const n of nodes) {
      const p = positions.get(n.id);
      if (!p) continue;
      ctx.fillStyle = n.parent_id === null ? '#b3492f'
        : isArtifactType(n.type) && !n.content ? '#c98a2e'
        : n.type === 'error' ? '#d05050'
        : n.content ? '#e3cf8f' : '#b9b0a0';
      ctx.fillRect(p.x * s + ox - (p.w * s) / 2, p.y * s + oy - (p.h * s) / 2,
        Math.max(3, p.w * s), Math.max(3, p.h * s));
    }
    // 视口框
    const vx = (-view.x / view.k) * s + ox, vy = (-view.y / view.k) * s + oy;
    const vw = (canvasSize.w / view.k) * s, vh = (canvasSize.h / view.k) * s;
    ctx.strokeStyle = '#d95b57'; ctx.lineWidth = 1.5;
    ctx.strokeRect(vx, vy, vw, vh);
    ctx.fillStyle = 'rgba(217,91,87,.07)';
    ctx.fillRect(vx, vy, vw, vh);
  }, [nodes, positions, view, canvasSize]);

  function navigate(e: React.PointerEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { s, ox, oy } = tRef.current;
    onNavigate((e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s);
  }

  return (
    <div
      className="cb-minimap"
      onPointerDown={(e) => { e.stopPropagation(); navigate(e); }}
      onPointerMove={(e) => { if (e.buttons === 1) navigate(e); }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
