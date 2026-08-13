import type { ThemePreference } from '../../shared/types';

export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}
