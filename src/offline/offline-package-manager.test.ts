import { describe, expect, it, vi } from 'vitest';
import type { ReleaseFile, ReleaseManifest, ReleasePackage } from '../content/release-types';
import { sha256Hex } from './hash';
import { MemoryPackageStore } from './memory-package-store';
import { OfflinePackageManager } from './offline-package-manager';

const textBytes = (value: string) => new TextEncoder().encode(value);

async function releaseFile(uri: string, body: string): Promise<ReleaseFile> {
  const bytes = textBytes(body);
  return {
    uri,
    mediaType: 'application/json',
    sha256: await sha256Hex(bytes),
    bytes: bytes.byteLength,
    collection: uri.split('/').at(-1)?.replace('.json', '') ?? 'fixture',
    sourceDigest: await sha256Hex(bytes),
  };
}

async function fixtureManifest(options: { twoCoreFiles?: boolean; coreRequired?: boolean } = {}): Promise<{
  manifest: ReleaseManifest;
  bodies: Record<string, string>;
}> {
  const bodies: Record<string, string> = {
    'releases/release-new/core-a.json': '{"core":"a"}\n',
    'releases/release-new/core-b.json': '{"core":"b"}\n',
    'releases/release-new/territory.json': '{"territory":true}\n',
  };
  const coreFiles = [await releaseFile('releases/release-new/core-a.json', bodies['releases/release-new/core-a.json'])];
  if (options.twoCoreFiles) coreFiles.push(await releaseFile('releases/release-new/core-b.json', bodies['releases/release-new/core-b.json']));
  const territoryFiles = [await releaseFile('releases/release-new/territory.json', bodies['releases/release-new/territory.json'])];
  const packageFor = (id: string, dependencies: string[], files: ReleaseFile[]): ReleasePackage => ({
    id,
    kind: id === 'core-zh' ? 'content' : 'territory',
    required: id === 'core-zh' ? (options.coreRequired ?? true) : true,
    dependencies,
    compressedBytes: files.reduce((sum, file) => sum + file.bytes, 0),
    recordCount: 1,
    licenseIds: ['MIT'],
    files,
  });
  return {
    bodies,
    manifest: {
      releaseId: 'release-new',
      schemaVersion: '1',
      minimumAppVersion: '0.1.0',
      createdAt: '2026-10-27T00:00:00Z',
      channel: 'preview',
      complianceProfile: 'internal-research',
      packages: [
        packageFor('core-zh', [], coreFiles),
        packageFor('china-territory', ['core-zh'], territoryFiles),
      ],
    },
  };
}

function responseFetcher(bodies: Record<string, string>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const body = bodies[String(input)];
    return body === undefined ? new Response('', { status: 404 }) : new Response(body);
  });
}

async function seedOldRelease(store: MemoryPackageStore) {
  const oldFile: ReleaseFile = {
    uri: 'releases/release-old/core.json', mediaType: 'application/json', sha256: '0'.repeat(64),
    bytes: 1, collection: 'core-zh', sourceDigest: '0'.repeat(64),
  };
  const oldPackage: ReleasePackage = {
    id: 'core-zh', kind: 'content', required: true, dependencies: [], compressedBytes: 1,
    recordCount: 1, licenseIds: ['MIT'], files: [oldFile],
  };
  await store.beginPackage('release-old', oldPackage);
  await store.writeStagedFile('release-old', 'core-zh', oldFile, new Uint8Array([1]));
  await store.completePackage('release-old', 'core-zh');
  await store.activateRelease('release-old', ['core-zh']);
}

