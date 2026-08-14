import { database } from '../db/connection.js';
import type { Project, ProjectSummary } from './project.types.js';

export class ProjectRepository {
  private readonly listStatement = database.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM nodes n WHERE n.project_id=p.id AND n.parent_id IS NOT NULL) AS node_count,
      (SELECT COUNT(*) FROM nodes n WHERE n.project_id=p.id
        AND n.type IN ('html','markdown','svg','image','video','audio') AND n.content IS NULL) AS generating_count,
      (SELECT n.id FROM nodes n WHERE n.project_id=p.id AND n.parent_id IS NOT NULL
        AND n.type IN ('html','markdown','svg','image','video','audio') AND n.content IS NOT NULL
        ORDER BY n.created_at DESC LIMIT 1) AS preview_node_id
    FROM projects p
    ORDER BY p.updated_at DESC
  `);
  private readonly findStatement = database.prepare('SELECT * FROM projects WHERE id=?');
  private readonly insertStatement = database.prepare('INSERT INTO projects (id, title, prompt) VALUES (?, ?, ?)');
  private readonly deleteStatement = database.prepare('DELETE FROM projects WHERE id=?');
  private readonly touchStatement = database.prepare(`
    UPDATE projects SET updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id=?
  `);
  private readonly renameStatement = database.prepare(`
    UPDATE projects SET title=?, updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id=?
  `);
  private readonly renameVersionedStatement = database.prepare(`
    UPDATE projects SET title=?, updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id=? AND updated_at=?
  `);
  private readonly touchAllStatement = database.prepare(`
    UPDATE projects SET updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
  `);
  // 轻量版本标记:项目数量 + 最新 updated_at,足以让前端轮询判断"是否需要重新拉取列表"。
  private readonly listVersionStatement = database.prepare(`
    SELECT COUNT(*) AS count, COALESCE(MAX(updated_at), '') AS latest FROM projects
  `);
  private readonly findVersionStatement = database.prepare('SELECT updated_at FROM projects WHERE id=?');

  list(): ProjectSummary[] {
    return this.listStatement.all() as unknown as ProjectSummary[];
  }

  find(id: string): Project | undefined {
    return this.findStatement.get(id) as unknown as Project | undefined;
  }

  listVersion(): string {
    const row = this.listVersionStatement.get() as { count: number; latest: string };
    return `${row.count}:${row.latest}`;
  }

  // 项目自身的 updated_at 已经在每次节点增删改时被 touch(),
  // 所以它同时就是"该项目 + 其节点树"的版本标记,树轮询直接复用它即可。
  findVersion(id: string): string | undefined {
    const row = this.findVersionStatement.get(id) as { updated_at: string } | undefined;
    return row?.updated_at;
  }

  insert(project: Pick<Project, 'id' | 'title' | 'prompt'>) {
    this.insertStatement.run(project.id, project.title, project.prompt);
  }

  delete(id: string) {
    this.deleteStatement.run(id);
  }

  touch(id: string) {
    this.touchStatement.run(id);
  }

  touchAll() {
    this.touchAllStatement.run();
  }

  rename(id: string, title: string, expected?: string): number {
    const result = expected
      ? this.renameVersionedStatement.run(title, id, expected)
      : this.renameStatement.run(title, id);
    return Number(result.changes);
  }
}
