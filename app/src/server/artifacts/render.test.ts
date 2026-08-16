import assert from 'node:assert/strict';
import test from 'node:test';
import { renderArtifact } from './render.js';

test('markdown rendering produces a document', () => {
  const html = renderArtifact('# 标题\n\n正文', 'markdown');
  assert.match(html, /<h1>标题<\/h1>/);
  assert.match(html, /<!DOCTYPE html>/);
  assert.doesNotMatch(html, /Content-Security-Policy/);
});

test('HTML artifacts preserve executable web content without injecting restrictions', () => {
  const html = renderArtifact('<!doctype html><html><head><title>x</title></head><body><script>fetch("https://example.com")</script></body></html>', 'html');
  assert.match(html, /<script>fetch\("https:\/\/example\.com"\)<\/script>/);
  assert.doesNotMatch(html, /Content-Security-Policy/);
});

test('fragment artifacts keep the doctype first so the page stays in standards mode', () => {
  const html = renderArtifact('<!doctype html>\n<meta charset="utf-8"><title>x</title><div>y</div>', 'html');
  assert.ok(html.toLowerCase().startsWith('<!doctype html>'), 'doctype 必须仍是第一个节点');
  assert.doesNotMatch(html, /Content-Security-Policy/);
});

test('fragments without a doctype get one, instead of being served in quirks mode', () => {
  const html = renderArtifact('<meta charset="utf-8"><title>x</title><div>y</div>', 'html');
  assert.ok(html.toLowerCase().startsWith('<!doctype html>'), '没写 doctype 的片段要补上');
  assert.doesNotMatch(html, /Content-Security-Policy/);
});

test('media artifacts render native previews without restrictive policies', () => {
  const image = renderArtifact('https://cdn.example/image.png?x=1&y="bad', 'image');
  assert.match(image, /<img src="https:\/\/cdn\.example\/image\.png\?x=1&amp;y=&quot;bad"/);
  assert.doesNotMatch(image, /Content-Security-Policy/);

  const video = renderArtifact('data:video/mp4;base64,AAAA', 'video');
  assert.match(video, /<video[^>]+controls[^>]+playsinline/);
  assert.doesNotMatch(video, /autoplay/);

  const audio = renderArtifact('https://cdn.example/audio.mp3', 'audio');
  assert.match(audio, /<audio[^>]+controls/);
});
