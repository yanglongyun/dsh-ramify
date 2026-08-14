import { readJsonBody } from '../http/body.js';
import { Router } from '../http/router.js';
import { sendJson } from '../http/response.js';
import { ProjectService } from './project.service.js';

export function registerProjectRoutes(router: Router, service: ProjectService) {
  router.get('/api/projects', ({ res }) => {
    sendJson(res, 200, service.list());
  });

  // 供项目列表页轮询用的轻量标记,免去每秒拉一次全量列表。
  router.get('/api/projects/version', ({ res }) => {
    sendJson(res, 200, { version: service.version() });
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

  // 供画布页轮询用的轻量标记,值变化了前端才重新拉整棵树。
  router.get('/api/projects/:projectId/version', ({ res, params }) => {
    sendJson(res, 200, { version: service.treeVersion(params.projectId) });
  });
}
