import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { createStaticServer } from './app.mjs';

let directory;
let server;
let origin;

before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'manyfold-server-'));
  await mkdir(path.join(directory, '_app/immutable'), { recursive: true });
  await writeFile(path.join(directory, 'index.html'), '<h1>Manyfold</h1>');
  await writeFile(path.join(directory, '_app/immutable/start.abc.js'), 'export {};');
  await writeFile(path.join(directory, 'favicon.svg'), '<svg/>');
  await writeFile(path.join(directory, '.private'), 'hidden');
  server = createStaticServer(directory);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (directory) await rm(directory, { recursive: true, force: true });
});

test('serves the home page and HEAD with revalidation', async () => {
  const home = await fetch(`${origin}/`);
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(home.headers.get('cache-control'), 'no-cache');
  assert.equal(await home.text(), '<h1>Manyfold</h1>');
  const head = await fetch(`${origin}/`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '17');
  assert.equal(await head.text(), '');
});

test('serves JS and favicon with appropriate MIME and cache headers', async () => {
  const script = await fetch(`${origin}/_app/immutable/start.abc.js`);
  assert.equal(script.status, 200);
  assert.equal(script.headers.get('content-type'), 'text/javascript; charset=utf-8');
  assert.match(script.headers.get('cache-control'), /immutable/);
  assert.equal(await script.text(), 'export {};');
  const icon = await fetch(`${origin}/favicon.svg`);
  assert.equal(icon.headers.get('content-type'), 'image/svg+xml');
  assert.equal(icon.headers.get('cache-control'), 'no-cache');
  assert.equal(await icon.text(), '<svg/>');
});

test('returns 404 for missing pages and assets instead of HTML fallback', async () => {
  for (const resource of ['/missing', '/_app/immutable/missing.js']) {
    const response = await fetch(`${origin}${resource}`);
    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Not Found');
  }
});

test('rejects writes, malformed URLs, hidden files and encoded traversal', async () => {
  const post = await fetch(origin, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
  for (const [resource, expected] of [
    ['/%zz', 400],
    ['/%00', 403],
    ['/.private', 403],
    ['/%2e%2e%2fpackage.json', 403],
    ['/%2e%2e%5cpackage.json', 403]
  ]) {
    const status = await new Promise((resolve, reject) => {
      get(`${origin}${resource}`, (response) => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      }).on('error', reject);
    });
    assert.equal(status, expected, resource);
  }
});
