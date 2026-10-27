import type { ReleaseFile, ReleaseManifest, ReleasePackage } from '../content/release-types';

export interface InstalledPackage {
  releaseId: string;
  packageId: string;
  state: 'staging' | 'complete';
  bytes: number;
  fileUris: readonly string[];
  dependencies: readonly string[];
  installedAt?: string;
}

export interface ActivationState {
  activeReleaseId?: string;
  previousReleaseId?: string;
}

export interface PackageStore {
  saveReleaseManifest(manifest: ReleaseManifest): Promise<void>;
  readReleaseManifest(releaseId: string): Promise<ReleaseManifest | undefined>;
  findReusableFile(file: ReleaseFile): Promise<Uint8Array | undefined>;
  availableBytes(): Promise<number | undefined>;
  beginPackage(releaseId: string, releasePackage: ReleasePackage): Promise<void>;
  writeStagedFile(releaseId: string, packageId: string, file: ReleaseFile, bytes: Uint8Array): Promise<void>;
  completePackage(releaseId: string, packageId: string): Promise<void>;
  abortPackage(releaseId: string, packageId: string): Promise<void>;
  isPackageComplete(releaseId: string, packageId: string): Promise<boolean>;
  listInstalled(): Promise<readonly InstalledPackage[]>;
  listStaging(): Promise<readonly InstalledPackage[]>;
  readPackageFile(releaseId: string, packageId: string, uri: string): Promise<Uint8Array | undefined>;
  activateRelease(releaseId: string, requiredPackageIds: readonly string[]): Promise<void>;
  activationState(): Promise<ActivationState>;
  rollbackActivation(): Promise<void>;
  deletePackage(releaseId: string, packageId: string): Promise<void>;
}
