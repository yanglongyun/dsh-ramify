import { useEffect, useLayoutEffect, useState } from 'react';
import type { AppSettings, Locale } from '../../shared/types';
import { api } from '../api';
import { resolveTheme } from '../lib/theme';
import { dshParentOrigin } from '../lib/dshBridge';

type HostPreferences = { locale: 'zh-CN' | 'en'; theme: 'light' | 'dark' };

function browserLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useSettingsSync() {
  const [settings, setSettings] = useState<AppSettings>({ theme: 'system', locale: 'system' });
  const [host, setHost] = useState<HostPreferences | null>(null);
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  const resolved = settings.theme === 'system' && host !== null
    ? host.theme
    : resolveTheme(settings.theme, prefersDark);
  const locale: Locale = settings.locale === 'system'
    ? (host?.locale ?? browserLocale())
    : settings.locale;

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
    const parentOrigin = dshParentOrigin();
    if (parentOrigin === null) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      const value = event.data as Record<string, unknown> | null;
      if (value?.type !== 'ramify:dsh-preferences' || value.version !== 1) return;
      if (!['zh-CN', 'en'].includes(String(value.locale))) return;
      if (!['light', 'dark'].includes(String(value.theme))) return;
      setHost({ locale: value.locale as HostPreferences['locale'], theme: value.theme as HostPreferences['theme'] });
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'ramify:dsh-preferences-ready', version: 1 }, parentOrigin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    // 设置本身很小(几十字节),没必要为它单独开一条 version 接口,
    // 直接每秒轮询一次 /api/settings,变了才 setState,免去 SSE 长连接。
    let cancelled = false;
    const poll = () => {
      void api.settings().then((next) => {
        if (cancelled) return;
        setSettings((prev) => (prev.theme === next.theme && prev.locale === next.locale ? prev : next));
      }).catch(console.error);
    };
    poll();
    const timer = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { ...settings, locale };
}
