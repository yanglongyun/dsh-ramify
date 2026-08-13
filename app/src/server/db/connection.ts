import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { dataDirectory } from '../data-directory.js';

export const database = new DatabaseSync(join(dataDirectory, 'ramify.db'));

export function transaction<T>(operation: () => T): T {
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export const createId = () => randomUUID().replaceAll('-', '').slice(0, 12);
