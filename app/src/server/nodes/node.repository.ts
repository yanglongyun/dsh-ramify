import type { NodeType } from '../../shared/types.js';
import { database } from '../db/connection.js';
import type { Node, TreeNode } from './node.types.js';

export type NewNode = {
  id: string;
  projectId: string;
  parentId: string;
  position: number;
  type: NodeType;
  title: string;
  content: string | null;
};

const TREE_QUERY = `
  WITH RECURSIVE tree AS (
    SELECT n.*, printf('%010d:%s', n.position, n.id) AS sort_path
    FROM nodes n WHERE n.project_id=? AND n.parent_id IS NULL
    UNION ALL
    SELECT n.*, tree.sort_path || '/' || printf('%010d:%s', n.position, n.id)
    FROM nodes n JOIN tree ON n.parent_id=tree.id
  )
  SELECT id, project_id, parent_id, position, type, title, content, created_at, updated_at,
    ROW_NUMBER() OVER (ORDER BY sort_path) AS seq
  FROM tree ORDER BY sort_path
`;

export class NodeRepository {
  private readonly findStatement = database.prepare('SELECT * FROM nodes WHERE id=?');
  private readonly findInProjectStatement = database.prepare('SELECT * FROM nodes WHERE id=? AND project_id=?');
  private readonly listTreeStatement = database.prepare(TREE_QUERY);
  private readonly listProjectStatement = database.prepare('SELECT * FROM nodes WHERE project_id=? ORDER BY parent_id, position, created_at, id');
  private readonly nextPositionStatement = database.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS position FROM nodes WHERE project_id=? AND parent_id=?');
  private readonly insertRootStatement = database.prepare(`
    INSERT INTO nodes (id, project_id, parent_id, position, title)
    VALUES (?, ?, NULL, 0, ?)
  `);
  private readonly insertStatement = database.prepare(`
    INSERT INTO nodes (id, project_id, parent_id, position, type, title, content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  private readonly updateNodeStatement = database.prepare(`
    UPDATE nodes SET parent_id=?, position=?, type=?, title=?, content=?,
      updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id=?
  `);
  private readonly updateNodeVersionedStatement = database.prepare(`
    UPDATE nodes SET parent_id=?, position=?, type=?, title=?, content=?,
      updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id=? AND updated_at=?
  `);
  private readonly deleteProjectNodesStatement = database.prepare('DELETE FROM nodes WHERE project_id=?');
  private readonly listSubtreeStatement = database.prepare(`
    WITH RECURSIVE subtree(id) AS (
      SELECT id FROM nodes WHERE id=?
      UNION ALL
      SELECT nodes.id FROM nodes JOIN subtree ON nodes.parent_id=subtree.id
    )
    SELECT * FROM nodes WHERE id IN (SELECT id FROM subtree)
  `);
  private readonly deleteSubtreeStatement = database.prepare(`
    WITH RECURSIVE subtree(id) AS (
      SELECT id FROM nodes WHERE id=?
      UNION ALL
      SELECT nodes.id FROM nodes JOIN subtree ON nodes.parent_id=subtree.id
    )
    DELETE FROM nodes WHERE id IN (SELECT id FROM subtree)
  `);
  private readonly descendantStatement = database.prepare(`
    WITH RECURSIVE subtree(id) AS (
      SELECT id FROM nodes WHERE id=?
      UNION ALL
      SELECT nodes.id FROM nodes JOIN subtree ON nodes.parent_id=subtree.id
    )
    SELECT 1 AS found FROM subtree WHERE id=? LIMIT 1
  `);

  find(id: string): Node | undefined {
    return this.findStatement.get(id) as unknown as Node | undefined;
  }

  findInProject(id: string, projectId: string): Node | undefined {
    return this.findInProjectStatement.get(id, projectId) as unknown as Node | undefined;
  }

  listTree(projectId: string): TreeNode[] {
    return this.listTreeStatement.all(projectId) as unknown as TreeNode[];
  }

  listProject(projectId: string): Node[] {
    return this.listProjectStatement.all(projectId) as unknown as Node[];
  }

  nextPosition(projectId: string, parentId: string): number {
    return Number((this.nextPositionStatement.get(projectId, parentId) as { position: number }).position);
  }

  insertRoot(id: string, projectId: string, title: string) {
    this.insertRootStatement.run(id, projectId, title);
  }

  insert(node: NewNode) {
    this.insertStatement.run(node.id, node.projectId, node.parentId, node.position, node.type, node.title, node.content);
  }

  updateNode(id: string, parentId: string | null, position: number, type: NodeType, title: string, content: string | null, expected?: string) {
    const result = expected
      ? this.updateNodeVersionedStatement.run(parentId, position, type, title, content, id, expected)
      : this.updateNodeStatement.run(parentId, position, type, title, content, id);
    return Number(result.changes);
  }

  isInSubtree(rootId: string, nodeId: string) {
    return Boolean(this.descendantStatement.get(rootId, nodeId));
  }

  deleteProjectNodes(projectId: string) {
    this.deleteProjectNodesStatement.run(projectId);
  }

  listSubtree(id: string): Node[] {
    return this.listSubtreeStatement.all(id) as unknown as Node[];
  }

  deleteSubtree(id: string): number {
    return Number(this.deleteSubtreeStatement.run(id).changes);
  }
}
