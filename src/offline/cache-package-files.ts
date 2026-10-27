import type { ReleaseFile } from '../content/release-types';

const DEFAULT_CACHE_NAME = 'chronoatlas-release-files-v1';
const CACHE_KEY_ORIGIN = 'https://offline.chronoatlas.invalid';
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export interface CachePackageFilesOptions {
  cacheStorage?: CacheStorage;
  cacheName?: string;
}

export class CachePackageFiles {
  private readonly cacheStorage: CacheStorage;
  private readonly cacheName: string;

  constructor(options: CachePackageFilesOptions = {}) {
    const storage = options.cacheStorage ?? globalThis.caches;
    if (!storage) throw new Error('Cache Storage is unavailable');
    this.cacheStorage = storage;
    this.cacheName = options.cacheName ?? DEFAULT_CACHE_NAME;
  }

  async write(releaseId: string, packageId: string, file: ReleaseFile, bytes: Uint8Array) {
    validateImmutableReleaseUri(releaseId, packageId, file.uri);
    const cache = await this.cacheStorage.open(this.cacheName);
    await cache.put(cacheKey(releaseId, packageId, file.uri), new Response(bytes.slice(), {
      headers: {
        'content-type': file.mediaType,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    }));
  }

  async read(releaseId: string, packageId: string, uri: string): Promise<Uint8Array | undefined> {
    validateImmutableReleaseUri(releaseId, packageId, uri);
    const cache = await this.cacheStorage.open(this.cacheName);
    const response = await cache.match(cacheKey(releaseId, packageId, uri));
    return response ? new Uint8Array(await response.arrayBuffer()) : undefined;
  }

  async deletePackage(releaseId: string, packageId: string) {
    validateId('release', releaseId);
    validateId('package', packageId);
    const cache = await this.cacheStorage.open(this.cacheName);
    const prefix = cachePackagePrefix(releaseId, packageId);
    const requests = await cache.keys();
    await Promise.all(requests
      .filter((request) => request.url.startsWith(prefix))
      .map((request) => cache.delete(request)));
  }
}

function validateImmutableReleaseUri(releaseId: string, packageId: string, uri: string) {
  validateId('release', releaseId);
  validateId('package', packageId);
  const decoded = repeatedlyDecode(uri);
  if (decoded.includes('?') || decoded.includes('#')) throw new Error(`Release file URI must be immutable: ${uri}`);
  const segments = decoded.split('/');
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error(`Release file URI must not traverse directories: ${uri}`);
  }
  if (segments.some((segment) => segment.toLowerCase() === 'latest.json')) {
    throw new Error(`Mutable latest.json cannot be stored as an immutable release file: ${uri}`);
  }
  if (segments.length < 3 || segments[0] !== 'releases' || segments[1] !== releaseId || !segments.slice(2).every(Boolean)) {
    throw new Error(`Release file URI does not belong to release ${releaseId}: ${uri}`);
  }
}

function validateId(label: string, value: string) {
  if (!SAFE_ID.test(value)) throw new Error(`Invalid ${label} identifier: ${value}`);
}

function repeatedlyDecode(value: string) {
  let decoded = value;
  try {
    while (true) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) return decoded;
      decoded = next;
    }
  } catch {
    throw new Error(`Invalid encoded release file URI: ${value}`);
  }
}

function cachePackagePrefix(releaseId: string, packageId: string) {
  return `${CACHE_KEY_ORIGIN}/__chronoatlas_offline__/v1/${encodeURIComponent(releaseId)}/${encodeURIComponent(packageId)}/`;
}

function cacheKey(releaseId: string, packageId: string, uri: string) {
  return `${cachePackagePrefix(releaseId, packageId)}${encodeURIComponent(uri)}`;
}
