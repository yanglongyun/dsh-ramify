import type { IncomingMessage } from 'node:http';

export const LOCAL_FRAME_ANCESTORS = "frame-ancestors 'self' http://127.0.0.1:* http://localhost:*";

export const BASE_SECURITY_HEADERS: Record<string, string> = {
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export const UI_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'none'",
  "connect-src 'self'",
  "font-src 'self' data:",
  LOCAL_FRAME_ANCESTORS,
  "frame-src 'self' data: blob:",
  "img-src 'self' data: blob:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
].join('; ');

export const ARTIFACT_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'none'",
  "font-src data:",
  "form-action 'none'",
  "frame-src 'none'",
  "img-src data: blob:",
  "media-src data: blob:",
  "object-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "worker-src 'none'",
].join('; ');

export const MEDIA_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'none'",
  "form-action 'none'",
  "img-src 'self' https: http://127.0.0.1:* http://localhost:* data: blob:",
  "media-src 'self' https: http://127.0.0.1:* http://localhost:* data: blob:",
  "object-src 'none'",
  "script-src 'none'",
  "style-src 'unsafe-inline'",
].join('; ');

function requestHostname(req: IncomingMessage): string | null {
  const host = req.headers.host;
  if (!host) return null;
  try {
    return new URL(`http://${host}`).hostname.toLowerCase().replace(/^\[|\]$/g, '');
  } catch {
    return null;
  }
}

export function isAllowedHost(req: IncomingMessage): boolean {
  const hostname = requestHostname(req);
  if (!hostname) return false;
  const configured = (process.env.HOST || '').trim().toLowerCase();
  const extra = (process.env.RAMIFY_ALLOWED_HOSTS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return new Set(['127.0.0.1', 'localhost', '::1', configured, ...extra]).has(hostname);
}
