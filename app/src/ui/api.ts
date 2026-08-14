import type { AppSettings, LocalePreference, ThemePreference } from '../shared/types';
import type { CreatedProject, Project, Tree } from './types';

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
  updateLocale: (locale: LocalePreference) => req<AppSettings>('/api/settings/locale', {
    method: 'PUT', body: JSON.stringify({ locale }),
  }),
  listProjects: () => req<Project[]>('/api/projects'),
  projectsVersion: () => req<{ version: string }>('/api/projects/version').then((body) => body.version),
  projectTreeVersion: (id: string) => req<{ version: string }>(`/api/projects/${id}/version`).then((body) => body.version),
  createProject: (prompt: string, count: number) => req<CreatedProject>('/api/projects', {
    method: 'POST', body: JSON.stringify({ prompt, count }),
  }),
  createPlaceholders: (projectId: string, parentId: string, count: number) =>
    req<{ nodes: Array<{ key: string; id: string }> }>(`/api/projects/${projectId}/nodes/batch`, {
      method: 'POST',
      body: JSON.stringify({ nodes: Array.from({ length: count }, (_, index) => ({
        key: `branch-${index + 1}`, parentId,
        title: `分支 ${index + 1}（生成中）`, artifactType: 'html',
      })) }),
    }),
  deleteProject: (id: string) => req<{ ok: true }>(`/api/projects/${id}`, { method: 'DELETE' }),
  markNodeError: (id: string, error: string) => req<{ ok: true }>(`/api/nodes/${id}/artifact/error`, { method: 'PUT', body: JSON.stringify({ error }) }),
  tree: (id: string) => req<Tree>(`/api/projects/${id}/tree`),
  nodeHtmlUrl: (nodeId: string, revision?: string) => {
    const query = new URLSearchParams({ embed: '2' });
    if (revision) query.set('revision', revision);
    return `/api/nodes/${nodeId}/html?${query}`;
  },
  nodeArtifactUrl: (nodeId: string) => `/api/nodes/${nodeId}/artifact`,
  nodeArtifactSource: async (nodeId: string) => {
    const res = await fetch(`/api/nodes/${nodeId}/artifact/source`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return body.source as string;
  },
};
