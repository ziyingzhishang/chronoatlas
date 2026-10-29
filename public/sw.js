const APP_SHELL_MANIFEST = __APP_SHELL_MANIFEST__;
const APP_BASE = self.location.pathname.slice(0, -'sw.js'.length);
const APP_SHELL_CACHE = `chronoatlas-app-shell-${manifestFingerprint(APP_SHELL_MANIFEST)}`;
const RELEASE_CACHE = 'chronoatlas-runtime-releases-v1';
const LATEST_CACHE = 'chronoatlas-runtime-latest-v1';
const APP_SHELL_URLS = new Set(APP_SHELL_MANIFEST.map((entry) => new URL(entry.url, self.location.origin).href));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_MANIFEST.map((entry) => entry.url)))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names
    .filter((name) => name.startsWith('chronoatlas-app-shell-') && name !== APP_SHELL_CACHE)
    .map((name) => caches.delete(name))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const relativePath = safeRelativePath(url.pathname);
  if (relativePath === null) return;
  if (relativePath === 'releases/latest.json') {
    event.respondWith(networkFirstLatest(request));
    return;
  }
  if (relativePath.startsWith('releases/') && !relativePath.endsWith('/latest.json')) {
    event.respondWith(cacheFirstImmutableRelease(request));
    return;
  }
  if (APP_SHELL_URLS.has(url.href)) {
    event.respondWith(caches.open(APP_SHELL_CACHE).then((cache) => cache.match(request).then((cached) => cached || fetch(request))));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.open(APP_SHELL_CACHE).then((cache) => cache.match(`${APP_BASE}index.html`))));
  }
});

async function networkFirstLatest(request) {
  let cache;
  try {
    cache = await caches.open(LATEST_CACHE);
  } catch {
    cache = undefined;
  }
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      if (cache) await bestEffortCachePut(cache, request, response);
      return response;
    }
    const cached = cache ? await bestEffortCacheMatch(cache, request) : undefined;
    if (cached) return cached;
    return response;
  } catch (error) {
    const cached = cache ? await bestEffortCacheMatch(cache, request) : undefined;
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirstImmutableRelease(request) {
  let cache;
  try {
    cache = await caches.open(RELEASE_CACHE);
  } catch {
    cache = undefined;
  }
  const cached = cache ? await bestEffortCacheMatch(cache, request) : undefined;
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && cache) await bestEffortCachePut(cache, request, response);
  return response;
}

async function bestEffortCachePut(cache, request, response) {
  try {
    await cache.put(request, response.clone());
  } catch {
    // Storage may be full or the response may be ineligible for caching.
  }
}

async function bestEffortCacheMatch(cache, request) {
  try {
    return await cache.match(request);
  } catch {
    return undefined;
  }
}

function manifestFingerprint(entries) {
  let value = 2166136261;
  for (const entry of entries) {
    const text = `${entry.url}:${entry.revision}`;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
  }
  return (value >>> 0).toString(16);
}

function safeRelativePath(pathname) {
  if (!pathname.startsWith(APP_BASE)) return null;
  let decoded = pathname.slice(APP_BASE.length);
  try {
    for (let pass = 0; pass < 4; pass += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return null;
  }
  if (/[\\\u0000-\u001f\u007f]/.test(decoded)
    || decoded.split('/').some((segment) => segment === '.' || segment === '..')) return null;
  return decoded;
}
