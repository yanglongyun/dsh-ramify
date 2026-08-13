import { createId, transaction } from '../db/connection.js';
import { HttpError } from '../http/errors.js';
import { NodeRepository } from '../nodes/node.repository.js';
import { projectEvents } from '../realtime/events.js';
import { ArtifactStore } from '../artifacts/artifact.store.js';
import { ProjectRepository } from './project.repository.js';
import type { Project } from './project.types.js';
import { isArtifactType } from '../../shared/types.js';

type CreatedProject = Project & { rootId: string };

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

    transaction(() => {
      this.projects.insert({ id: projectId, title, prompt });
      this.nodes.insertRoot(rootId, projectId, prompt);
    });

    projectEvents.publish(projectId);
    return { ...this.requireProject(projectId), rootId };
  }

  rename(projectId: string, input: Record<string, unknown>) {
    this.requireProject(projectId);
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) throw new HttpError(400, 'title is required', 'TITLE_REQUIRED');
    const expected = typeof input.expectedUpdatedAt === 'string' ? input.expectedUpdatedAt : undefined;
    if (!this.projects.rename(projectId, title, expected)) {
      throw new HttpError(409, 'project changed since it was read', 'VERSION_CONFLICT');
    }
    projectEvents.publish(projectId);
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
    projectEvents.publish(projectId);
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

  private requireProject(projectId: string) {
    const project = this.projects.find(projectId);
    if (!project) throw new HttpError(404, 'project not found', 'PROJECT_NOT_FOUND');
    return project;
  }
}
