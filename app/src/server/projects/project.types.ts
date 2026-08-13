export type Project = {
  id: string;
  title: string;
  prompt: string;
  created_at: string;
  updated_at: string;
};

export type ProjectSummary = Project & {
  node_count: number;
  generating_count: number;
  preview_node_id: string | null;
};
