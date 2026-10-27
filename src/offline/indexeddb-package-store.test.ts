import { describe, expect, it } from 'vitest';
import type { ReleaseFile, ReleaseManifest, ReleasePackage } from '../content/release-types';
import { FakeIndexedDbFactory } from '../test/fake-indexeddb';
import { CachePackageFiles } from './cache-package-files';
import { IndexedDbPackageStore } from './indexeddb-package-store';
import { MemoryPackageStore } from './memory-package-store';
import type { PackageStore } from './package-store';

class MemoryCacheStorage {
  private readonly entries = new Map<string, Response>();
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
  asCacheStorage() { return this as unknown as CacheStorage; }
}

const releaseFile = (releaseId: string, name = 'core.json'): ReleaseFile => ({
  uri: `releases/${releaseId}/${name}`,
  mediaType: 'application/json',
  sha256: 'a'.repeat(64),
  bytes: 3,
  collection: 'fixture',
  sourceDigest: 'b'.repeat(64),
});

const releasePackage = (releaseId: string, id = 'core-zh'): ReleasePackage => ({
  id,
  kind: 'content',
  required: true,
  dependencies: [],
  compressedBytes: 3,
  recordCount: 1,
  licenseIds: ['MIT'],
  files: [releaseFile(releaseId)],
});

const releaseManifest = (releaseId: string): ReleaseManifest => ({
  releaseId, schemaVersion: '1', minimumAppVersion: '0.1.0', createdAt: '2026-10-27T00:00:00Z',
  channel: 'preview', complianceProfile: 'internal-research', packages: [releasePackage(releaseId)],
});

async function install(store: PackageStore, releaseId: string, packageId = 'core-zh') {
  const pkg = releasePackage(releaseId, packageId);
  await store.beginPackage(releaseId, pkg);
  await store.writeStagedFile(releaseId, packageId, pkg.files[0], new Uint8Array([1, 2, 3]));
  await store.completePackage(releaseId, packageId);
}

type StoreFixture = { store: PackageStore; cleanup?: () => Promise<void> };

const contractFactories: Array<[string, () => Promise<StoreFixture>]> = [
  ['memory', async () => ({ store: new MemoryPackageStore() })],
  ['browser', async () => {
    const factory = new FakeIndexedDbFactory();
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });
    const store = await IndexedDbPackageStore.open({ databaseName: 'contract', indexedDb: factory.asFactory(), files });
    return { store, cleanup: () => store.cleanupAbandonedStaging() };
  }],
];

describe.each(contractFactories)('PackageStore contract: %s', (_name, createFixture) => {
  it('keeps staged files unreadable and exposes complete package metadata', async () => {
    const { store } = await createFixture();
    const pkg = releasePackage('release-a');
    await store.beginPackage('release-a', pkg);
    await store.writeStagedFile('release-a', pkg.id, pkg.files[0], new Uint8Array([1, 2, 3]));

    expect(await store.readPackageFile('release-a', pkg.id, pkg.files[0].uri)).toBeUndefined();
    expect(await store.listStaging()).toEqual([expect.objectContaining({ releaseId: 'release-a', packageId: pkg.id, state: 'staging' })]);

    await store.completePackage('release-a', pkg.id);
    expect(Array.from((await store.readPackageFile('release-a', pkg.id, pkg.files[0].uri)) ?? [])).toEqual([1, 2, 3]);
    expect(await store.listInstalled()).toEqual([expect.objectContaining({ releaseId: 'release-a', packageId: pkg.id, state: 'complete', bytes: 3 })]);
  });

  it('preserves atomic activation, rollback, and active-package deletion protection', async () => {
    const { store } = await createFixture();
    await install(store, 'release-a');
    await store.activateRelease('release-a', ['core-zh']);
    await install(store, 'release-b');
    await store.activateRelease('release-b', ['core-zh']);

    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-b', previousReleaseId: 'release-a' });
    await expect(store.deletePackage('release-b', 'core-zh')).rejects.toThrow(/active/i);
    await store.rollbackActivation();
    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-a', previousReleaseId: 'release-b' });
  });

  it('aborts incomplete packages without deleting completed packages', async () => {
    const { store } = await createFixture();
    await install(store, 'release-a');
    const staging = releasePackage('release-b');
    await store.beginPackage('release-b', staging);
    await store.writeStagedFile('release-b', staging.id, staging.files[0], new Uint8Array([4, 5, 6]));
    await store.abortPackage('release-b', staging.id);

    expect(await store.listStaging()).toEqual([]);
    expect(await store.isPackageComplete('release-a', 'core-zh')).toBe(true);
  });

  it('persists validated release manifests and reuses a verified file by hash', async () => {
    const { store } = await createFixture();
    const manifest = releaseManifest('release-a');
    await store.saveReleaseManifest(manifest);
    await install(store, 'release-a');

    expect(await store.readReleaseManifest('release-a')).toEqual(manifest);
    expect(Array.from((await store.findReusableFile(releaseFile('release-b'))) ?? [])).toEqual([1, 2, 3]);
  });
});

