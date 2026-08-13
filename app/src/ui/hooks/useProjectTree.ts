import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Tree } from '../types';

export function useProjectTree(projectId: string) {
  const [tree, setTree] = useState<Tree | null>(null);
  const reload = useCallback(() => { void api.tree(projectId).then(setTree).catch(console.error); }, [projectId]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    const events = new EventSource(api.eventsUrl(projectId));
    events.onmessage = reload;
    return () => events.close();
  }, [projectId, reload]);

  return { tree, nodes: tree?.nodes ?? [], reload };
}