describe('OfflinePackageManager', () => {
  it('installs a package only after every file passes size and hash verification', async () => {
    const { manifest, bodies } = await fixtureManifest();
    const store = new MemoryPackageStore();
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });

    await manager.install('core-zh');

    expect(await manager.listInstalled()).toEqual([expect.objectContaining({ releaseId: 'release-new', packageId: 'core-zh', state: 'complete' })]);
    expect(Array.from((await store.readPackageFile('release-new', 'core-zh', manifest.packages[0].files[0].uri)) ?? []))
      .toEqual(Array.from(textBytes(bodies['releases/release-new/core-a.json'])));
  });

  it('discards staging files after a SHA-256 mismatch', async () => {
    const { manifest, bodies } = await fixtureManifest();
    bodies['releases/release-new/core-a.json'] = '{"core":"x"}\n';
    const store = new MemoryPackageStore();
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/sha-?256/i);
    expect(await manager.listInstalled()).toEqual([]);
    expect(await store.listStaging()).toEqual([]);
  });

  it('discards all staged files when a later download is interrupted', async () => {
    const { manifest, bodies } = await fixtureManifest({ twoCoreFiles: true });
    const store = new MemoryPackageStore();
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('core-b.json')) throw new Error('network interrupted');
      return new Response(bodies[String(input)]);
    });
    const manager = new OfflinePackageManager({ manifest, store, fetcher, resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/interrupted/i);
    expect(await manager.listInstalled()).toEqual([]);
    expect(await store.listStaging()).toEqual([]);
  });

  it('does not install a dependent package when its dependency fails', async () => {
    const { manifest, bodies } = await fixtureManifest();
    bodies['releases/release-new/core-a.json'] = '{"core":"x"}\n';
    const fetcher = responseFetcher(bodies);
    const store = new MemoryPackageStore();
    const manager = new OfflinePackageManager({ manifest, store, fetcher, resolveAsset: (uri) => uri });

    await expect(manager.install('china-territory')).rejects.toThrow(/sha-?256/i);
    expect(await manager.listInstalled()).toEqual([]);
    expect(fetcher).not.toHaveBeenCalledWith('releases/release-new/territory.json');
  });

  it('fails before downloading when storage space is insufficient', async () => {
    const { manifest, bodies } = await fixtureManifest();
    const fetcher = responseFetcher(bodies);
    const store = new MemoryPackageStore({ capacityBytes: 2 });
    const manager = new OfflinePackageManager({ manifest, store, fetcher, resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/space|storage/i);
    expect(fetcher).not.toHaveBeenCalled();
    expect(await store.listStaging()).toEqual([]);
  });

  it('preflights the actual stored file bytes rather than the compressed transfer estimate', async () => {
    const { manifest, bodies } = await fixtureManifest();
    manifest.packages[0].compressedBytes = 1;
    const fetcher = responseFetcher(bodies);
    const store = new MemoryPackageStore({ capacityBytes: 2 });
    const manager = new OfflinePackageManager({ manifest, store, fetcher, resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/space|storage/i);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps the old release active until all required packages can be atomically activated', async () => {
    const { manifest, bodies } = await fixtureManifest();
    const store = new MemoryPackageStore();
    await seedOldRelease(store);
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });

    await expect(manager.activate()).rejects.toThrow(/required|installed/i);
    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-old', previousReleaseId: undefined });

    await manager.install('china-territory');
    await manager.activate();
    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-new', previousReleaseId: 'release-old' });
  });

  it('keeps the old release active when a new package fails verification', async () => {
    const { manifest, bodies } = await fixtureManifest();
    bodies['releases/release-new/core-a.json'] = '{"core":"x"}\n';
    const store = new MemoryPackageStore();
    await seedOldRelease(store);
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/sha-?256/i);

    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-old', previousReleaseId: undefined });
  });

  it('rejects mutable latest metadata instead of caching it as a package file', async () => {
    const { manifest, bodies } = await fixtureManifest();
    const mutableUri = 'releases/latest.json';
    manifest.packages[0].files[0] = await releaseFile(mutableUri, '{"releaseId":"release-new"}');
    bodies[mutableUri] = '{"releaseId":"release-new"}';
    const store = new MemoryPackageStore();
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/latest\.json|mutable/i);
    expect(await store.listStaging()).toEqual([]);
  });

  it('rejects an encoded mutable latest metadata path', async () => {
    const { manifest, bodies } = await fixtureManifest();
    const mutableUri = 'releases/latest%2ejson';
    manifest.packages[0].files[0] = await releaseFile(mutableUri, '{"releaseId":"release-new"}');
    bodies[mutableUri] = '{"releaseId":"release-new"}';
    const fetcher = responseFetcher(bodies);
    const store = new MemoryPackageStore();
    const manager = new OfflinePackageManager({ manifest, store, fetcher, resolveAsset: (uri) => uri });

    await expect(manager.install('core-zh')).rejects.toThrow(/latest\.json|mutable/i);
    expect(fetcher).not.toHaveBeenCalled();
    expect(await store.listStaging()).toEqual([]);
  });

  it('rolls back to the previous complete release', async () => {
    const { manifest, bodies } = await fixtureManifest();
    const store = new MemoryPackageStore();
    await seedOldRelease(store);
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });
    await manager.install('china-territory');
    await manager.activate();

    await manager.rollback();

    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-old', previousReleaseId: 'release-new' });
  });

  it('refuses to remove a package required by the active release', async () => {
    const { manifest, bodies } = await fixtureManifest({ coreRequired: false });
    const store = new MemoryPackageStore();
    const manager = new OfflinePackageManager({ manifest, store, fetcher: responseFetcher(bodies), resolveAsset: (uri) => uri });
    await manager.install('china-territory');
    await manager.activate();

    await expect(manager.remove('core-zh')).rejects.toThrow(/active|dependency/i);
    expect((await manager.listInstalled()).map((item) => item.packageId)).toContain('core-zh');
  });
});
