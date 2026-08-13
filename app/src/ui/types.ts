import type { NodeType } from '../shared/types';
export type { ArtifactType, NodeType } from '../shared/types';

export type Id = string;

export type Project = {
  id: Id;
  title: string;
  prompt: string;
  created_at: string;
  updated_at: string;
  node_count?: number;
  generating_count?: number;
  preview_node_id?: Id | null;
};

export type CreatedProject = Project & { rootId: Id; nodeIds: Id[] };

export type TreeNode = {
  seq: number;
  id: Id;
  project_id: Id;
  parent_id: Id | null;
  position: number;
  type: NodeType;
  title: string;
  content: string | null;
  artifact_revision: string;
  created_at: string;
  updated_at: string;
};

export type Tree = { project: Project; nodes: TreeNode[] };
