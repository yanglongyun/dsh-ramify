import { mkdirSync, statSync, watch, type FSWatcher } from 'node:fs';
import { join } from 'node:path';
import { dataDirectory } from './data-directory.js';
import { ProjectRepository } from './projects/project.repository.js';

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

  // CLI/直接编辑 sqlite 或 artifacts 文件会绕过 service 层的 touch(),这里补上:
  // 检测到此类外部改动后主动 touch 项目的 updated_at,前端轮询 version 接口即可感知。
  // 必须在 startChangeWatcher() 被调用时才构造(此时 initializeSchema() 已经建好表),
  // 不能提到模块顶层,否则会在 schema 初始化之前抢先 prepare 语句而报表不存在。
  const projects = new ProjectRepository();

  let databaseRevision = databaseFingerprint();
  // 我们自己的 touch 也会改变 db 文件指纹,每次主动写入后立即重新采样一次基线,
  // 避免这里把自己的写入误判成"外部又改了一次"从而无限重触发。
  const resyncDatabaseRevision = () => { databaseRevision = databaseFingerprint(); };

  setInterval(() => {
    const nextRevision = databaseFingerprint();
    if (nextRevision === databaseRevision) return;
    databaseRevision = nextRevision;
    // 不知道具体是哪个项目被改了,保守地把所有项目都 touch 一遍。
    debounce('database', () => { projects.touchAll(); resyncDatabaseRevision(); });
  }, 250).unref();

  watchers.push(watch(artifactsDirectory, { persistent: false, recursive: true }, (_event, filename) => {
    const projectId = filename ? String(filename).split(/[\\/]/)[0] : '';
    debounce(`artifact:${projectId}`, () => {
      if (projectId) projects.touch(projectId); else projects.touchAll();
      resyncDatabaseRevision();
    });
  }));
}
