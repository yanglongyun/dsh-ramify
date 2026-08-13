import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AppSettings } from '../../shared/types.js';
import { BASE_SECURITY_HEADERS } from '../http/security.js';

type Client = { response: ServerResponse; projectId: string | null };

class ProjectEvents {
  private readonly clients = new Set<Client>();

  constructor() {
    setInterval(() => this.ping(), 25_000).unref();
  }

  connect(req: IncomingMessage, res: ServerResponse) {
    const projectId = new URL(req.url || '/', 'http://localhost').searchParams.get('project');
    res.writeHead(200, {
      ...BASE_SECURITY_HEADERS,
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });
    res.write('retry: 2000\n\n');
    const client = { response: res, projectId };
    this.clients.add(client);
    req.on('close', () => this.clients.delete(client));
  }

  publish(projectId: string) {
    const payload = `data: ${JSON.stringify({ project: projectId })}\n\n`;
    for (const client of this.clients) {
      if (!client.projectId || client.projectId === projectId) this.write(client, payload);
    }
  }

  publishAll() {
    const payload = `data: ${JSON.stringify({ project: null })}\n\n`;
    for (const client of this.clients) this.write(client, payload);
  }

  publishSettings(settings: AppSettings) {
    const payload = `event: settings\ndata: ${JSON.stringify(settings)}\n\n`;
    for (const client of this.clients) this.write(client, payload);
  }

  private ping() {
    for (const client of this.clients) this.write(client, ': ping\n\n');
  }

  private write(client: Client, payload: string) {
    try {
      client.response.write(payload);
    } catch {
      this.clients.delete(client);
    }
  }
}

export const projectEvents = new ProjectEvents();
