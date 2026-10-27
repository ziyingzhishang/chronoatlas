import type { ReleaseFile, ReleaseManifest, ReleasePackage } from '../content/release-types';
import { validateReleaseManifest } from '../content/release-validation';
import { CachePackageFiles } from './cache-package-files';
import type { ActivationState, InstalledPackage, PackageStore } from './package-store';

const DATABASE_VERSION = 1;
const METADATA_SCHEMA_VERSION = 1;
const STORE_NAME = 'state';
const ROOT_KEY = 'root';

interface PersistedPackage extends InstalledPackage {
  expectedFileUris: readonly string[];
  fileDigests: Record<string, string>;
}

interface PersistedState {
  schemaVersion: number;
  packages: Record<string, PersistedPackage>;
  activation: ActivationState;
  activatedRequirements: Record<string, readonly string[]>;
  manifests: Record<string, ReleaseManifest>;
}

export interface IndexedDbPackageStoreOptions {
  databaseName?: string;
  indexedDb?: IDBFactory;
  files?: CachePackageFiles;
  storageManager?: Pick<StorageManager, 'estimate'>;
}

export class IndexedDbPackageStore implements PackageStore {
  private operationQueue: Promise<void> = Promise.resolve();

  private constructor(
    private readonly database: IDBDatabase,
    private readonly files: CachePackageFiles,
    private readonly storageManager?: Pick<StorageManager, 'estimate'>,
  ) {}

  static async open(options: IndexedDbPackageStoreOptions = {}) {
    const indexedDb = options.indexedDb ?? globalThis.indexedDB;
    if (!indexedDb) throw new Error('IndexedDB is unavailable');
    const database = await openDatabase(indexedDb, options.databaseName ?? 'chronoatlas-offline-v1');
    const files = options.files ?? new CachePackageFiles();
    const store = new IndexedDbPackageStore(database, files, options.storageManager ?? globalThis.navigator?.storage);
    try {
      await store.initializeState();
      return store;
    } catch (error) {
      database.close();
      throw error;
    }
  }

  close() {
    this.database.close();
  }

  async saveReleaseManifest(manifest: ReleaseManifest) {
    const validated = validateReleaseManifest(structuredClone(manifest));
    await this.updateState((state) => {
      const existing = state.manifests[validated.releaseId];
      if (existing && JSON.stringify(existing) !== JSON.stringify(validated)) {
        throw new Error(`Cannot replace immutable manifest for release ${validated.releaseId}`);
      }
      state.manifests[validated.releaseId] = structuredClone(validated);
    });
  }

  async readReleaseManifest(releaseId: string) {
    const manifest = (await this.requireState()).manifests[releaseId];
    return manifest ? structuredClone(manifest) : undefined;
  }

  async findReusableFile(file: ReleaseFile) {
    const state = await this.requireState();
    for (const stored of Object.values(state.packages)) {
      if (stored.state !== 'complete') continue;
      const uri = stored.fileUris.find((candidate) => stored.fileDigests[candidate] === file.sha256);
      if (!uri) continue;
      const bytes = await this.files.read(stored.releaseId, stored.packageId, uri);
      if (bytes?.byteLength === file.bytes) return bytes;
    }
    return undefined;
  }

  async availableBytes() {
    if (!this.storageManager) return undefined;
    const estimate = await this.storageManager.estimate();
    if (estimate.quota === undefined || estimate.usage === undefined) return undefined;
    return Math.max(0, estimate.quota - estimate.usage);
  }

  async beginPackage(releaseId: string, releasePackage: ReleasePackage) {
    const key = packageKey(releaseId, releasePackage.id);
    const replaceStaging = await this.updateState((state) => {
      const existing = state.packages[key];
      if (existing?.state === 'complete') return false;
      state.packages[key] = {
        releaseId,
        packageId: releasePackage.id,
        state: 'staging',
        bytes: 0,
        fileUris: [],
        dependencies: [...releasePackage.dependencies],
        expectedFileUris: releasePackage.files.map((file) => file.uri),
        fileDigests: {},
      };
      return existing?.state === 'staging';
    });
    if (replaceStaging) await this.files.deletePackage(releaseId, releasePackage.id);
  }

