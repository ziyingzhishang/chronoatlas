import type { ReleaseManifest, ReleasePackage } from '../content/release-types';
import { validateReleaseManifest } from '../content/release-validation';
import { publicAssetUrl } from '../runtime/asset-url';
import { verifySha256 } from './hash';
import type { InstalledPackage, PackageStore } from './package-store';

type PackageFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface OfflinePackageManagerOptions {
  manifest: ReleaseManifest;
  store: PackageStore;
  fetcher?: PackageFetch;
  resolveAsset?: (uri: string) => string;
}

export interface AvailablePackage {
  releasePackage: ReleasePackage;
  installed: boolean;
}

export class OfflinePackageManager {
  private readonly manifest: ReleaseManifest;
  private readonly store: PackageStore;
  private readonly fetcher: PackageFetch;
  private readonly resolveAsset: (uri: string) => string;

  constructor(options: OfflinePackageManagerOptions) {
    this.manifest = validateReleaseManifest(options.manifest);
    this.store = options.store;
    this.fetcher = options.fetcher ?? fetch;
    this.resolveAsset = options.resolveAsset ?? ((uri) => publicAssetUrl(uri));
  }

  async listAvailable(): Promise<readonly AvailablePackage[]> {
    const installed = new Set((await this.store.listInstalled())
      .filter((item) => item.releaseId === this.manifest.releaseId)
      .map((item) => item.packageId));
    return this.manifest.packages.map((releasePackage) => ({ releasePackage, installed: installed.has(releasePackage.id) }));
  }

  listInstalled(): Promise<readonly InstalledPackage[]> {
    return this.store.listInstalled();
  }

  async install(packageId: string): Promise<void> {
    await this.store.saveReleaseManifest(this.manifest);
    await this.installWithDependencies(packageId, new Set());
  }

  async activate(): Promise<void> {
    const persistedManifest = await this.store.readReleaseManifest(this.manifest.releaseId);
    if (!persistedManifest) throw new Error(`Release manifest is not installed: ${this.manifest.releaseId}`);
    const required = this.activePackageIds();
    for (const packageId of required) {
      if (!await this.store.isPackageComplete(this.manifest.releaseId, packageId)) {
        throw new Error(`Required package or dependency is not installed: ${packageId}`);
      }
    }
    await this.store.activateRelease(this.manifest.releaseId, required);
  }

  rollback(): Promise<void> {
    return this.store.rollbackActivation();
  }

  async remove(packageId: string): Promise<void> {
    const releasePackage = this.packageById(packageId);
    const activation = await this.store.activationState();
    if (activation.activeReleaseId === this.manifest.releaseId) {
      if (releasePackage.required || this.activePackageIds().includes(packageId)) {
        throw new Error(`Cannot remove active package or dependency: ${packageId}`);
      }
    }
    await this.store.deletePackage(this.manifest.releaseId, packageId);
  }

  private async installWithDependencies(packageId: string, visiting: Set<string>): Promise<void> {
    if (await this.store.isPackageComplete(this.manifest.releaseId, packageId)) return;
    if (visiting.has(packageId)) throw new Error(`Package dependency cycle at ${packageId}`);
    const releasePackage = this.packageById(packageId);
    visiting.add(packageId);
    try {
      for (const dependencyId of releasePackage.dependencies) {
        await this.installWithDependencies(dependencyId, visiting);
      }
    } finally {
      visiting.delete(packageId);
    }

    const available = await this.store.availableBytes();
    const storedBytes = releasePackage.files.reduce((sum, file) => sum + file.bytes, 0);
    if (available !== undefined && storedBytes > available) {
      throw new Error(`Insufficient storage space for package ${packageId}`);
    }

    await this.store.beginPackage(this.manifest.releaseId, releasePackage);
    try {
      for (const file of releasePackage.files) {
        if (isMutableLatestUri(file.uri)) {
          throw new Error('Mutable latest.json cannot be installed as an immutable package file');
        }
        publicAssetUrl(file.uri, '/');
        let bytes = await this.store.findReusableFile(file);
        if (bytes) {
          try {
            await verifySha256(bytes, file.sha256);
          } catch {
            bytes = undefined;
          }
        }
        if (!bytes) {
          const response = await this.fetcher(this.resolveAsset(file.uri));
          if (!response.ok) throw new Error(`Unable to download ${file.uri}: ${response.status}`);
          bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes.byteLength !== file.bytes) {
            throw new Error(`Byte size mismatch for ${file.uri}: expected ${file.bytes}, got ${bytes.byteLength}`);
          }
          await verifySha256(bytes, file.sha256);
        }
        await this.store.writeStagedFile(this.manifest.releaseId, packageId, file, bytes);
      }
      await this.store.completePackage(this.manifest.releaseId, packageId);
    } catch (error) {
      await this.store.abortPackage(this.manifest.releaseId, packageId);
      throw error;
    }
  }

  private packageById(packageId: string) {
    const releasePackage = this.manifest.packages.find((item) => item.id === packageId);
    if (!releasePackage) throw new Error(`Unknown release package: ${packageId}`);
    return releasePackage;
  }

  private activePackageIds() {
    const active = new Set<string>();
    const visit = (packageId: string) => {
      if (active.has(packageId)) return;
      active.add(packageId);
      for (const dependencyId of this.packageById(packageId).dependencies) visit(dependencyId);
    };
    for (const releasePackage of this.manifest.packages) {
      if (releasePackage.required) visit(releasePackage.id);
    }
    return [...active];
  }
}

function isMutableLatestUri(uri: string) {
  let decoded = uri;
  while (true) {
    const next = decodeURIComponent(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  return decoded.split('/').some((segment) => segment.toLowerCase() === 'latest.json');
}
