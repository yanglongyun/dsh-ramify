import type { ServerResponse } from 'node:http';
import { BASE_SECURITY_HEADERS } from './security.js';

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    ...BASE_SECURITY_HEADERS,
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(body));
}

export function sendText(
  res: ServerResponse,
  status: number,
  body: string,
  contentType = 'text/plain; charset=utf-8',
  headers: Record<string, string | number> = {},
) {
  res.writeHead(status, {
    ...BASE_SECURITY_HEADERS,
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

export function sendBuffer(
  res: ServerResponse,
  body: Buffer,
  contentType: string,
  headers: Record<string, string | number> = {},
) {
  res.writeHead(200, {
    ...BASE_SECURITY_HEADERS,
    'Content-Type': contentType,
    'Content-Length': body.length,
    ...headers,
  });
  res.end(body);
}
