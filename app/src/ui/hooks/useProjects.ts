import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => api.listProjects()
    .then(setProjects)
    .catch(console.error)
    .finally(() => setLoading(false)), []);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    const events = new EventSource(api.eventsUrl());
    events.onmessage = () => { void reload(); };
    return () => events.close();
  }, [reload]);

  return { projects, loading, reload };
}
