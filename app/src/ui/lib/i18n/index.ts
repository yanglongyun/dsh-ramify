import type { Locale } from "../../../shared/types";
import { zhCN } from "./zh-CN";
import { en } from "./en";
import { ja } from "./ja";
import { es } from "./es";
import { de } from "./de";
import type { MessageKey, Messages } from "./types";

export type { MessageKey, Messages } from "./types";

export const MESSAGES: Record<Locale, Messages> = { 'zh-CN': zhCN, en, ja, es, de };
export const INTL_LOCALES: Record<Locale, string> = { 'zh-CN': 'zh-CN', en: 'en-US', ja: 'ja-JP', es: 'es-ES', de: 'de-DE' };

export function translate(locale: Locale, key: MessageKey, values: Record<string, string | number> = {}): string {
  return MESSAGES[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}
