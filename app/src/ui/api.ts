import type { AppSettings, Locale, ThemePreference } from '../shared/types';
import type { Project, Tree } from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body as T;
}

export const api = {
  settings: () => req<AppSettings>('/api/settings'),
  updateTheme: (theme: ThemePreference) => req<AppSettings>('/api/settings/theme', {
    method: 'PUT', body: JSON.stringify({ theme }),
  }),
  updateLocale: (locale: Locale) => req<AppSettings>('/api/settings/locale', {
    method: 'PUT', body: JSON.stringify({ locale }),
  }),
  listProjects: () => req<Project[]>('/api/projects'),
  deleteProject: (id: string) => req<{ ok: true }>(`/api/projects/${id}`, { method: 'DELETE' }),
  markNodeError: (id: string, error: string) => req<{ ok: true }>(`/api/nodes/${id}/artifact/error`, { method: 'PUT', body: JSON.stringify({ error }) }),
  tree: (id: string) => req<Tree>(`/api/projects/${id}/tree`),
  nodeHtmlUrl: (nodeId: string, revision?: string) =>
    `/api/nodes/${nodeId}/html${revision ? `?revision=${encodeURIComponent(revision)}` : ''}`,
  nodeArtifactUrl: (nodeId: string) => `/api/nodes/${nodeId}/artifact`,
  eventsUrl: (projectId?: string) => (projectId ? `/api/events?project=${projectId}` : '/api/events'),
  nodeArtifactSource: async (nodeId: string) => {
    const res = await fetch(`/api/nodes/${nodeId}/artifact/source`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return body.source as string;
  },
};
