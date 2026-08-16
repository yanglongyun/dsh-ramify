import { readJsonBody } from '../http/body.js';
import { Router } from '../http/router.js';
import { sendBuffer, sendJson, sendText } from '../http/response.js';
import { NodeService } from './node.service.js';

export function registerNodeRoutes(router: Router, service: NodeService) {
  router.post('/api/projects/:projectId/nodes', async ({ req, res, params }) => {
    sendJson(res, 200, service.create(params.projectId, await readJsonBody(req)));
  });

  router.post('/api/projects/:projectId/nodes/batch', async ({ req, res, params }) => {
    sendJson(res, 200, service.createBatch(params.projectId, await readJsonBody(req)));
  });

  router.put('/api/nodes/:nodeId', async ({ req, res, params }) => {
    sendJson(res, 200, service.update(params.nodeId, await readJsonBody(req)));
  });

  router.put('/api/nodes/:nodeId/artifact', async ({ req, res, params }) => {
    sendJson(res, 200, service.updateArtifact(params.nodeId, await readJsonBody(req)));
  });

  router.put('/api/nodes/:nodeId/artifact/error', async ({ req, res, params }) => {
    sendJson(res, 200, service.markArtifactError(params.nodeId, await readJsonBody(req)));
  });

  router.delete('/api/nodes/:nodeId/artifact', ({ res, params }) => {
    sendJson(res, 200, service.clearArtifact(params.nodeId));
  });

  router.delete('/api/nodes/:nodeId', ({ res, params }) => {
    sendJson(res, 200, service.delete(params.nodeId));
  });

  router.get('/api/nodes/:nodeId/html', ({ req, res, params }) => {
    const artifact = service.html(params.nodeId);
    const revision = new URL(req.url ?? '', 'http://127.0.0.1').searchParams.get('revision');
    sendText(res, 200, artifact.document, 'text/html; charset=utf-8', {
      'Cache-Control': revision ? 'private, max-age=31536000, immutable' : 'no-store',
    });
  });

  router.get('/api/nodes/:nodeId/content', ({ res, params }) => {
    sendJson(res, 200, service.content(params.nodeId));
  });

  router.get('/api/nodes/:nodeId/artifact/source', ({ res, params }) => {
    sendJson(res, 200, service.artifactSource(params.nodeId));
  });

  router.get('/api/nodes/:nodeId/artifact', ({ res, params }) => {
    const artifact = service.artifact(params.nodeId);
    sendBuffer(res, artifact.content, artifact.mime, {
      'Cache-Control': 'no-store',
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(artifact.filename)}`,
    });
  });
}
