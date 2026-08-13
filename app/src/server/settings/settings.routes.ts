import { readJsonBody } from '../http/body.js';
import { HttpError } from '../http/errors.js';
import { Router } from '../http/router.js';
import { sendJson } from '../http/response.js';
import { projectEvents } from '../realtime/events.js';
import { isLocale, isThemePreference } from '../../shared/types.js';
import { SettingsStore } from './settings.store.js';

export function registerSettingsRoutes(router: Router, store: SettingsStore) {
  router.get('/api/settings', ({ res }) => {
    sendJson(res, 200, store.read());
  });

  router.put('/api/settings/theme', async ({ req, res }) => {
    const { theme } = await readJsonBody(req);
    if (!isThemePreference(theme)) {
      throw new HttpError(400, 'theme must be light, dark, or system', 'INVALID_THEME');
    }
    const settings = store.write({ ...store.read(), theme });
    projectEvents.publishSettings(settings);
    sendJson(res, 200, settings);
  });

  router.put('/api/settings/locale', async ({ req, res }) => {
    const { locale } = await readJsonBody(req);
    if (!isLocale(locale)) {
      throw new HttpError(400, 'locale must be zh-CN, en, ja, es, or de', 'INVALID_LOCALE');
    }
    const settings = store.write({ ...store.read(), locale });
    projectEvents.publishSettings(settings);
    sendJson(res, 200, settings);
  });
}
