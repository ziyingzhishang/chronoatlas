import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReleaseFile, ReleaseManifest, ReleasePackage } from '../content/release-types';
import { ContentProvider, useHistoricalContent } from '../content/ContentContext';
import { bundledContentCatalog, bundledReleaseManifest } from '../content/bundled-content';
import { InMemoryHistoricalSnapshot } from '../content/snapshot';
import { LocaleProvider } from '../i18n/locale';
import { sha256Hex } from '../offline/hash';
import { MemoryPackageStore } from '../offline/memory-package-store';
import { OfflinePackageManager } from '../offline/offline-package-manager';
import { BrowserReleaseRepository, StoredReleaseRepository } from '../offline/stored-release-repository';
import { announceOfflineReleaseChange } from '../offline/release-events';
import { createReleaseRuntime } from '../offline/browser-release-runtime';

const encode = (value: string) => new TextEncoder().encode(value);

async function file(releaseId: string, name: string, body: string): Promise<ReleaseFile> {
  const bytes = encode(body);
  return {
    uri: `releases/${releaseId}/${name}.json`,
    mediaType: 'application/json',
    sha256: await sha256Hex(bytes),
    bytes: bytes.byteLength,
    collection: name,
    sourceDigest: await sha256Hex(bytes),
  };
}

async function release(releaseId: string, marker: string, territoryMarker = marker) {
  const coreBody = JSON.stringify({
    polities: [{ id: `polity-${marker}`, name: `政权${marker}`, startYear: 800, endYear: 800 }],
    events: [{ id: `event-${marker}`, title: `事件${marker}`, year: 800 }],
    people: [{ id: `person-${marker}`, name: `人物${marker}` }],
  });
  const territoryBody = JSON.stringify({
    boundaries: [{ id: `boundary-${territoryMarker}`, polityId: `polity-${territoryMarker}`, validFrom: 800, validTo: 800 }],
    coverageConclusions: [],
  });
  const core = await file(releaseId, 'core-zh', coreBody);
  const territory = await file(releaseId, 'china-territory', territoryBody);
  const packageFor = (id: string, kind: ReleasePackage['kind'], files: ReleaseFile[], dependencies: string[] = []): ReleasePackage => ({
    id, kind, required: true, dependencies, compressedBytes: files.reduce((sum, item) => sum + item.bytes, 0),
    recordCount: 1, licenseIds: ['MIT'], files,
  });
  const manifest: ReleaseManifest = {
    releaseId, schemaVersion: '1', minimumAppVersion: '0.1.0', createdAt: '2026-10-27T00:00:00Z',
    channel: 'preview', complianceProfile: 'internal-research', packages: [
      packageFor('core-zh', 'content', [core]),
      packageFor('china-territory', 'territory', [territory], ['core-zh']),
    ],
  };
  return { manifest, bodies: { [core.uri]: coreBody, [territory.uri]: territoryBody } };
}

function fetcher(bodies: Record<string, string>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const body = bodies[String(input)];
    return body === undefined ? new Response('', { status: 404 }) : new Response(body);
  });
}

async function installAndActivate(store: MemoryPackageStore, fixture: Awaited<ReturnType<typeof release>>) {
  const download = fetcher(fixture.bodies);
  const manager = new OfflinePackageManager({ manifest: fixture.manifest, store, fetcher: download, resolveAsset: (uri) => uri });
  await manager.install('china-territory');
  await manager.activate();
  return { manager, download };
}

