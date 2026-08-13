import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutTree } from './layout';
import type { TreeNode } from '../types';

const node = (id: string, parent_id: string | null): TreeNode => ({
  id, seq: 1, parent_id, project_id: 'p', position: 0,
  type: parent_id ? 'html' : 'text', title: id, content: parent_id ? `${id}.html` : null,
  artifact_revision: '', created_at: '2026-01-01', updated_at: '2026-01-01',
});

test('tree layout moves children right and centers their parent', () => {
  const positions = layoutTree([node('root', null), node('a', 'root'), node('b', 'root')]);
  const root = positions.get('root')!, a = positions.get('a')!, b = positions.get('b')!;
  assert.ok(a.x > root.x && b.x > root.x);
  assert.equal(root.y, (a.y + b.y) / 2);
});
