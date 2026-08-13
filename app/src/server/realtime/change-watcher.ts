import { mkdirSync, statSync, watch, type FSWatcher } from 'node:fs';
import { join } from 'node:path';
import { dataDirectory } from '../data-directory.js';
import { projectEvents } from './events.js';

let started = false;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const watchers: FSWatcher[] = [];

function debounce(key: string, operation: () => void) {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    timers.delete(key);
    operation();
  }, 80);
  timer.unref();
  timers.set(key, timer);
}

function databaseFingerprint() {
  return ['ramify.db', 'ramify.db-wal'].map((name) => {
    try {
      const stat = statSync(join(dataDirectory, name));
      return `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
    } catch {
      return 'missing';
    }
  }).join('|');
}

export function startChangeWatcher() {
  if (started) return;
  started = true;
  const artifactsDirectory = join(dataDirectory, 'artifacts');
  mkdirSync(artifactsDirectory, { recursive: true });

  let databaseRevision = databaseFingerprint();
  setInterval(() => {
    const nextRevision = databaseFingerprint();
    if (nextRevision === databaseRevision) return;
    databaseRevision = nextRevision;
    debounce('database', () => projectEvents.publishAll());
  }, 250).unref();

  watchers.push(watch(artifactsDirectory, { persistent: false, recursive: true }, (_event, filename) => {
    const projectId = filename ? String(filename).split(/[\\/]/)[0] : '';
    debounce(`artifact:${projectId}`, () => projectId ? projectEvents.publish(projectId) : projectEvents.publishAll());
  }));
}
