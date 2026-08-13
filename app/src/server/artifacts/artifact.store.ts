import { randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import type { ArtifactType } from '../../shared/types.js';
import { dataDirectory } from '../data-directory.js';
import { HttpError } from '../http/errors.js';

const TEXT_FORMATS: Partial<Record<ArtifactType, { extension: string; mime: string }>> = {
  html: { extension: 'html', mime: 'text/html; charset=utf-8' },
  markdown: { extension: 'md', mime: 'text/markdown; charset=utf-8' },
  svg: { extension: 'svg', mime: 'image/svg+xml' },
};

const MEDIA_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif', 'image/gif': 'gif', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'video/ogg': 'ogv', 'video/quicktime': 'mov', 'video/webm': 'webm',
  'audio/aac': 'aac', 'audio/flac': 'flac', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'webm',
};

const EXTENSION_MIMES = Object.fromEntries(
  Object.entries(MEDIA_EXTENSIONS).map(([mime, extension]) => [extension, mime]),
) as Record<string, string>;

function decodeDataUri(value: string, type: ArtifactType) {
  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/i.exec(value.trim());
  if (!match || !match[1].toLowerCase().startsWith(`${type}/`)) {
    throw new HttpError(400, `invalid ${type} data URI`, 'INVALID_MEDIA_SOURCE');
  }
  const mime = match[1].toLowerCase();
  let data: Buffer;
  try {
    data = match[2] ? Buffer.from(match[3].replace(/\s/g, ''), 'base64') : Buffer.from(decodeURIComponent(match[3]), 'utf8');
  } catch {
    throw new HttpError(400, `invalid ${type} data URI`, 'INVALID_MEDIA_SOURCE');
  }
  if (!data.length) throw new HttpError(400, `empty ${type} data URI`, 'INVALID_MEDIA_SOURCE');
  return { data, mime, extension: MEDIA_EXTENSIONS[mime] || 'bin' };
}

function encodeSource(data: Buffer, mime: string) {
  return `data:${mime};base64,${data.toString('base64')}`;
}

export class ArtifactStore {
  readonly root = join(dataDirectory, 'artifacts');

  constructor() {
    mkdirSync(this.root, { recursive: true });
  }

  write(projectId: string, nodeId: string, type: ArtifactType, content: string): string {
    let data: Buffer;
    let mime: string;
    let extension: string;
    const textFormat = TEXT_FORMATS[type];
    if (textFormat) {
      data = Buffer.from(content, 'utf8');
      ({ mime, extension } = textFormat);
    } else if (content.trim().startsWith('data:')) {
      ({ data, mime, extension } = decodeDataUri(content, type));
    } else {
      data = Buffer.from(`${content.trim()}\n`, 'utf8');
      mime = 'text/uri-list; charset=utf-8';
      extension = 'url';
    }

    const relativePath = `${projectId}/${nodeId}.${extension}`;
    const absolutePath = this.resolvePath(relativePath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    const temporaryPath = `${absolutePath}.tmp-${randomUUID()}`;
    try {
      writeFileSync(temporaryPath, data, { flag: 'wx', mode: 0o600 });
      const descriptor = openSync(temporaryPath, 'r+');
      try { fsyncSync(descriptor); } finally { closeSync(descriptor); }
      renameSync(temporaryPath, absolutePath);
    } catch (error) {
      rmSync(temporaryPath, { force: true });
      throw error;
    }
    return relativePath;
  }

  read(path: string): Buffer {
    try { return readFileSync(this.resolvePath(path)); }
    catch { throw new HttpError(404, 'artifact file not found', 'ARTIFACT_FILE_NOT_FOUND'); }
  }

  readText(path: string): string {
    return this.read(path).toString('utf8');
  }

  mime(path: string, type: ArtifactType): string {
    if (path.endsWith('.url')) return 'text/uri-list; charset=utf-8';
    const textFormat = TEXT_FORMATS[type];
    if (textFormat) return textFormat.mime;
    return EXTENSION_MIMES[this.extension(path)] || 'application/octet-stream';
  }

  source(path: string, type: ArtifactType): string {
    const mime = this.mime(path, type);
    const data = this.read(path);
    if (mime.startsWith('text/uri-list')) return data.toString('utf8').trim();
    if (mime.startsWith('text/') || mime.startsWith('image/svg+xml')) return data.toString('utf8');
    return encodeSource(data, mime.split(';')[0]);
  }

  remove(path: string | null | undefined) {
    if (!path) return;
    const absolutePath = this.resolvePath(path);
    try { unlinkSync(absolutePath); } catch {}
    try { rmSync(dirname(absolutePath), { recursive: false }); } catch {}
  }

  removeMany(paths: Array<string | null>) {
    for (const path of new Set(paths.filter((value): value is string => Boolean(value)))) this.remove(path);
  }

  filename(path: string) {
    return basename(path);
  }

  extension(path: string) {
    return extname(path).slice(1) || 'bin';
  }

  revision(path: string | null): string {
    if (!path) return '';
    try {
      const stat = statSync(this.resolvePath(path));
      return `${stat.mtimeMs}:${stat.size}`;
    } catch {
      return 'missing';
    }
  }

  private resolvePath(relativePath: string) {
    if (!/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.[a-z0-9]+$/.test(relativePath)) {
      throw new HttpError(500, 'invalid artifact path', 'INVALID_ARTIFACT_PATH');
    }
    const absolutePath = resolve(this.root, ...relativePath.split('/'));
    if (!absolutePath.startsWith(`${resolve(this.root)}${sep}`)) {
      throw new HttpError(500, 'invalid artifact path', 'INVALID_ARTIFACT_PATH');
    }
    return absolutePath;
  }
}
