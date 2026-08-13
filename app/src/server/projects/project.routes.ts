import { readJsonBody } from '../http/body.js';
import { Router } from '../http/router.js';
import { sendJson } from '../http/response.js';
import { ProjectService } from './project.service.js';

export function registerProjectRoutes(router: Router, service: ProjectService) {
  router.get('/api/projects', ({ res }) => {
    sendJson(res, 200, service.list());
  });

  router.post('/api/projects', async ({ req, res }) => {
    sendJson(res, 200, service.create(await readJsonBody(req)));
  });

  router.put('/api/projects/:projectId', async ({ req, res, params }) => {
    sendJson(res, 200, service.rename(params.projectId, await readJsonBody(req)));
  });

  router.delete('/api/projects/:projectId', ({ res, params }) => {
    sendJson(res, 200, service.delete(params.projectId));
  });

  router.get('/api/projects/:projectId/tree', ({ res, params }) => {
    sendJson(res, 200, service.tree(params.projectId));
  });
}