describe('IndexedDbPackageStore persistence', () => {
  it('serializes metadata updates made by two open adapters', async () => {
    const factory = new FakeIndexedDbFactory();
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });
    const first = await IndexedDbPackageStore.open({ databaseName: 'concurrent', indexedDb: factory.asFactory(), files });
    const second = await IndexedDbPackageStore.open({ databaseName: 'concurrent', indexedDb: factory.asFactory(), files });

    await Promise.all([
      first.beginPackage('release-a', releasePackage('release-a', 'core-zh')),
      second.beginPackage('release-a', releasePackage('release-a', 'media')),
    ]);

    expect((await first.listStaging()).map((item) => item.packageId)).toEqual(['core-zh', 'media']);
  });

  it('preserves activation state when the adapter is reopened', async () => {
    const factory = new FakeIndexedDbFactory();
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });
    const first = await IndexedDbPackageStore.open({ databaseName: 'reopen', indexedDb: factory.asFactory(), files });
    await install(first, 'release-a');
    await first.activateRelease('release-a', ['core-zh']);
    first.close();

    const reopened = await IndexedDbPackageStore.open({ databaseName: 'reopen', indexedDb: factory.asFactory(), files });

    expect(await reopened.activationState()).toEqual({ activeReleaseId: 'release-a', previousReleaseId: undefined });
    expect(await reopened.isPackageComplete('release-a', 'core-zh')).toBe(true);
  });

  it('cleans abandoned staging without touching files required by the active release', async () => {
    const factory = new FakeIndexedDbFactory();
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });
    const store = await IndexedDbPackageStore.open({ databaseName: 'cleanup', indexedDb: factory.asFactory(), files });
    await install(store, 'release-a');
    await store.activateRelease('release-a', ['core-zh']);
    const staging = releasePackage('release-b');
    await store.beginPackage('release-b', staging);
    await store.writeStagedFile('release-b', staging.id, staging.files[0], new Uint8Array([4, 5, 6]));

    await store.cleanupAbandonedStaging();

    expect(await store.listStaging()).toEqual([]);
    expect(Array.from((await store.readPackageFile('release-a', 'core-zh', releaseFile('release-a').uri)) ?? [])).toEqual([1, 2, 3]);
    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-a', previousReleaseId: undefined });
  });

  it('fails closed when the existing database version is newer than supported', async () => {
    const factory = new FakeIndexedDbFactory();
    await new Promise<void>((resolve, reject) => {
      const request = factory.open('future', 2);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });

    await expect(IndexedDbPackageStore.open({ databaseName: 'future', indexedDb: factory.asFactory(), files }))
      .rejects.toThrow(/version|unsupported/i);
  });

  it('removes complete metadata before attempting best-effort cache cleanup', async () => {
    const factory = new FakeIndexedDbFactory();
    class FailingCleanupFiles extends CachePackageFiles {
      failCleanup = false;
      override async deletePackage(releaseId: string, packageId: string) {
        await super.deletePackage(releaseId, packageId);
        if (this.failCleanup) throw new Error('cache cleanup interrupted');
      }
    }
    const files = new FailingCleanupFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });
    const store = await IndexedDbPackageStore.open({ databaseName: 'delete-order', indexedDb: factory.asFactory(), files });
    await install(store, 'release-a');
    files.failCleanup = true;

    await expect(store.deletePackage('release-a', 'core-zh')).rejects.toThrow(/interrupted/i);

    expect(await store.isPackageComplete('release-a', 'core-zh')).toBe(false);
  });

  it('never deletes a package concurrently becoming an active requirement', async () => {
    const factory = new FakeIndexedDbFactory();
    const files = new CachePackageFiles({ cacheStorage: new MemoryCacheStorage().asCacheStorage() });
    const first = await IndexedDbPackageStore.open({ databaseName: 'activate-delete', indexedDb: factory.asFactory(), files });
    const second = await IndexedDbPackageStore.open({ databaseName: 'activate-delete', indexedDb: factory.asFactory(), files });
    await install(first, 'release-a');

    await Promise.allSettled([
      first.activateRelease('release-a', ['core-zh']),
      second.deletePackage('release-a', 'core-zh'),
    ]);

    const activation = await first.activationState();
    if (activation.activeReleaseId === 'release-a') {
      expect(await first.isPackageComplete('release-a', 'core-zh')).toBe(true);
      expect(await first.readPackageFile('release-a', 'core-zh', releaseFile('release-a').uri)).toBeDefined();
    }
  });
});
