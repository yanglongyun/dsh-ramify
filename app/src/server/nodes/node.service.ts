import { isArtifactType, type ArtifactType, type NodeType } from '../../shared/types.js';
import { ArtifactStore } from '../artifacts/artifact.store.js';
import { renderArtifact } from '../artifacts/render.js';
import { createId, transaction } from '../db/connection.js';
import { HttpError } from '../http/errors.js';
import { ProjectRepository } from '../projects/project.repository.js';
import type { Node } from './node.types.js';
import { NodeRepository } from './node.repository.js';

const MEDIA_TYPES = new Set<ArtifactType>(['image', 'video', 'audio']);

function requireTitle(value: unknown): string {
  const title = typeof value === 'string' ? value.trim() : '';
  if (!title) throw new HttpError(400, 'title required', 'TITLE_REQUIRED');
  return title;
}

function optionalContent(value: unknown): string | null {
  return typeof value === 'string' && value.length ? value : null;
}

function positionOf(value: unknown, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || Number(value) < 0) throw new HttpError(400, 'position must be a non-negative integer', 'INVALID_POSITION');
  return Number(value);
}

function requireArtifactSource(source: unknown): string {
  const value = typeof source === 'string' ? source : '';
  if (!value.trim()) throw new HttpError(400, 'artifact required', 'ARTIFACT_REQUIRED');
  return value;
}

function artifactPath(node: Node): string | null {
  return isArtifactType(node.type) ? node.content : null;
}

