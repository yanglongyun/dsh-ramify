import { createServer } from 'node:http';
import { createRequestHandler } from './app.js';
import { initializeSchema } from './db/schema.js';

const PORT = Number(process.env.PORT) || 9519;
const HOST = process.env.HOST || '127.0.0.1';

initializeSchema();

createServer(createRequestHandler()).listen(PORT, HOST, () => {
  console.log(`[dsh-ramify] canvas on http://${HOST}:${PORT}`);
});
