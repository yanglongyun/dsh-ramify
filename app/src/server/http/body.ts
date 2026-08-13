import type { IncomingMessage } from 'node:http';
import { HttpError } from './errors.js';

const MAX_BODY_BYTES = 10 * 1024 * 1024;

export function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'request body too large', 'BODY_TOO_LARGE'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      try {
        const value = data ? JSON.parse(data) as unknown : {};
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          reject(new HttpError(400, 'JSON object required', 'INVALID_BODY'));
          return;
        }
        resolve(value as Record<string, unknown>);
      } catch {
        reject(new HttpError(400, 'invalid JSON', 'INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}
