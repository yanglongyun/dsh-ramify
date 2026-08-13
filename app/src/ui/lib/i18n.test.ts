import assert from 'node:assert/strict';
import test from 'node:test';
import { LOCALES } from '../../shared/types';
import { MESSAGES, translate } from './i18n';

test('all supported locales contain the same messages', () => {
  const expected = Object.keys(MESSAGES['zh-CN']).sort();
  for (const locale of LOCALES) assert.deepEqual(Object.keys(MESSAGES[locale]).sort(), expected);
});

test('translation interpolates values', () => {
  assert.equal(translate('en', 'project.versions', { count: 3 }), '3 versions');
  assert.equal(translate('ja', 'node.expand', { count: 8 }), '子孫ノード 8 件を展開');
});
