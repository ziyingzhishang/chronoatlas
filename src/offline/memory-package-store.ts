import type { ReleaseFile, ReleaseManifest, ReleasePackage } from '../content/release-types';
import { validateReleaseManifest } from '../content/release-validation';
import type { ActivationState, InstalledPackage, PackageStore } from './package-store';

interface StoredPackage {
  metadata: InstalledPackage;
  files: Map<string, Uint8Array>;
  fileDigests: Map<string, string>;
  expectedFileUris: readonly string[];
}

export class MemoryPackageStore implements PackageStore {
  private readonly packages = new Map<string, StoredPackage>();
  private readonly activatedRequirements = new Map<string, readonly string[]>();
  private readonly manifests = new Map<string, ReleaseManifest>();
  private activation: ActivationState = {};
  private readonly capacityBytes?: number;

  constructor(options: { capacityBytes?: number } = {}) {
    this.capacityBytes = options.capacityBytes;
  }

  async saveReleaseManifest(manifest: ReleaseManifest) {
    const validated = validateReleaseManifest(structuredClone(manifest));
    const existing = this.manifests.get(validated.releaseId);
    if (existing && JSON.stringify(existing) !== JSON.stringify(validated)) {
      throw new Error(`Cannot replace immutable manifest for release ${validated.releaseId}`);
    }
    this.manifests.set(validated.releaseId, structuredClone(validated));
  }

  async readReleaseManifest(releaseId: string) {
    const manifest = this.manifests.get(releaseId);
    return manifest ? structuredClone(manifest) : undefined;
  }

  async findReusableFile(file: ReleaseFile) {
    for (const stored of this.packages.values()) {
      if (stored.metadata.state !== 'complete') continue;
      for (const [uri, digest] of stored.fileDigests) {
        const bytes = stored.files.get(uri);
        if (digest === file.sha256 && bytes?.byteLength === file.bytes) return bytes.slice();
      }
    }
    return undefined;
  }

  async availableBytes() {
    if (this.capacityBytes === undefined) return undefined;
    return Math.max(0, this.capacityBytes - this.usedBytes());
  }

  async beginPackage(releaseId: string, releasePackage: ReleasePackage) {
    const key = packageKey(releaseId, releasePackage.id);
    const existing = this.packages.get(key);
    if (existing?.metadata.state === 'complete') return;
    this.packages.set(key, {
      metadata: {
        releaseId,
        packageId: releasePackage.id,
        state: 'staging',
        bytes: 0,
        fileUris: [],
        dependencies: [...releasePackage.dependencies],
      },
      files: new Map(),
      fileDigests: new Map(),
      expectedFileUris: releasePackage.files.map((file) => file.uri),
    });
  }

  async writeStagedFile(releaseId: string, packageId: string, file: ReleaseFile, bytes: Uint8Array) {
    const stored = this.requirePackage(releaseId, packageId);
    if (stored.metadata.state !== 'staging') throw new Error(`Package ${packageId} is not staging`);
    const previous = stored.files.get(file.uri)?.byteLength ?? 0;
    const available = await this.availableBytes();
    const additional = bytes.byteLength - previous;
    if (available !== undefined && additional > available) throw new Error(`Insufficient storage space for ${file.uri}`);
    stored.files.set(file.uri, bytes.slice());
    stored.fileDigests.set(file.uri, file.sha256);
    stored.metadata = {
      ...stored.metadata,
      bytes: stored.metadata.bytes + additional,
      fileUris: [...stored.files.keys()].sort(),
    };
  }

  async completePackage(releaseId: string, packageId: string) {
    const stored = this.requirePackage(releaseId, packageId);
    if (stored.metadata.state !== 'staging') throw new Error(`Package ${packageId} is not staging`);
    const missing = stored.expectedFileUris.filter((uri) => !stored.files.has(uri));
    if (missing.length) throw new Error(`Package ${packageId} is missing staged files: ${missing.join(', ')}`);
    stored.metadata = { ...stored.metadata, state: 'complete', installedAt: new Date().toISOString() };
  }

  async abortPackage(releaseId: string, packageId: string) {
    const key = packageKey(releaseId, packageId);
    if (this.packages.get(key)?.metadata.state === 'staging') this.packages.delete(key);
  }

  async isPackageComplete(releaseId: string, packageId: string) {
    return this.packages.get(packageKey(releaseId, packageId))?.metadata.state === 'complete';
  }

  async listInstalled() {
    return this.listByState('complete');
  }

  async listStaging() {
    return this.listByState('staging');
  }

  async readPackageFile(releaseId: string, packageId: string, uri: string) {
    const stored = this.packages.get(packageKey(releaseId, packageId));
    if (stored?.metadata.state !== 'complete') return undefined;
    return stored.files.get(uri)?.slice();
  }

  async activateRelease(releaseId: string, requiredPackageIds: readonly string[]) {
    const missing = [];
    for (const packageId of requiredPackageIds) {
      if (!await this.isPackageComplete(releaseId, packageId)) missing.push(packageId);
    }
    if (missing.length) throw new Error(`Required packages are not installed: ${missing.join(', ')}`);
    const next: ActivationState = {
      activeReleaseId: releaseId,
      previousReleaseId: this.activation.activeReleaseId === releaseId
        ? this.activation.previousReleaseId
        : this.activation.activeReleaseId,
    };
    this.activatedRequirements.set(releaseId, [...requiredPackageIds]);
    this.activation = next;
  }

  async activationState() {
    return { ...this.activation };
  }

  async rollbackActivation() {
    const previous = this.activation.previousReleaseId;
    if (!previous) throw new Error('No previous release is available for rollback');
    const requirements = this.activatedRequirements.get(previous) ?? [];
    const missing = [];
    for (const packageId of requirements) {
      if (!await this.isPackageComplete(previous, packageId)) missing.push(packageId);
    }
    if (!requirements.length || missing.length) throw new Error(`Previous release ${previous} is not complete`);
    this.activation = { activeReleaseId: previous, previousReleaseId: this.activation.activeReleaseId };
  }

  async deletePackage(releaseId: string, packageId: string) {
    if (
      this.activation.activeReleaseId === releaseId
      && (this.activatedRequirements.get(releaseId) ?? []).includes(packageId)
    ) {
      throw new Error(`Cannot delete package required by active release: ${packageId}`);
    }
    this.packages.delete(packageKey(releaseId, packageId));
  }

  private requirePackage(releaseId: string, packageId: string) {
    const stored = this.packages.get(packageKey(releaseId, packageId));
    if (!stored) throw new Error(`Unknown package ${releaseId}/${packageId}`);
    return stored;
  }

  private listByState(state: InstalledPackage['state']) {
    return [...this.packages.values()]
      .map((stored) => stored.metadata)
      .filter((metadata) => metadata.state === state)
      .map((metadata) => ({ ...metadata, fileUris: [...metadata.fileUris], dependencies: [...metadata.dependencies] }))
      .sort((left, right) => left.releaseId.localeCompare(right.releaseId) || left.packageId.localeCompare(right.packageId));
  }

  private usedBytes() {
    return [...this.packages.values()].reduce((sum, stored) => sum + stored.metadata.bytes, 0);
  }
}

function packageKey(releaseId: string, packageId: string) {
  return `${releaseId}\u0000${packageId}`;
}
