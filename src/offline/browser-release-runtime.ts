import type { HistoricalSnapshot } from '../content/snapshot';
import type { ReleaseSnapshotRepository } from '../content/repository';
import type { ReleaseManifest } from '../content/release-types';
import { OfflinePackageManager } from './offline-package-manager';
import type { PackageStore } from './package-store';
import { BrowserReleaseRepository } from './stored-release-repository';

export async function createReleaseRuntime(options: {
  store: PackageStore;
  remote: ReleaseSnapshotRepository;
  fallback: HistoricalSnapshot;
}) {
  const discovered = await discoverAvailableRelease(options);
  const repository = new BrowserReleaseRepository({
    ...options,
    initialRemoteSnapshot: discovered.snapshot ?? options.fallback,
  });
  const availableManifest = discovered.manifest;
  return {
    repository,
    availableManifest,
    manager: new OfflinePackageManager({ manifest: availableManifest, store: options.store }),
  };
}

async function discoverAvailableRelease(options: {
  store: PackageStore;
  remote: ReleaseSnapshotRepository;
  fallback: HistoricalSnapshot;
}): Promise<{ manifest: ReleaseManifest; snapshot?: HistoricalSnapshot }> {
  try {
    const snapshot = await options.remote.open();
    return { manifest: snapshot.release, snapshot };
  } catch {
    const active = (await options.store.activationState()).activeReleaseId;
    if (active) {
      const stored = await options.store.readReleaseManifest(active);
      if (stored) return { manifest: stored };
    }
    return { manifest: options.fallback.release };
  }
}
