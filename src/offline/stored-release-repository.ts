import { validateReleaseManifest } from '../content/release-validation';
import { RemoteHistoricalSnapshot, type HistoricalSnapshot } from '../content/snapshot';
import type { ReleaseSnapshotRepository } from '../content/repository';
import type { PackageStore } from './package-store';

export class StoredReleaseRepository implements ReleaseSnapshotRepository {
  constructor(private readonly store: PackageStore) {}

  async open(releaseId?: string): Promise<HistoricalSnapshot> {
    const selectedReleaseId = releaseId ?? (await this.store.activationState()).activeReleaseId;
    if (!selectedReleaseId) throw new Error('No offline historical release is active');
    const storedManifest = await this.store.readReleaseManifest(selectedReleaseId);
    if (!storedManifest) throw new Error(`Offline release manifest is unavailable: ${selectedReleaseId}`);
    const manifest = validateReleaseManifest(storedManifest);
    if (manifest.releaseId !== selectedReleaseId) throw new Error('Offline release manifest identity mismatch');
    const required = requiredPackageIds(manifest);
    for (const packageId of required) {
      if (!await this.store.isPackageComplete(selectedReleaseId, packageId)) {
        throw new Error(`Offline release is incomplete: ${packageId}`);
      }
    }
    return new RemoteHistoricalSnapshot(
      manifest,
      async (input) => this.readFile(manifest.releaseId, manifest, String(input)),
      (uri) => uri,
    );
  }

  private async readFile(releaseId: string, manifest: ReturnType<typeof validateReleaseManifest>, uri: string) {
    const owner = manifest.packages.find((releasePackage) => releasePackage.files.some((file) => file.uri === uri));
    if (!owner) return new Response('', { status: 404 });
    const bytes = await this.store.readPackageFile(releaseId, owner.id, uri);
    if (!bytes) return new Response('', { status: 404 });
    const file = owner.files.find((candidate) => candidate.uri === uri)!;
    return new Response(bytes.slice(), { headers: { 'content-type': file.mediaType } });
  }
}

export class BrowserReleaseRepository implements ReleaseSnapshotRepository {
  private readonly installed: StoredReleaseRepository;

  constructor(private readonly options: {
    store: PackageStore;
    remote: ReleaseSnapshotRepository;
    fallback: HistoricalSnapshot;
    initialRemoteSnapshot?: HistoricalSnapshot;
  }) {
    this.installed = new StoredReleaseRepository(options.store);
  }

  async open(releaseId?: string): Promise<HistoricalSnapshot> {
    if (releaseId) {
      const stored = await this.options.store.readReleaseManifest(releaseId);
      return stored ? this.installed.open(releaseId) : this.options.remote.open(releaseId);
    }
    const active = (await this.options.store.activationState()).activeReleaseId;
    if (active) return this.installed.open(active);
    if (this.options.initialRemoteSnapshot) return this.options.initialRemoteSnapshot;
    try {
      return await this.options.remote.open();
    } catch {
      return this.options.fallback;
    }
  }
}

function requiredPackageIds(manifest: ReturnType<typeof validateReleaseManifest>) {
  const required = new Set<string>();
  const visit = (packageId: string) => {
    if (required.has(packageId)) return;
    required.add(packageId);
    const releasePackage = manifest.packages.find((candidate) => candidate.id === packageId);
    if (!releasePackage) throw new Error(`Offline release dependency is unavailable: ${packageId}`);
    for (const dependency of releasePackage.dependencies) visit(dependency);
  };
  for (const releasePackage of manifest.packages) if (releasePackage.required) visit(releasePackage.id);
  return required;
}
