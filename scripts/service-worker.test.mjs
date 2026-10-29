import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

async function workerHarness({ fetcher, cache }) {
  const source = (await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'))
    .replace('__APP_SHELL_MANIFEST__', '[]');
  const listeners = new Map();
  const caches = { open: async () => cache, keys: async () => [], delete: async () => true };
  const self = {
    location: new URL('https://example.test/atlas/sw.js'),
    addEventListener: (type, listener) => listeners.set(type, listener),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  vm.runInNewContext(source, { self, caches, fetch: fetcher, Request, Response, URL });
  return { listeners, caches };
}

test('uses network-first for mutable latest metadata', async () => {
  const network = new Response('{"releaseId":"new"}');
  const fetcher = async () => network.clone();
  const putCalls = [];
  const { listeners } = await workerHarness({
    fetcher,
    cache: { match: async () => undefined, put: async (...args) => putCalls.push(args), addAll: async () => {} },
  });
  let responsePromise;
  listeners.get('fetch')({
    request: new Request('https://example.test/atlas/releases/latest.json'),
    respondWith: (value) => { responsePromise = value; },
  });

  assert.equal(await (await responsePromise).text(), '{"releaseId":"new"}');
  assert.equal(putCalls.length, 1);
});

test('falls back to cached latest metadata for a temporary unsuccessful response', async () => {
  const cached = new Response('{"releaseId":"stable"}');
  const { listeners } = await workerHarness({
    fetcher: async () => new Response('temporarily unavailable', { status: 503 }),
    cache: { match: async () => cached.clone(), put: async () => {}, addAll: async () => {} },
  });
  let responsePromise;
  listeners.get('fetch')({
    request: new Request('https://example.test/atlas/releases/latest.json'),
    respondWith: (value) => { responsePromise = value; },
  });

  assert.equal(await (await responsePromise).json().then((value) => value.releaseId), 'stable');
});

test('returns successful network data even when writing it to Cache Storage fails', async () => {
  const { listeners } = await workerHarness({
    fetcher: async () => new Response('{"releaseId":"new"}'),
    cache: {
      match: async () => undefined,
      put: async () => { throw new Error('quota exceeded'); },
      addAll: async () => {},
    },
  });
  let responsePromise;
  listeners.get('fetch')({
    request: new Request('https://example.test/atlas/releases/latest.json'),
    respondWith: (value) => { responsePromise = value; },
  });

  assert.equal(await (await responsePromise).json().then((value) => value.releaseId), 'new');
});

test('treats encoded latest metadata as mutable and never as an immutable release file', async () => {
  const calls = [];
  const { listeners } = await workerHarness({
    fetcher: async (...args) => { calls.push(['fetch', ...args]); return new Response('{"releaseId":"new"}'); },
    cache: {
      match: async () => undefined,
      put: async (...args) => { calls.push(['put', ...args]); },
      addAll: async () => {},
    },
  });
  let responsePromise;
  listeners.get('fetch')({
    request: new Request('https://example.test/atlas/releases/%6catest.json'),
    respondWith: (value) => { responsePromise = value; },
  });

  assert.equal(await (await responsePromise).json().then((value) => value.releaseId), 'new');
  assert.equal(calls.filter(([name]) => name === 'fetch').length, 1);
  assert.equal(calls.filter(([name]) => name === 'put').length, 1);
});

test('uses cache-first for same-origin immutable release files', async () => {
  let fetchCount = 0;
  const cached = new Response('cached');
  const { listeners } = await workerHarness({
    fetcher: async () => { fetchCount += 1; return new Response('network'); },
    cache: { match: async () => cached.clone(), put: async () => {}, addAll: async () => {} },
  });
  let responsePromise;
  listeners.get('fetch')({
    request: new Request('https://example.test/atlas/releases/2026.10/core.json'),
    respondWith: (value) => { responsePromise = value; },
  });

  assert.equal(await (await responsePromise).text(), 'cached');
  assert.equal(fetchCount, 0);
});

test('returns immutable network data even when Cache Storage is not writable', async () => {
  const { listeners } = await workerHarness({
    fetcher: async () => new Response('network'),
    cache: {
      match: async () => undefined,
      put: async () => { throw new Error('quota exceeded'); },
      addAll: async () => {},
    },
  });
  let responsePromise;
  listeners.get('fetch')({
    request: new Request('https://example.test/atlas/releases/2026.10/core.json'),
    respondWith: (value) => { responsePromise = value; },
  });

  assert.equal(await (await responsePromise).text(), 'network');
});

test('does not intercept or cache third-party terrain and satellite requests', async () => {
  let responded = false;
  const { listeners } = await workerHarness({
    fetcher: async () => new Response('tile'),
    cache: { match: async () => undefined, put: async () => { throw new Error('must not cache'); }, addAll: async () => {} },
  });
  listeners.get('fetch')({
    request: new Request('https://tiles.example.net/satellite/1/2/3.jpg'),
    respondWith: () => { responded = true; },
  });

  assert.equal(responded, false);
});
