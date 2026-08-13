import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { SettingsStore } from './settings.store.js';

test('settings default to system Chinese and persist theme and locale', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ramify-settings-'));
  try {
    const store = new SettingsStore(directory);
    assert.deepEqual(store.read(), { theme: 'system', locale: 'zh-CN' });
    assert.deepEqual(store.write({ theme: 'dark', locale: 'ja' }), { theme: 'dark', locale: 'ja' });
    assert.deepEqual(store.read(), { theme: 'dark', locale: 'ja' });
    assert.deepEqual(JSON.parse(readFileSync(join(directory, 'settings.json'), 'utf8')), { theme: 'dark', locale: 'ja' });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('invalid settings fall back without rewriting user data', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ramify-settings-'));
  try {
    writeFileSync(join(directory, 'settings.json'), '{"theme":"sepia"}\n');
    assert.deepEqual(new SettingsStore(directory).read(), { theme: 'system', locale: 'zh-CN' });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
