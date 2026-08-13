import assert from 'node:assert/strict';
import type { IncomingMessage } from 'node:http';
import test from 'node:test';
import { isAllowedHost, UI_CONTENT_SECURITY_POLICY } from './security.js';

const request = (host?: string) => ({ headers: { host } }) as IncomingMessage;

test('allows loopback hosts and rejects DNS rebinding hosts', () => {
  assert.equal(isAllowedHost(request('127.0.0.1:9519')), true);
  assert.equal(isAllowedHost(request('localhost:9519')), true);
  assert.equal(isAllowedHost(request('[::1]:9519')), true);
  assert.equal(isAllowedHost(request('attacker.example:9519')), false);
  assert.equal(isAllowedHost(request()), false);
});

test('supports an explicit host allowlist', () => {
  const previous = process.env.RAMIFY_ALLOWED_HOSTS;
  process.env.RAMIFY_ALLOWED_HOSTS = 'ramify.local, 192.168.1.20';
  try {
    assert.equal(isAllowedHost(request('ramify.local:9519')), true);
    assert.equal(isAllowedHost(request('192.168.1.20:9519')), true);
  } finally {
    if (previous === undefined) delete process.env.RAMIFY_ALLOWED_HOSTS;
    else process.env.RAMIFY_ALLOWED_HOSTS = previous;
  }
});

test('allows embedding only from a loopback DSH web surface', () => {
  assert.match(UI_CONTENT_SECURITY_POLICY, /frame-ancestors 'self' http:\/\/127\.0\.0\.1:\* http:\/\/localhost:\*/);
  assert.doesNotMatch(UI_CONTENT_SECURITY_POLICY, /frame-ancestors 'none'/);
});
