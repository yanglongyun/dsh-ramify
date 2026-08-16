import { existsSync, readFileSync } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { extname, join, normalize, relative } from 'node:path';
import { sendText } from './response.js';

const DIST = join(process.env.RAMIFY_APP_DIR || process.cwd(), 'dist', 'public');
const MIME: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

export function serveStatic(res: ServerResponse, requestPath: string) {
  const requested = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
  let file = join(DIST, requested);
  if (relative(DIST, file).startsWith('..')) {
    sendText(res, 403, 'forbidden');
    return;
  }
  if (!existsSync(file)) {
    // SPA fallback 只用于无扩展名的路由路径；缺失的静态资源必须如实 404，
    // 否则旧缓存页面加载已被替换的 hash 资源时会拿到 HTML，应用静默挂死。
    if (extname(requested) !== '') {
      sendText(res, 404, 'not found');
      return;
    }
    file = join(DIST, 'index.html');
  }
  if (!existsSync(file)) {
    sendText(res, 404, 'Ramify runtime is incomplete');
    return;
  }
  const contentType = MIME[extname(file)] || 'application/octet-stream';
  // 带内容 hash 的 assets 永不变化，可长缓存；HTML 壳必须每次回源验证。
  const cacheControl = relative(DIST, file).startsWith('assets')
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
  res.writeHead(200, {
    'Cache-Control': cacheControl,
    'Content-Type': contentType.startsWith('text/') ? `${contentType}; charset=utf-8` : contentType,
  });
  res.end(readFileSync(file));
}
