import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Tree } from '../types';
import { useVersionPolling } from './usePolling';

export function useProjectTree(projectId: string) {
  const [tree, setTree] = useState<Tree | null>(null);
  const reload = useCallback(() => { void api.tree(projectId).then(setTree).catch(console.error); }, [projectId]);
  const fetchVersion = useCallback(() => api.projectTreeVersion(projectId), [projectId]);

  useEffect(() => { reload(); }, [reload]);
  useVersionPolling(fetchVersion, reload);

  return { tree, nodes: tree?.nodes ?? [], reload };
}
