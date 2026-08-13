import assert from 'node:assert/strict';
import test from 'node:test';
import { renderArtifact } from './render.js';

test('markdown rendering produces a document', () => {
  const html = renderArtifact('# 标题\n\n正文', 'markdown');
  assert.match(html, /<h1>标题<\/h1>/);
  assert.match(html, /<!DOCTYPE html>/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /connect-src 'none'/);
});

test('HTML artifacts receive a restrictive policy before user markup', () => {
  const html = renderArtifact('<!doctype html><html><head><title>x</title></head><body><script>fetch("https://example.com")</script></body></html>', 'html');
  assert.match(html, /<head><meta http-equiv="Content-Security-Policy"/);
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script>'));
});

test('fragment artifacts keep the doctype first so the page stays in standards mode', () => {
  const html = renderArtifact('<!doctype html>\n<meta charset="utf-8"><title>x</title><div>y</div>', 'html');
  assert.ok(html.toLowerCase().startsWith('<!doctype html>'), 'doctype 必须仍是第一个节点');
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<title>'));
});

test('fragments without a doctype get one, instead of being served in quirks mode', () => {
  const html = renderArtifact('<meta charset="utf-8"><title>x</title><div>y</div>', 'html');
  assert.ok(html.toLowerCase().startsWith('<!doctype html>'), '没写 doctype 的片段要补上');
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<title>'));
});

test('media artifacts render safe native previews without scripts', () => {
  const image = renderArtifact('https://cdn.example/image.png?x=1&y="bad', 'image');
  assert.match(image, /<img src="https:\/\/cdn\.example\/image\.png\?x=1&amp;y=&quot;bad"/);
  assert.match(image, /img-src 'self' https:/);
  assert.match(image, /script-src 'none'/);

  const video = renderArtifact('data:video/mp4;base64,AAAA', 'video');
  assert.match(video, /<video[^>]+controls[^>]+playsinline/);
  assert.doesNotMatch(video, /autoplay/);

  const audio = renderArtifact('https://cdn.example/audio.mp3', 'audio');
  assert.match(audio, /<audio[^>]+controls/);
});
