import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { injectServiceWorkerManifest } from './inject-service-worker-manifest.mjs';

async function fixture(template = 'const manifest = __APP_SHELL_MANIFEST__;') {
  const root = await mkdtemp(path.join(os.tmpdir(), 'chronoatlas-sw-'));
  await mkdir(path.join(root, 'assets'), { recursive: true });
  await mkdir(path.join(root, 'data', 'base'), { recursive: true });
  await mkdir(path.join(root, 'data', 'world'), { recursive: true });
  await writeFile(path.join(root, 'sw.js'), template);
  await writeFile(path.join(root, 'index.html'), '<script src="/atlas/assets/index-a1b2c3d4.js"></script>');
  await writeFile(path.join(root, 'assets', 'index-a1b2c3d4.js'), 'console.log("app")');
  await writeFile(path.join(root, 'assets', 'index-e5f6a7b8.css'), 'body{}');
  await writeFile(path.join(root, 'assets', 'map-worker-8765dcba.mjs'), 'self.onmessage=()=>{}');
  await writeFile(path.join(root, 'assets', 'reader-1234abcd.woff2'), 'font');
  await writeFile(path.join(root, 'assets', 'map-pin-1234abcd.svg'), '<svg/>');
  await writeFile(path.join(root, 'data', 'base', 'land-outline.geojson'), '{}');
  await writeFile(path.join(root, 'data', 'world', '800.json'), '{}');
  await writeFile(path.join(root, 'assets', 'index-a1b2c3d4.js.map'), '{}');
  return root;
}

test('injects a revisioned base-aware app shell from the completed dist only', async () => {
  const root = await fixture();
  const entries = await injectServiceWorkerManifest(root, { base: '/atlas/' });
  const worker = await readFile(path.join(root, 'sw.js'), 'utf8');

  assert.deepEqual(entries.map((entry) => entry.url), [
    '/atlas/assets/index-a1b2c3d4.js',
    '/atlas/assets/index-e5f6a7b8.css',
    '/atlas/assets/map-pin-1234abcd.svg',
    '/atlas/assets/map-worker-8765dcba.mjs',
    '/atlas/assets/reader-1234abcd.woff2',
    '/atlas/data/base/land-outline.geojson',
    '/atlas/index.html',
  ]);
  assert.ok(entries.every((entry) => /^[a-f0-9]{64}$/.test(entry.revision)));
  assert.doesNotMatch(worker, /__APP_SHELL_MANIFEST__/);
  assert.doesNotMatch(worker, /data\/world|\.js\.map|https:\/\//);
});

test('rejects a missing or repeated manifest placeholder', async () => {
  const missing = await fixture('const manifest = [];');
  await assert.rejects(injectServiceWorkerManifest(missing), /exactly one/i);

  const repeated = await fixture('__APP_SHELL_MANIFEST__;__APP_SHELL_MANIFEST__;');
  await assert.rejects(injectServiceWorkerManifest(repeated), /exactly one/i);
});

test('rejects an unsafe deployment base', async () => {
  const root = await fixture();
  await assert.rejects(injectServiceWorkerManifest(root, { base: '/../escape/' }), /safe root-relative/i);
});
