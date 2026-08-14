import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Project } from '../types';
import { useVersionPolling } from './usePolling';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => api.listProjects()
    .then(setProjects)
    .catch(console.error)
    .finally(() => setLoading(false)), []);

  useEffect(() => { void reload(); }, [reload]);
  useVersionPolling(api.projectsVersion, reload);

  return { projects, loading, reload };
}
