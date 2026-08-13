import assert from 'node:assert/strict';
import test from 'node:test';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Router } from './router.js';

test('matches named path parameters without route regex', async () => {
  const router = new Router();
  let nodeId = '';
  router.put('/api/nodes/:nodeId/content', ({ params }) => {
    nodeId = params.nodeId;
  });

  const handled = await router.handle(
    { method: 'PUT' } as IncomingMessage,
    {} as ServerResponse,
    '/api/nodes/abc123/content',
  );

  assert.equal(handled, true);
  assert.equal(nodeId, 'abc123');
});

test('does not match a different path shape', async () => {
  const router = new Router();
  router.get('/api/projects/:projectId/tree', () => undefined);

  const handled = await router.handle(
    { method: 'GET' } as IncomingMessage,
    {} as ServerResponse,
    '/api/projects/abc123',
  );

  assert.equal(handled, false);
});
