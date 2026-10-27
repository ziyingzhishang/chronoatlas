import { describe, expect, it } from 'vitest';
import type { ReleaseFile } from '../content/release-types';
import { CachePackageFiles } from './cache-package-files';

class MemoryCacheStorage {
  readonly entries = new Map<string, Response>();

  async open() {
    const entries = this.entries;
    const key = (request: RequestInfo | URL) => request instanceof Request ? request.url : String(request);
    return {
      match: async (request: RequestInfo | URL) => entries.get(key(request))?.clone(),
      put: async (request: RequestInfo | URL, response: Response) => { entries.set(key(request), response.clone()); },
      delete: async (request: RequestInfo | URL) => entries.delete(key(request)),
      keys: async () => [...entries.keys()].map((url) => new Request(url)),
    } as unknown as Cache;
  }

  asCacheStorage() {
    return this as unknown as CacheStorage;
  }
}

const file = (uri: string): ReleaseFile => ({
  uri,
  mediaType: 'application/json',
  sha256: 'a'.repeat(64),
  bytes: 3,
  collection: 'fixture',
  sourceDigest: 'b'.repeat(64),
});

describe('CachePackageFiles', () => {
  it('isolates identical immutable URIs by release and package in the cache key', async () => {
    const storage = new MemoryCacheStorage();
    const files = new CachePackageFiles({ cacheStorage: storage.asCacheStorage() });
    const first = file('releases/release-a/core.json');
    const second = file('releases/release-b/core.json');

    await files.write('release-a', 'core-zh', first, new Uint8Array([1, 2, 3]));
    await files.write('release-b', 'core-zh', second, new Uint8Array([4, 5, 6]));
    await files.write('release-a', 'optional-media', first, new Uint8Array([7, 8, 9]));

    expect(Array.from((await files.read('release-a', 'core-zh', first.uri)) ?? [])).toEqual([1, 2, 3]);
    expect(Array.from((await files.read('release-b', 'core-zh', second.uri)) ?? [])).toEqual([4, 5, 6]);
    expect(Array.from((await files.read('release-a', 'optional-media', first.uri)) ?? [])).toEqual([7, 8, 9]);
    expect(storage.entries.size).toBe(3);
  });

  it('deletes only the selected package files', async () => {
    const storage = new MemoryCacheStorage();
    const files = new CachePackageFiles({ cacheStorage: storage.asCacheStorage() });
    const core = file('releases/release-a/core.json');
    const media = file('releases/release-a/media.json');
    await files.write('release-a', 'core-zh', core, new Uint8Array([1]));
    await files.write('release-a', 'media', media, new Uint8Array([2]));

    await files.deletePackage('release-a', 'media');

    expect(await files.read('release-a', 'media', media.uri)).toBeUndefined();
    expect(Array.from((await files.read('release-a', 'core-zh', core.uri)) ?? [])).toEqual([1]);
  });

  it.each([
    'releases/latest.json',
    'releases/latest%2ejson',
    'releases/release-a/%2e%2e/latest.json',
  ])('refuses mutable or non-release cache URI %s', async (uri) => {
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });

    await expect(files.write('release-a', 'core-zh', file(uri), new Uint8Array([1]))).rejects.toThrow(/immutable|latest|release/i);
  });
});
