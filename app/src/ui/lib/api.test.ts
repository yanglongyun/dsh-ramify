import assert from 'node:assert/strict';
import test from 'node:test';
import { api } from '../api';

test('node preview URL carries the artifact revision', () => {
  assert.equal(api.nodeHtmlUrl('node-1'), '/api/nodes/node-1/html');
  assert.equal(
    api.nodeHtmlUrl('node-1', 'updated:rev/2'),
    '/api/nodes/node-1/html?revision=updated%3Arev%2F2',
  );
});