export class NodeService {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly projects: ProjectRepository,
    private readonly artifacts: ArtifactStore,
  ) {}

  create(projectId: string, input: Record<string, unknown>) {
    this.requireProject(projectId);
    const parentId = typeof input.parentId === 'string' ? input.parentId : '';
    if (!parentId) throw new HttpError(400, 'parentId required', 'PARENT_REQUIRED');
    if (!this.nodes.findInProject(parentId, projectId)) throw new HttpError(404, 'parent node not found', 'PARENT_NOT_FOUND');

    const artifactType = this.artifactTypeOf(input.artifactType);
    if (input.artifact !== undefined && !artifactType) throw new HttpError(400, 'artifactType required', 'ARTIFACT_TYPE_REQUIRED');
    if (artifactType && input.content !== undefined && input.content !== null) {
      throw new HttpError(400, 'content cannot be combined with artifactType', 'AMBIGUOUS_NODE_CONTENT');
    }
    const id = createId();
    const source = artifactType && input.artifact !== undefined ? requireArtifactSource(input.artifact) : null;
    const artifact = source && artifactType ? this.artifacts.write(projectId, id, artifactType, source) : null;
    try {
      transaction(() => {
        this.nodes.insert({
          id,
          projectId,
          parentId,
          position: positionOf(input.position, this.nodes.nextPosition(projectId, parentId)),
          type: artifactType ?? 'text',
          title: requireTitle(input.title),
          content: artifactType ? artifact : optionalContent(input.content),
        });
        this.projects.touch(projectId);
      });
    } catch (error) {
      this.artifacts.remove(artifact);
      throw error;
    }
    return { id };
  }

  createBatch(projectId: string, input: Record<string, unknown>) {
    this.requireProject(projectId);
    if (!Array.isArray(input.nodes) || input.nodes.length === 0) throw new HttpError(400, 'nodes must be a non-empty array', 'NODES_REQUIRED');
    if (input.nodes.length > 100) throw new HttpError(400, 'batch is limited to 100 nodes', 'BATCH_TOO_LARGE');
    const written: string[] = [];
    try {
      const result = transaction(() => {
        const ids = new Map<string, string>();
        const created: Array<{ key: string; id: string }> = [];
        for (const raw of input.nodes as unknown[]) {
          if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, 'each batch node must be an object', 'INVALID_BATCH_NODE');
          const item = raw as Record<string, unknown>;
          const key = typeof item.key === 'string' ? item.key.trim() : '';
          if (!key || ids.has(key)) throw new HttpError(400, 'batch node keys must be unique', 'INVALID_BATCH_KEY');
          const parentId = typeof item.parentKey === 'string' ? ids.get(item.parentKey)
            : typeof item.parentId === 'string' ? item.parentId : undefined;
          if (!parentId || !this.nodes.findInProject(parentId, projectId)) throw new HttpError(404, `parent not found for ${key}`, 'PARENT_NOT_FOUND');
          const artifactType = this.artifactTypeOf(item.artifactType, key);
          if (item.artifact !== undefined && !artifactType) throw new HttpError(400, `artifactType required for ${key}`, 'ARTIFACT_TYPE_REQUIRED');
          if (artifactType && item.content !== undefined && item.content !== null) {
            throw new HttpError(400, `content cannot be combined with artifactType for ${key}`, 'AMBIGUOUS_NODE_CONTENT');
          }
          const id = createId();
          const source = artifactType && item.artifact !== undefined ? requireArtifactSource(item.artifact) : null;
          const artifact = source && artifactType ? this.artifacts.write(projectId, id, artifactType, source) : null;
          if (artifact) written.push(artifact);
          this.nodes.insert({
            id,
            projectId,
            parentId,
            position: positionOf(item.position, this.nodes.nextPosition(projectId, parentId)),
            type: artifactType ?? 'text',
            title: requireTitle(item.title),
            content: artifactType ? artifact : optionalContent(item.content),
          });
          ids.set(key, id);
          created.push({ key, id });
        }
        this.projects.touch(projectId);
        return { nodes: created };
      });
      return result;
    } catch (error) {
      this.artifacts.removeMany(written);
      throw error;
    }
  }

  update(nodeId: string, input: Record<string, unknown>) {
    const node = this.requireNode(nodeId);
    const title = input.title === undefined ? node.title : requireTitle(input.title);
    const changesContent = input.content !== undefined;
    const type: NodeType = changesContent ? 'text' : node.type;
    const content = changesContent ? optionalContent(input.content) : node.content;
    let parentId = node.parent_id;
    if (input.parentId !== undefined) {
      if (!node.parent_id) throw new HttpError(400, 'root node cannot be moved', 'ROOT_NODE_MOVE_NOT_ALLOWED');
      parentId = typeof input.parentId === 'string' ? input.parentId : '';
      const parent = this.nodes.findInProject(parentId, node.project_id);
      if (!parent) throw new HttpError(404, 'parent node not found', 'PARENT_NOT_FOUND');
      if (parentId === nodeId || this.nodes.isInSubtree(nodeId, parentId)) throw new HttpError(400, 'move would create a cycle', 'TREE_CYCLE');
    }
    const expected = typeof input.expectedUpdatedAt === 'string' ? input.expectedUpdatedAt : undefined;
    transaction(() => {
      if (!this.nodes.updateNode(nodeId, parentId, positionOf(input.position, node.position), type, title, content, expected)) {
        throw new HttpError(409, 'node changed since it was read', 'VERSION_CONFLICT');
      }
      this.projects.touch(node.project_id);
    });
    if (changesContent) this.artifacts.remove(artifactPath(node));
    return this.requireNode(nodeId);
  }

  updateArtifact(nodeId: string, input: Record<string, unknown>) {
    const node = this.requireNode(nodeId);
    if (!isArtifactType(input.artifactType)) throw new HttpError(400, 'artifactType required', 'ARTIFACT_TYPE_REQUIRED');
    const type = input.artifactType;
    const expected = typeof input.expectedUpdatedAt === 'string' ? input.expectedUpdatedAt : undefined;
    if (expected && expected !== node.updated_at) throw new HttpError(409, 'node changed since it was read', 'VERSION_CONFLICT');
    const artifact = this.artifacts.write(node.project_id, nodeId, type, requireArtifactSource(input.artifact));
    const previousPath = artifactPath(node);
    try {
      transaction(() => {
        if (!this.nodes.updateNode(nodeId, node.parent_id, node.position, type, node.title, artifact, expected)) {
          throw new HttpError(409, 'node changed since it was read', 'VERSION_CONFLICT');
        }
        this.projects.touch(node.project_id);
      });
    } catch (error) {
      if (previousPath !== artifact) this.artifacts.remove(artifact);
      throw error;
    }
    if (previousPath !== artifact) this.artifacts.remove(previousPath);
    return { ok: true as const };
  }

  markArtifactError(nodeId: string, input: Record<string, unknown>) {
    const node = this.requireNode(nodeId);
    if (!isArtifactType(node.type)) throw new HttpError(400, 'node has no artifact', 'ARTIFACT_TYPE_REQUIRED');
    const error = typeof input.error === 'string' ? input.error.trim() : '';
    if (!error) throw new HttpError(400, 'error required', 'ERROR_REQUIRED');
    const expected = typeof input.expectedUpdatedAt === 'string' ? input.expectedUpdatedAt : undefined;
    transaction(() => {
      if (!this.nodes.updateNode(nodeId, node.parent_id, node.position, 'error', node.title, error, expected)) {
        throw new HttpError(409, 'node changed since it was read', 'VERSION_CONFLICT');
      }
      this.projects.touch(node.project_id);
    });
    this.artifacts.remove(artifactPath(node));
    return { ok: true as const };
  }

  clearArtifact(nodeId: string) {
    const node = this.requireNode(nodeId);
    transaction(() => {
      this.nodes.updateNode(nodeId, node.parent_id, node.position, 'text', node.title, null);
      this.projects.touch(node.project_id);
    });
    this.artifacts.remove(artifactPath(node));
    return { ok: true as const };
  }

  delete(nodeId: string) {
    const node = this.requireNode(nodeId);
    if (!node.parent_id) throw new HttpError(400, 'root node cannot be deleted', 'ROOT_NODE_IMMUTABLE');
    const paths = this.nodes.listSubtree(nodeId).map(artifactPath);
    const deleted = transaction(() => {
      const count = this.nodes.deleteSubtree(nodeId);
      this.projects.touch(node.project_id);
      return count;
    });
    this.artifacts.removeMany(paths);
    return { ok: true as const, deleted };
  }

  html(nodeId: string) {
    const node = this.requireArtifactNode(nodeId);
    const type = node.type as ArtifactType;
    const path = node.content as string;
    const mime = this.artifacts.mime(path, type);
    const source = MEDIA_TYPES.has(type)
      ? mime.startsWith('text/uri-list') ? this.artifacts.readText(path).trim() : `/api/nodes/${node.id}/artifact`
      : this.artifacts.readText(path);
    return { document: renderArtifact(source, type) };
  }

  content(nodeId: string) {
    const node = this.requireNode(nodeId);
    return { content: node.type === 'text' || node.type === 'error' ? node.content : null };
  }

  artifactSource(nodeId: string) {
    const node = this.requireArtifactNode(nodeId);
    return { source: this.artifacts.source(node.content as string, node.type as ArtifactType), artifactType: node.type };
  }

  artifact(nodeId: string) {
    const node = this.requireArtifactNode(nodeId);
    const path = node.content as string;
    const type = node.type as ArtifactType;
    return { content: this.artifacts.read(path), mime: this.artifacts.mime(path, type), filename: this.artifacts.filename(path) };
  }

  private artifactTypeOf(value: unknown, key?: string): ArtifactType | null {
    if (value === undefined || value === null) return null;
    if (isArtifactType(value)) return value;
    throw new HttpError(400, key ? `invalid artifactType for ${key}` : 'invalid artifactType', 'INVALID_ARTIFACT_TYPE');
  }

  private requireProject(projectId: string) {
    const project = this.projects.find(projectId);
    if (!project) throw new HttpError(404, 'project not found', 'PROJECT_NOT_FOUND');
    return project;
  }

  private requireNode(nodeId: string) {
    const node = this.nodes.find(nodeId);
    if (!node) throw new HttpError(404, 'node not found', 'NODE_NOT_FOUND');
    return node;
  }

  private requireArtifactNode(nodeId: string) {
    const node = this.requireNode(nodeId);
    if (!isArtifactType(node.type) || !node.content) throw new HttpError(404, 'artifact not found', 'ARTIFACT_NOT_FOUND');
    return node;
  }
}
