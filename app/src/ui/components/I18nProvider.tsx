import { createContext, useContext, useLayoutEffect, useMemo } from 'react';
import type { Locale } from '../../shared/types';
import { INTL_LOCALES, translate, type MessageKey } from '../lib/i18n';

type Translator = (key: MessageKey, values?: Record<string, string | number>) => string;
type I18nValue = { locale: Locale; intlLocale: string; t: Translator };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.title = translate(locale, 'app.title');
  }, [locale]);

  const value = useMemo<I18nValue>(() => ({
    locale,
    intlLocale: INTL_LOCALES[locale],
    t: (key, values) => translate(locale, key, values),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