  async writeStagedFile(releaseId: string, packageId: string, file: ReleaseFile, bytes: Uint8Array) {
    const key = packageKey(releaseId, packageId);
    const state = await this.requireState();
    const stored = state.packages[key];
    if (!stored) throw new Error(`Unknown package ${releaseId}/${packageId}`);
    if (stored.state !== 'staging') throw new Error(`Package ${packageId} is not staging`);
    if (!stored.expectedFileUris.includes(file.uri)) throw new Error(`Unexpected package file: ${file.uri}`);
    const previousBytes = stored.fileUris.includes(file.uri)
      ? (await this.files.read(releaseId, packageId, file.uri))?.byteLength ?? 0
      : 0;
    const available = await this.availableBytes();
    const additional = bytes.byteLength - previousBytes;
    if (available !== undefined && additional > available) throw new Error(`Insufficient storage space for ${file.uri}`);
    await this.files.write(releaseId, packageId, file, bytes);
    await this.updateState((next) => {
      const nextStored = requirePackage(next, releaseId, packageId);
      if (nextStored.state !== 'staging') throw new Error(`Package ${packageId} is not staging`);
      const fileUris = new Set(nextStored.fileUris);
      fileUris.add(file.uri);
      next.packages[key] = {
        ...nextStored,
        bytes: nextStored.bytes + additional,
        fileUris: [...fileUris].sort(),
        fileDigests: { ...nextStored.fileDigests, [file.uri]: file.sha256 },
      };
    });
  }

  async completePackage(releaseId: string, packageId: string) {
    await this.updateState((state) => {
      const stored = requirePackage(state, releaseId, packageId);
      if (stored.state !== 'staging') throw new Error(`Package ${packageId} is not staging`);
      const missing = stored.expectedFileUris.filter((uri) => !stored.fileUris.includes(uri));
      if (missing.length) throw new Error(`Package ${packageId} is missing staged files: ${missing.join(', ')}`);
      state.packages[packageKey(releaseId, packageId)] = {
        ...stored,
        state: 'complete',
        installedAt: new Date().toISOString(),
      };
    });
  }

  async abortPackage(releaseId: string, packageId: string) {
    const state = await this.requireState();
    const key = packageKey(releaseId, packageId);
    if (state.packages[key]?.state !== 'staging') return;
    await this.updateState((next) => { if (next.packages[key]?.state === 'staging') delete next.packages[key]; });
    await this.files.deletePackage(releaseId, packageId);
  }

  async cleanupAbandonedStaging() {
    const state = await this.requireState();
    const staging = Object.values(state.packages).filter((item) => item.state === 'staging');
    await this.updateState((next) => {
      for (const item of staging) {
        const key = packageKey(item.releaseId, item.packageId);
        if (next.packages[key]?.state === 'staging') delete next.packages[key];
      }
    });
    for (const item of staging) await this.files.deletePackage(item.releaseId, item.packageId);
  }

  async isPackageComplete(releaseId: string, packageId: string) {
    return (await this.requireState()).packages[packageKey(releaseId, packageId)]?.state === 'complete';
  }

  async listInstalled() {
    return this.listByState('complete');
  }

  async listStaging() {
    return this.listByState('staging');
  }

  async readPackageFile(releaseId: string, packageId: string, uri: string) {
    const item = (await this.requireState()).packages[packageKey(releaseId, packageId)];
    if (item?.state !== 'complete' || !item.fileUris.includes(uri)) return undefined;
    return this.files.read(releaseId, packageId, uri);
  }

  async activateRelease(releaseId: string, requiredPackageIds: readonly string[]) {
    await this.updateState((state) => {
      const missing = requiredPackageIds.filter((packageId) => state.packages[packageKey(releaseId, packageId)]?.state !== 'complete');
      if (missing.length) throw new Error(`Required packages are not installed: ${missing.join(', ')}`);
      state.activatedRequirements[releaseId] = [...requiredPackageIds];
      state.activation = {
        activeReleaseId: releaseId,
        previousReleaseId: state.activation.activeReleaseId === releaseId
          ? state.activation.previousReleaseId
          : state.activation.activeReleaseId,
      };
    });
  }

  async activationState() {
    return { ...(await this.requireState()).activation };
  }

