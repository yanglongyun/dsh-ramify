import assert from 'node:assert/strict';
import test from 'node:test';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Router } from './router.js';
import { sendJson } from './response.js';

function fakeResponse() {
  const state: { statusCode: number; body: unknown; ended: boolean } = { statusCode: 0, body: undefined, ended: false };
  const res = {
    writeHead(status: number) {
      state.statusCode = status;
      return res;
    },
    end(chunk?: unknown) {
      state.ended = true;
      state.body = typeof chunk === 'function' ? undefined : chunk;
      return res;
    },
  } as unknown as ServerResponse;
  return { res, state };
}

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

test('HEAD is matched against the same route as GET but sends no body', async () => {
  const router = new Router();
  router.get('/api/ping', ({ res }) => sendJson(res, 200, { ok: true }));

  const get = fakeResponse();
  await router.handle({ method: 'GET' } as IncomingMessage, get.res, '/api/ping');
  assert.equal(get.state.statusCode, 200);
  assert.ok(typeof get.state.body === 'string' && get.state.body.length > 0);

  const head = fakeResponse();
  const handled = await router.handle({ method: 'HEAD' } as IncomingMessage, head.res, '/api/ping');
  assert.equal(handled, true);
  assert.equal(head.state.statusCode, 200);
  assert.equal(head.state.ended, true);
  assert.equal(head.state.body, undefined);
});
