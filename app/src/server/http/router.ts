import type { IncomingMessage, ServerResponse } from 'node:http';

export type RouteContext = {
  req: IncomingMessage;
  res: ServerResponse;
  path: string;
  params: Record<string, string>;
};

type RouteHandler = (context: RouteContext) => void | Promise<void>;
type RouteSegment = { kind: 'literal'; value: string } | { kind: 'parameter'; name: string };
type Route = { method: string; segments: RouteSegment[]; handler: RouteHandler };

function parseTemplate(template: string): RouteSegment[] {
  return template.split('/').filter(Boolean).map((segment) => segment.startsWith(':')
    ? { kind: 'parameter', name: segment.slice(1) }
    : { kind: 'literal', value: segment });
}

function matchPath(segments: RouteSegment[], path: string): Record<string, string> | null {
  const values = path.split('/').filter(Boolean);
  if (values.length !== segments.length) return null;
  const params: Record<string, string> = {};

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (segment.kind === 'literal') {
      if (segment.value !== values[index]) return null;
    } else {
      params[segment.name] = decodeURIComponent(values[index]);
    }
  }
  return params;
}

export class Router {
  private readonly routes: Route[] = [];

  get(template: string, handler: RouteHandler) {
    this.add('GET', template, handler);
  }

  post(template: string, handler: RouteHandler) {
    this.add('POST', template, handler);
  }

  put(template: string, handler: RouteHandler) {
    this.add('PUT', template, handler);
  }

  delete(template: string, handler: RouteHandler) {
    this.add('DELETE', template, handler);
  }

  async handle(req: IncomingMessage, res: ServerResponse, path: string): Promise<boolean> {
    for (const route of this.routes) {
      if (req.method !== route.method) continue;
      const params = matchPath(route.segments, path);
      if (!params) continue;
      await route.handler({ req, res, path, params });
      return true;
    }
    return false;
  }

  private add(method: string, template: string, handler: RouteHandler) {
    this.routes.push({ method, segments: parseTemplate(template), handler });
  }
}
