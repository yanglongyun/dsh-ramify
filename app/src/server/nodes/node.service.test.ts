import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const dataDirectory = mkdtempSync(join(tmpdir(), 'ramify-test-'));
process.env.RAMIFY_DATA_DIR = dataDirectory;

const [{ initializeSchema }, { database }, { NodeRepository }, { NodeService }, { ProjectRepository }, { ProjectService }, { HttpError }, { ArtifactStore }] = await Promise.all([
  import('../db/schema.js'), import('../db/connection.js'), import('./node.repository.js'), import('./node.service.js'),
  import('../projects/project.repository.js'), import('../projects/project.service.js'), import('../http/errors.js'), import('../artifacts/artifact.store.js'),
]);

initializeSchema();
const projects = new ProjectRepository();
const nodes = new NodeRepository();
const artifacts = new ArtifactStore();
const projectService = new ProjectService(projects, nodes, artifacts);
const nodeService = new NodeService(nodes, projects, artifacts);

test('models an ordered tree of titled nodes with optional content and artifacts', () => {
  const project = projectService.create({ prompt: '测试需求' });
  const root = nodes.find(project.rootId)!;
  assert.equal(root.title, '测试需求');
  assert.equal(root.content, null);
  assert.equal(root.type, 'text');
  const batch = nodeService.createBatch(project.id, { nodes: [
    { key: 'content', parentId: project.rootId, position: 1, title: '想法', content: '一段节点正文' },
    { key: 'artifact', parentId: project.rootId, position: 0, title: '作品', artifactType: 'html' },
    { key: 'child', parentKey: 'content', position: 0, title: '子节点' },
  ] });
  assert.deepEqual(projectService.tree(project.id).nodes.map((node) => node.title), ['测试需求', '作品', '想法', '子节点']);
  assert.equal(nodes.find(batch.nodes[0].id)?.content, '一段节点正文');
  assert.equal(nodes.find(batch.nodes[1].id)?.type, 'html');
  assert.equal(nodes.find(batch.nodes[1].id)?.content, null);
  const contentNode = nodes.find(batch.nodes[0].id)!;
  const updated = nodeService.update(contentNode.id, { title: '新想法', content: '新正文', expectedUpdatedAt: contentNode.updated_at });
  assert.equal(updated.title, '新想法');
  assert.equal(updated.content, '新正文');
  assert.throws(() => nodeService.update(contentNode.id, { title: '冲突', expectedUpdatedAt: contentNode.updated_at }),
    (error) => error instanceof HttpError && error.code === 'VERSION_CONFLICT');
  assert.throws(() => nodeService.update(contentNode.id, { parentId: batch.nodes[2].id }),
    (error) => error instanceof HttpError && error.code === 'TREE_CYCLE');
});

test('stores artifact paths in content and derives state from type plus content', () => {
  const project = projectService.create({ prompt: '文件测试' });
  const created = nodeService.create(project.id, {
    parentId: project.rootId, title: '页面', artifactType: 'html', artifact: '<h1>第一版</h1>',
  });
  const node = nodes.find(created.id)!;
  assert.equal(node.type, 'html');
  assert.equal(node.content, `${project.id}/${node.id}.html`);
  assert.equal(nodeService.artifactSource(node.id).source, '<h1>第一版</h1>');
  nodeService.updateArtifact(node.id, { artifactType: 'html', artifact: '<h1>第二版</h1>' });
  assert.equal(nodes.find(node.id)?.content, node.content);
  assert.equal(nodeService.artifactSource(node.id).source, '<h1>第二版</h1>');
  writeFileSync(join(artifacts.root, project.id, `${node.id}.html`), '<h1>直接编辑</h1>');
  assert.equal(nodeService.artifactSource(node.id).source, '<h1>直接编辑</h1>');
  nodeService.markArtifactError(node.id, { error: '生成失败' });
  assert.equal(nodes.find(node.id)?.type, 'error');
  assert.equal(nodes.find(node.id)?.content, '生成失败');
  nodeService.clearArtifact(node.id);
  assert.equal(nodes.find(node.id)?.type, 'text');
  assert.equal(nodes.find(node.id)?.content, null);
  assert.throws(() => artifacts.read(`${project.id}/${node.id}.html`), (error) => error instanceof HttpError && error.code === 'ARTIFACT_FILE_NOT_FOUND');
  assert.throws(() => nodeService.create(project.id, {
    parentId: project.rootId, title: '歧义节点', content: '正文', artifactType: 'html',
  }), (error) => error instanceof HttpError && error.code === 'AMBIGUOUS_NODE_CONTENT');
});

test('decodes local media, stores remote references, and validates media sources', () => {
  const project = projectService.create({ prompt: '媒体测试' });
  const audio = nodeService.create(project.id, {
    parentId: project.rootId, title: '音频', artifactType: 'audio', artifact: 'data:audio/mpeg;base64,AAAA',
  });
  const storedAudio = nodes.find(audio.id)!;
  assert.equal(storedAudio.content, `${project.id}/${audio.id}.mp3`);
  assert.equal(artifacts.read(storedAudio.content as string).toString('hex'), '000000');
  const image = nodeService.create(project.id, {
    parentId: project.rootId, title: '图片', artifactType: 'image', artifact: 'https://cdn.example/poster.webp',
  });
  assert.equal(nodes.find(image.id)?.content, `${project.id}/${image.id}.url`);
  assert.throws(() => nodeService.create(project.id, { parentId: project.rootId, title: '坏视频', artifactType: 'video', artifact: 'sk-secret' }),
    (error) => error instanceof HttpError && error.code === 'INVALID_MEDIA_SOURCE');
});

test('database constraints preserve the clean node type model', () => {
  const project = projectService.create({ prompt: '约束测试' });
  const node = nodeService.create(project.id, { parentId: project.rootId, title: '普通节点' });
  assert.throws(() => database.prepare("UPDATE nodes SET type='unknown' WHERE id=?").run(node.id));
  assert.throws(() => database.prepare("UPDATE nodes SET type='error', content=NULL WHERE id=?").run(node.id));
  assert.throws(() => nodeService.delete(project.rootId), (error) => error instanceof HttpError && error.code === 'ROOT_NODE_IMMUTABLE');
});

test.after(() => {
  database.close();
  rmSync(dataDirectory, { recursive: true, force: true });
});
