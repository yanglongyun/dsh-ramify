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

  list(): ProjectSummary[] {
    return this.listStatement.all() as unknown as ProjectSummary[];
  }

  find(id: string): Project | undefined {
    return this.findStatement.get(id) as unknown as Project | undefined;
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

  rename(id: string, title: string, expected?: string): number {
    const result = expected
      ? this.renameVersionedStatement.run(title, id, expected)
      : this.renameStatement.run(title, id);
    return Number(result.changes);
  }
}
