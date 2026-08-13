import { useEffect, useLayoutEffect, useState } from 'react';
import type { AppSettings } from '../../shared/types';
import { api } from '../api';
import { resolveTheme } from '../lib/theme';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useSettingsSync() {
  const [settings, setSettings] = useState<AppSettings>({ theme: 'system', locale: 'zh-CN' });
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  const resolved = resolveTheme(settings.theme, prefersDark);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = settings.theme;
  }, [settings.theme, resolved]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    void api.settings().then(setSettings).catch(console.error);
    const events = new EventSource(api.eventsUrl());
    const update = (event: MessageEvent<string>) => {
      try {
        setSettings(JSON.parse(event.data) as AppSettings);
      } catch (error) {
        console.error(error);
      }
    };
    events.addEventListener('settings', update as EventListener);
    return () => events.close();
  }, []);

  return settings;
}
