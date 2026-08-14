import type { IncomingMessage, ServerResponse } from 'node:http';
import { HttpError } from './http/errors.js';
import { Router } from './http/router.js';
import { sendJson } from './http/response.js';
import { serveStatic } from './http/static.js';
import { isAllowedHost } from './http/security.js';
import { NodeRepository } from './nodes/node.repository.js';
import { registerNodeRoutes } from './nodes/node.routes.js';
import { NodeService } from './nodes/node.service.js';
import { ProjectRepository } from './projects/project.repository.js';
import { registerProjectRoutes } from './projects/project.routes.js';
import { ProjectService } from './projects/project.service.js';
import { startChangeWatcher } from './change-watcher.js';
import { ArtifactStore } from './artifacts/artifact.store.js';
import { registerSettingsRoutes } from './settings/settings.routes.js';
import { SettingsStore } from './settings/settings.store.js';

export function createRequestHandler() {
  const projects = new ProjectRepository();
  const nodes = new NodeRepository();
  const artifacts = new ArtifactStore();
  const settings = new SettingsStore();
  const router = new Router();
  startChangeWatcher();

  router.get('/api/health', ({ res }) => sendJson(res, 200, {
    service: 'ramify',
    version: process.env.RAMIFY_VERSION || 'development',
    pid: process.pid,
    instanceId: process.env.RAMIFY_INSTANCE_ID || null,
    capabilities: ['batch-nodes', 'optimistic-concurrency', 'server-seq', 'direct-sql', 'direct-artifacts', 'external-change-events', 'theme-settings', 'locale-settings'],
  }));
  registerSettingsRoutes(router, settings);
  registerProjectRoutes(router, new ProjectService(projects, nodes, artifacts));
  registerNodeRoutes(router, new NodeService(nodes, projects, artifacts));

  return async function handleRequest(req: IncomingMessage, res: ServerResponse) {
    const path = new URL(req.url || '/', 'http://localhost').pathname;
    try {
      if (!isAllowedHost(req)) throw new HttpError(403, 'host is not allowed', 'HOST_NOT_ALLOWED');
      if (path.startsWith('/api/')) {
        if (!await router.handle(req, res, path)) sendJson(res, 404, { error: 'not found', code: 'ROUTE_NOT_FOUND' });
        return;
      }
      serveStatic(res, path);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error('[server]', error);
      if (!res.headersSent) sendJson(res, status, {
        error: error instanceof Error ? error.message : String(error),
        code: error instanceof HttpError ? error.code : 'INTERNAL_ERROR',
      });
    }
  };
}
