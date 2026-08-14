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

// GET 处理函数仍然按平常方式 writeHead + end(body) 收尾;这里劫持 end(),
// 保留它们已经写好的响应头(含 Content-Length),只是不真的发送 body。
function suppressBody(res: ServerResponse): void {
  const end = res.end.bind(res);
  res.end = ((...args: Parameters<ServerResponse['end']>) => {
    const callback = args.find((arg): arg is () => void => typeof arg === 'function');
    return callback ? end(callback) : end();
  }) as ServerResponse['end'];
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
    // HEAD 复用 GET 路由:匹配同一条路由,但只回响应头、不写响应体。
    const isHead = req.method === 'HEAD';
    const method = isHead ? 'GET' : req.method;
    for (const route of this.routes) {
      if (method !== route.method) continue;
      const params = matchPath(route.segments, path);
      if (!params) continue;
      if (isHead) suppressBody(res);
      await route.handler({ req, res, path, params });
      return true;
    }
    return false;
  }

  private add(method: string, template: string, handler: RouteHandler) {
    this.routes.push({ method, segments: parseTemplate(template), handler });
  }
}