describe('versioned offline release runtime', () => {
  it('downloads only changed hashes and switches every reader query to the activated release', async () => {
    const store = new MemoryPackageStore();
    const a = await release('release-a', 'A', 'shared');
    const b = await release('release-b', 'B', 'shared');
    await installAndActivate(store, a);

    const { download } = await installAndActivate(store, b);

    expect(download).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledWith('releases/release-b/core-zh.json');
    const snapshot = await new StoredReleaseRepository(store).open();
    expect(snapshot.release.releaseId).toBe('release-b');
    expect((await snapshot.queryPolitiesAt(800))[0]?.name).toBe('政权B');
    expect((await snapshot.queryBoundariesAt(800))[0]?.id).toBe('boundary-shared');
    expect((await snapshot.queryEvents({ from: 800, to: 800 }))[0]?.title).toBe('事件B');
    expect((await snapshot.search('人物B'))[0]?.id).toBe('person-B');
    expect((await snapshot.getEntity('person-B'))?.name).toBe('人物B');
  });

  it('reopens the active release without network access and keeps it active after a corrupt update', async () => {
    const store = new MemoryPackageStore();
    const b = await release('release-b', 'B');
    await installAndActivate(store, b);

    const restarted = new StoredReleaseRepository(store);
    expect((await restarted.open()).release.releaseId).toBe('release-b');

    const c = await release('release-c', 'C');
    c.bodies['releases/release-c/core-zh.json'] = '{"tampered":true}';
    const manager = new OfflinePackageManager({
      manifest: c.manifest, store, fetcher: fetcher(c.bodies), resolveAsset: (uri) => uri,
    });
    await expect(manager.install('china-territory')).rejects.toThrow(/sha-?256|byte size/i);
    expect(await store.activationState()).toEqual({ activeReleaseId: 'release-b', previousReleaseId: undefined });
    expect((await new StoredReleaseRepository(store).open()).release.releaseId).toBe('release-b');
  });

  it('opens the previous complete snapshot after rollback', async () => {
    const store = new MemoryPackageStore();
    const a = await release('release-a', 'A');
    const b = await release('release-b', 'B');
    await installAndActivate(store, a);
    const { manager } = await installAndActivate(store, b);

    await manager.rollback();

    const snapshot = await new StoredReleaseRepository(store).open();
    expect(snapshot.release.releaseId).toBe('release-a');
    expect((await snapshot.queryEvents())[0]?.title).toBe('事件A');
  });

  it('reloads the one shared content context after activation so readers never mix releases', async () => {
    let active = 'release-a';
    const repository = {
      open: async () => new InMemoryHistoricalSnapshot(
        { ...bundledReleaseManifest, releaseId: active },
        {
          ...bundledContentCatalog,
          people: [{ ...bundledContentCatalog.people[0], name: active === 'release-a' ? '人物A' : '人物B' }],
        },
        { boundaries: [], coverageConclusions: [] },
      ),
    };
    function Probe() {
      const { release: current, catalog } = useHistoricalContent();
      return <p>{current.releaseId}:{catalog.people[0]?.name}</p>;
    }
    render(<LocaleProvider><ContentProvider repository={repository}><Probe/></ContentProvider></LocaleProvider>);
    expect(await screen.findByText('release-a:人物A')).toBeInTheDocument();

    active = 'release-b';
    announceOfflineReleaseChange();

    expect(await screen.findByText('release-b:人物B')).toBeInTheDocument();
    expect(screen.queryByText(/release-a:/)).not.toBeInTheDocument();
  });

  it('prefers the activated offline snapshot and falls back to the remote release only before activation', async () => {
    const store = new MemoryPackageStore();
    const a = await release('release-a', 'A');
    await installAndActivate(store, a);
    const remote = { open: vi.fn(async () => new InMemoryHistoricalSnapshot(
      { ...bundledReleaseManifest, releaseId: 'release-remote' }, bundledContentCatalog,
    )) };
    const repository = new BrowserReleaseRepository({ store, remote, fallback: new InMemoryHistoricalSnapshot(
      bundledReleaseManifest, bundledContentCatalog,
    ) });

    expect((await repository.open()).release.releaseId).toBe('release-a');
    expect(remote.open).not.toHaveBeenCalled();

    const emptyStore = new MemoryPackageStore();
    const online = new BrowserReleaseRepository({ store: emptyStore, remote, fallback: new InMemoryHistoricalSnapshot(
      bundledReleaseManifest, bundledContentCatalog,
    ) });
    expect((await online.open()).release.releaseId).toBe('release-remote');
  });

  it('keeps bundled reading available when neither installed nor remote releases can open', async () => {
    const repository = new BrowserReleaseRepository({
      store: new MemoryPackageStore(),
      remote: { open: async () => { throw new Error('offline'); } },
      fallback: new InMemoryHistoricalSnapshot(bundledReleaseManifest, bundledContentCatalog),
    });

    expect((await repository.open()).release.releaseId).toBe(bundledReleaseManifest.releaseId);
  });

  it('offers the newest remote manifest for update while keeping the active snapshot until activation', async () => {
    const store = new MemoryPackageStore();
    const a = await release('release-a', 'A');
    const b = await release('release-b', 'B');
    await installAndActivate(store, a);
    const remoteSnapshot = new InMemoryHistoricalSnapshot(b.manifest, {}, {});
    const openRemote = vi.fn(async () => remoteSnapshot);

    const runtime = await createReleaseRuntime({
      store,
      remote: { open: openRemote },
      fallback: new InMemoryHistoricalSnapshot(bundledReleaseManifest, bundledContentCatalog),
    });

    expect(runtime.availableManifest.releaseId).toBe('release-b');
    expect((await runtime.repository.open()).release.releaseId).toBe('release-a');
    expect(openRemote).toHaveBeenCalledTimes(1);
  });

  it('pins the first remote snapshot so latest cannot change between update discovery and first render', async () => {
    const b = await release('release-b', 'B');
    const c = await release('release-c', 'C');
    const openRemote = vi.fn()
      .mockResolvedValueOnce(new InMemoryHistoricalSnapshot(b.manifest, {}, {}))
      .mockResolvedValueOnce(new InMemoryHistoricalSnapshot(c.manifest, {}, {}));
    const runtime = await createReleaseRuntime({
      store: new MemoryPackageStore(), remote: { open: openRemote },
      fallback: new InMemoryHistoricalSnapshot(bundledReleaseManifest, bundledContentCatalog),
    });

    expect(runtime.availableManifest.releaseId).toBe('release-b');
    expect((await runtime.repository.open()).release.releaseId).toBe('release-b');
    expect(openRemote).toHaveBeenCalledTimes(1);
  });

  it('uses the persisted active manifest for offline package management after restart', async () => {
    const store = new MemoryPackageStore();
    const b = await release('release-b', 'B');
    await installAndActivate(store, b);

    const runtime = await createReleaseRuntime({
      store,
      remote: { open: async () => { throw new Error('offline'); } },
      fallback: new InMemoryHistoricalSnapshot(bundledReleaseManifest, bundledContentCatalog),
    });

    expect(runtime.availableManifest.releaseId).toBe('release-b');
    expect((await runtime.repository.open()).release.releaseId).toBe('release-b');
  });
});
