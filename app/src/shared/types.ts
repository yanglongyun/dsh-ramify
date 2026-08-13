export const ARTIFACT_TYPES = ['html', 'markdown', 'svg', 'image', 'video', 'audio'] as const;
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;
export const LOCALES = ['zh-CN', 'en', 'ja', 'es', 'de'] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];
export type NodeType = 'text' | ArtifactType | 'error';
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type Locale = (typeof LOCALES)[number];

export type AppSettings = {
  theme: ThemePreference;
  locale: Locale;
};

export function isArtifactType(value: unknown): value is ArtifactType {
  return typeof value === 'string' && ARTIFACT_TYPES.includes(value as ArtifactType);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value as ThemePreference);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.includes(value as Locale);
}
