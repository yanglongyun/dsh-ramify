import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { platform } from 'node:process';

function resolveDataDirectory() {
  if (process.env.RAMIFY_DATA_DIR) return process.env.RAMIFY_DATA_DIR;
  if (platform === 'darwin') return join(homedir(), 'Library', 'Application Support', 'Ramify');
  if (platform === 'win32') return join(process.env.APPDATA || homedir(), 'Ramify');
  return join(process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share'), 'ramify');
}

export const dataDirectory = resolveDataDirectory();
mkdirSync(dataDirectory, { recursive: true });