  async rollbackActivation() {
    await this.updateState((state) => {
      const previous = state.activation.previousReleaseId;
      if (!previous) throw new Error('No previous release is available for rollback');
      const requirements = state.activatedRequirements[previous] ?? [];
      const missing = requirements.filter((packageId) => state.packages[packageKey(previous, packageId)]?.state !== 'complete');
      if (!requirements.length || missing.length) throw new Error(`Previous release ${previous} is not complete`);
      state.activation = { activeReleaseId: previous, previousReleaseId: state.activation.activeReleaseId };
    });
  }

  async deletePackage(releaseId: string, packageId: string) {
    await this.updateState((state) => {
      if (
        state.activation.activeReleaseId === releaseId
        && (state.activatedRequirements[releaseId] ?? []).includes(packageId)
      ) throw new Error(`Cannot delete package required by active release: ${packageId}`);
      delete state.packages[packageKey(releaseId, packageId)];
    });
    await this.files.deletePackage(releaseId, packageId);
  }

  private async listByState(state: InstalledPackage['state']) {
    const current = await this.requireState();
    return Object.values(current.packages)
      .filter((item) => item.state === state)
      .map(({ expectedFileUris: _expected, ...metadata }) => ({
        ...metadata,
        fileUris: [...metadata.fileUris],
        dependencies: [...metadata.dependencies],
      }))
      .sort((left, right) => left.releaseId.localeCompare(right.releaseId) || left.packageId.localeCompare(right.packageId));
  }

  private async requireState() {
    const state = await this.readState();
    if (!state) throw new Error('Offline package metadata is missing');
    assertSupportedState(state);
    return state;
  }

  private initializeState() {
    return this.runStateTransaction((state) => {
      if (state === undefined) return { state: emptyState(), result: undefined };
      assertSupportedState(state);
      return { state: normalizeState(state), result: undefined };
    });
  }

  private updateState<T>(change: (state: PersistedState) => T) {
    const operation = this.operationQueue.then(async () => {
      return this.runStateTransaction((state) => {
        if (!state) throw new Error('Offline package metadata is missing');
        assertSupportedState(state);
        return { state, result: change(state) };
      });
    });
    this.operationQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  private async readState(): Promise<PersistedState | undefined> {
    const transaction = this.database.transaction(STORE_NAME, 'readonly');
    const completion = transactionCompletion(transaction);
    const state = await requestResult<PersistedState | undefined>(transaction.objectStore(STORE_NAME).get(ROOT_KEY));
    await completion;
    return state === undefined ? undefined : structuredClone(state);
  }

  private async runStateTransaction<T>(
    change: (state: PersistedState | undefined) => { state: PersistedState; result: T },
  ): Promise<T> {
    const transaction = this.database.transaction(STORE_NAME, 'readwrite');
    const completion = transactionCompletion(transaction);
    const objectStore = transaction.objectStore(STORE_NAME);
    const current = await requestResult<PersistedState | undefined>(objectStore.get(ROOT_KEY));
    const { state, result } = change(current === undefined ? undefined : structuredClone(current));
    await requestResult(objectStore.put(structuredClone(state), ROOT_KEY));
    await completion;
    return result;
  }
}

function emptyState(): PersistedState {
  return { schemaVersion: METADATA_SCHEMA_VERSION, packages: {}, activation: {}, activatedRequirements: {}, manifests: {} };
}

function normalizeState(state: PersistedState) {
  state.manifests ??= {};
  for (const stored of Object.values(state.packages)) stored.fileDigests ??= {};
  return state;
}

function assertSupportedState(value: unknown): asserts value is PersistedState {
  if (!value || typeof value !== 'object' || (value as Partial<PersistedState>).schemaVersion !== METADATA_SCHEMA_VERSION) {
    throw new Error('Unsupported offline metadata schema version');
  }
}

function requirePackage(state: PersistedState, releaseId: string, packageId: string) {
  const stored = state.packages[packageKey(releaseId, packageId)];
  if (!stored) throw new Error(`Unknown package ${releaseId}/${packageId}`);
  return stored;
}

function packageKey(releaseId: string, packageId: string) {
  return `${releaseId}\u0000${packageId}`;
}

function openDatabase(indexedDb: IDBFactory, name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(name, DATABASE_VERSION);
    request.onupgradeneeded = (event) => {
      if (event.oldVersion !== 0) {
        request.transaction?.abort();
        return;
      }
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Unsupported or unavailable IndexedDB version: ${request.error?.message ?? 'open failed'}`));
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionCompletion(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
  });
}
