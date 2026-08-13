import type { NodeType } from '../../shared/types.js';

export type Node = {
  id: string;
  project_id: string;
  parent_id: string | null;
  position: number;
  type: NodeType;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type TreeNode = Node & {
  seq: number;
  artifact_revision: string;
};
