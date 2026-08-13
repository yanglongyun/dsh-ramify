import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { boundsOf, type Pos } from '../lib/layout';
import type { Id } from '../types';

export type View = { x: number; y: number; k: number };

const MIN_ZOOM = 0.04;
const MAX_ZOOM = 2.6;

export function useCanvasViewport(positions: Map<Id, Pos>, onBackgroundClick: () => void) {
  const [view, setView] = useState<View>({ x: 160, y: 300, k: 1 });
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const initializedRoot = useRef<Id | null>(null);
  const pan = useRef({ active: false, sx: 0, sy: 0, vx: 0, vy: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const rootEntry = positions.entries().next().value as [Id, Pos] | undefined;
  const rootId = rootEntry?.[0] ?? null;

  useLayoutEffect(() => {
    const element = viewportRef.current;
    const root = positions.entries().next().value as [Id, Pos] | undefined;
    if (!element || !root || initializedRoot.current === root[0]) return;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return;
    initializedRoot.current = root[0];
    setCanvasSize({ w: rect.width, h: rect.height });
    setView({ k: 1, x: rect.width * 0.25 - root[1].x, y: rect.height * 0.5 - root[1].y });
  }, [positions]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      setCanvasSize({ w: rect.width, h: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootId]);

  const fitView = useCallback(() => {
    if (!positions.size) return;
    const bounds = boundsOf(positions), pad = 90;
    const scale = Math.min(1.2,
      canvasSize.w / (bounds.x2 - bounds.x1 + pad * 2),
      canvasSize.h / (bounds.y2 - bounds.y1 + pad * 2));
    const k = Math.max(MIN_ZOOM, scale);
    setView({
      k,
      x: canvasSize.w / 2 - ((bounds.x1 + bounds.x2) / 2) * k,
      y: canvasSize.h / 2 - ((bounds.y1 + bounds.y2) / 2) * k,
    });
  }, [positions, canvasSize]);

  const zoomAt = useCallback((cx: number, cy: number, scale: number) => {
    setView((current) => {
      const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
      const ratio = k / current.k;
      return { k, x: cx - (cx - current.x) * ratio, y: cy - (cy - current.y) * ratio };
    });
  }, []);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, viewRef.current.k * Math.exp(-event.deltaY * .0016));
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [zoomAt, rootId]);

  function onPointerDown(event: React.PointerEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.cb-node, .cb-canvas-bar, .cb-zoom, a, button, input, textarea')) return;
    pan.current = { active: true, sx: event.clientX, sy: event.clientY, vx: view.x, vy: view.y };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    viewportRef.current?.classList.add('is-panning');
    onBackgroundClick();
  }
  function onPointerMove(event: React.PointerEvent) {
    const state = pan.current;
    if (!state.active) return;
    setView((current) => ({ ...current, x: state.vx + event.clientX - state.sx, y: state.vy + event.clientY - state.sy }));
  }
  function onPointerUp() {
    pan.current.active = false;
    viewportRef.current?.classList.remove('is-panning');
  }
  function focusAt(position: Pos, k = .9) {
    setView({ k, x: canvasSize.w / 2 - position.x * k, y: canvasSize.h / 2 - position.y * k });
  }

  return { view, setView, canvasSize, viewportRef, fitView, zoomAt, focusAt, onPointerDown, onPointerMove, onPointerUp };
}
