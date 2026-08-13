import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTheme } from './theme';

test('resolves explicit and system theme preferences', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('system', true), 'dark');
});
