import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 1000;

/**
 * 用轮询替代 SSE 长连接:每隔 intervalMs 拉一次轻量的 version 标记,
 * 只有标记变化时才调用 onChange 去拉全量数据。
 *
 * 之所以不用 EventSource:服务是 HTTP/1.1,浏览器对同一 origin 最多 6 条并发连接,
 * 多个标签页各开一条 SSE 会把连接池占满,预览 iframe 等后续请求就会一直排队"卡死"。
 * 轮询请求短平快、用完即走,不占用长连接。
 *
 * 首次全量加载由调用方自己负责(通常在挂载时立即 reload 一次),这个 hook 只负责
 * 之后的变化检测。组件卸载时会自动停止轮询;后台标签页由浏览器自动节流,无需处理。
 */
export function useVersionPolling(
  fetchVersion: () => Promise<string>,
  onChange: () => void,
  intervalMs: number = POLL_INTERVAL_MS,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let lastVersion: string | null = null;

    const tick = async () => {
      try {
        const version = await fetchVersion();
        if (cancelled) return;
        if (lastVersion !== null && lastVersion !== version) onChangeRef.current();
        lastVersion = version;
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) timer = setTimeout(tick, intervalMs);
      }
    };

    timer = setTimeout(tick, intervalMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchVersion, intervalMs]);
}
