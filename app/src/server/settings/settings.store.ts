import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AppSettings } from '../../shared/types.js';
import { isLocale, isThemePreference } from '../../shared/types.js';
import { dataDirectory } from '../data-directory.js';

const DEFAULT_SETTINGS: AppSettings = { theme: 'system', locale: 'zh-CN' };

export class SettingsStore {
  private readonly file: string;

  constructor(directory = dataDirectory) {
    mkdirSync(directory, { recursive: true });
    this.file = join(directory, 'settings.json');
  }

  read(): AppSettings {
    if (!existsSync(this.file)) return { ...DEFAULT_SETTINGS };
    try {
      const value = JSON.parse(readFileSync(this.file, 'utf8')) as Record<string, unknown>;
      return {
        theme: isThemePreference(value.theme) ? value.theme : DEFAULT_SETTINGS.theme,
        locale: isLocale(value.locale) ? value.locale : DEFAULT_SETTINGS.locale,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  write(settings: AppSettings): AppSettings {
    const temporary = `${this.file}.tmp`;
    writeFileSync(temporary, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
    renameSync(temporary, this.file);
    return settings;
  }
}
