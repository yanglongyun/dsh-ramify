import { createId, transaction } from '../db/connection.js';
import { HttpError } from '../http/errors.js';
import { NodeRepository } from '../nodes/node.repository.js';
import { ArtifactStore } from '../artifacts/artifact.store.js';
import { ProjectRepository } from './project.repository.js';
import type { Project } from './project.types.js';
import { isArtifactType } from '../../shared/types.js';

type CreatedProject = Project & { rootId: string; nodeIds: string[] };

export class ProjectService {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly nodes: NodeRepository,
    private readonly artifacts: ArtifactStore,
  ) {}

  list() {
    return this.projects.list();
  }

  create(input: Record<string, unknown>): CreatedProject {
    const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
    if (!prompt) throw new HttpError(400, 'prompt is required', 'PROMPT_REQUIRED');
    const title = typeof input.title === 'string' && input.title.trim()
      ? input.title.trim()
      : prompt.slice(0, 20);
    const projectId = createId();
    const rootId = createId();
    const count = input.count === undefined ? 0 : Number(input.count);
    if (!Number.isInteger(count) || count < 0 || count > 5) {
      throw new HttpError(400, 'count must be an integer between 0 and 5', 'INVALID_COUNT');
    }
    const nodeIds = Array.from({ length: count }, () => createId());

    transaction(() => {
      this.projects.insert({ id: projectId, title, prompt });
      this.nodes.insertRoot(rootId, projectId, prompt);
      nodeIds.forEach((id, position) => {
        this.nodes.insert({
          id, projectId, parentId: rootId, position, type: 'html',
          title: `方案 ${position + 1}（生成中）`, content: null,
        });
      });
    });

    return { ...this.requireProject(projectId), rootId, nodeIds };
  }

  rename(projectId: string, input: Record<string, unknown>) {
    this.requireProject(projectId);
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) throw new HttpError(400, 'title is required', 'TITLE_REQUIRED');
    const expected = typeof input.expectedUpdatedAt === 'string' ? input.expectedUpdatedAt : undefined;
    if (!this.projects.rename(projectId, title, expected)) {
      throw new HttpError(409, 'project changed since it was read', 'VERSION_CONFLICT');
    }
    return this.requireProject(projectId);
  }

  delete(projectId: string) {
    const artifacts = this.nodes.listProject(projectId)
      .map((node) => isArtifactType(node.type) ? node.content : null);
    transaction(() => {
      this.nodes.deleteProjectNodes(projectId);
      this.projects.delete(projectId);
    });
    this.artifacts.removeMany(artifacts);
    return { ok: true as const };
  }

  tree(projectId: string) {
    const nodes = this.nodes.listTree(projectId).map((node) => ({
      ...node,
      artifact_revision: this.artifacts.revision(isArtifactType(node.type) ? node.content : null),
    }));
    return {
      project: this.requireProject(projectId),
      nodes,
    };
  }

  version(): string {
    return this.projects.listVersion();
  }

  treeVersion(projectId: string): string {
    const version = this.projects.findVersion(projectId);
    if (version === undefined) throw new HttpError(404, 'project not found', 'PROJECT_NOT_FOUND');
    return version;
  }

  private requireProject(projectId: string) {
    const project = this.projects.find(projectId);
    if (!project) throw new HttpError(404, 'project not found', 'PROJECT_NOT_FOUND');
    return project;
  }
}
