import type { ReleaseFile, ReleaseManifest, ReleasePackage } from './release-types';

export type HistoricalRecord = Readonly<Record<string, unknown>>;

export interface HistoricalEventQuery {
  from?: number;
  to?: number;
  entityId?: string;
  query?: string;
}

export interface HistoricalSnapshot {
  readonly release: ReleaseManifest;
  getCollection(name: string): Promise<readonly HistoricalRecord[]>;
  getEntity(id: string): Promise<HistoricalRecord | undefined>;
  queryPolitiesAt(year: number): Promise<readonly HistoricalRecord[]>;
  queryBoundariesAt(year: number): Promise<readonly HistoricalRecord[]>;
  queryEvents(query?: HistoricalEventQuery): Promise<readonly HistoricalRecord[]>;
  getCoverageDecision(polityId: string, year: number): Promise<HistoricalRecord | undefined>;
  search(query: string): Promise<readonly HistoricalRecord[]>;
}

export class InMemoryHistoricalSnapshot implements HistoricalSnapshot {
  constructor(
    readonly release: ReleaseManifest,
    private readonly core: Readonly<Record<string, readonly unknown[]>>,
    private readonly territory: Readonly<Record<string, readonly unknown[]>> = {},
  ) {}

  async getCollection(name: string) {
    const value = this.core[name];
    if (!value) throw new Error(`Historical collection is unavailable: ${name}`);
    return validateRecords(name, value);
  }

  async getEntity(id: string) {
    for (const value of Object.values(this.core)) {
      const match = value.find((record) => identityOf(record) === id);
      if (match && isRecord(match)) return match;
    }
    return undefined;
  }

  async queryPolitiesAt(year: number) {
    assertCivilYear(year);
    return (await this.getCollection('polities')).filter((record) => numberAt(record, 'startYear') <= year && numberAt(record, 'endYear') >= year);
  }

  async queryBoundariesAt(year: number) {
    assertCivilYear(year);
    return validateRecords('boundaries', this.territory.boundaries ?? []).filter((record) => numberAt(record, 'validFrom') <= year && numberAt(record, 'validTo') >= year);
  }

  async queryEvents(query: HistoricalEventQuery = {}) {
    if (query.from !== undefined) assertCivilYear(query.from);
    if (query.to !== undefined) assertCivilYear(query.to);
    const needle = query.query?.trim().toLocaleLowerCase();
    return (await this.getCollection('events')).filter((record) => {
      const year = numberAt(record, 'year');
      const endYear = typeof record.endYear === 'number' ? record.endYear : year;
      return (query.from === undefined || endYear >= query.from)
        && (query.to === undefined || year <= query.to)
        && (!query.entityId || recordReferences(record, query.entityId))
        && (!needle || searchableText(record).includes(needle));
    });
  }

  async getCoverageDecision(polityId: string, year: number) {
    assertCivilYear(year);
    return validateRecords('coverageConclusions', this.territory.coverageConclusions ?? []).find((record) =>
      record.polityId === polityId && numberAt(record, 'from') <= year && numberAt(record, 'to') >= year);
  }

  async search(query: string) {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return Object.values(this.core).flatMap((value) => validateRecords('search', value).filter((record) => searchableText(record).includes(needle)));
  }
}

type SnapshotFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class RemoteHistoricalSnapshot implements HistoricalSnapshot {
  readonly release: ReleaseManifest;
  private readonly fileLoads = new Map<string, Promise<unknown>>();

  constructor(
    release: ReleaseManifest,
    private readonly fetcher: SnapshotFetch,
    private readonly resolveAsset: (uri: string) => string,
  ) {
    this.release = release;
  }

  async getCollection(name: string): Promise<readonly HistoricalRecord[]> {
    const core = await this.loadObjectPackage('core-zh');
    const value = core[name];
    if (!Array.isArray(value)) throw new Error(`Historical collection is unavailable: ${name}`);
    return validateRecords(name, value);
  }

  async getEntity(id: string) {
    if (!id) return undefined;
    const core = await this.loadObjectPackage('core-zh');
    for (const value of Object.values(core)) {
      if (!Array.isArray(value)) continue;
      const match = value.find((record) => identityOf(record) === id);
      if (match && isRecord(match)) return match;
    }
    return undefined;
  }

  async queryPolitiesAt(year: number) {
    assertCivilYear(year);
    return (await this.getCollection('polities')).filter((record) =>
      numberAt(record, 'startYear') <= year && numberAt(record, 'endYear') >= year);
  }

  async queryBoundariesAt(year: number) {
    assertCivilYear(year);
    const territory = await this.loadObjectPackage('china-territory');
    return validateRecords('boundaries', territory.boundaries ?? []).filter((record) =>
      numberAt(record, 'validFrom') <= year && numberAt(record, 'validTo') >= year);
  }

  async queryEvents(query: HistoricalEventQuery = {}) {
    if (query.from !== undefined) assertCivilYear(query.from);
    if (query.to !== undefined) assertCivilYear(query.to);
    const needle = query.query?.trim().toLocaleLowerCase();
    return (await this.getCollection('events')).filter((record) => {
      const year = numberAt(record, 'year');
      const endYear = typeof record.endYear === 'number' ? record.endYear : year;
      if (query.from !== undefined && endYear < query.from) return false;
      if (query.to !== undefined && year > query.to) return false;
      if (query.entityId && !recordReferences(record, query.entityId)) return false;
      return !needle || searchableText(record).includes(needle);
    });
  }

  async getCoverageDecision(polityId: string, year: number) {
    assertCivilYear(year);
    const territory = await this.loadObjectPackage('china-territory');
    return validateRecords('coverageConclusions', territory.coverageConclusions ?? []).find((record) =>
      record.polityId === polityId && numberAt(record, 'from') <= year && numberAt(record, 'to') >= year);
  }

  async search(query: string) {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    const core = await this.loadObjectPackage('core-zh');
    const results: HistoricalRecord[] = [];
    for (const [name, value] of Object.entries(core)) {
      if (!Array.isArray(value)) continue;
      for (const record of validateRecords(name, value)) {
        if (searchableText(record).includes(needle)) results.push(record);
      }
    }
    return results;
  }

  private async loadObjectPackage(packageId: string): Promise<Record<string, unknown>> {
    const releasePackage = this.release.packages.find((item) => item.id === packageId);
    if (!releasePackage) throw new Error(`Release ${this.release.releaseId} is missing package ${packageId}`);
    const values = await Promise.all(releasePackage.files.map((file) => this.loadFile(releasePackage, file)));
    const merged: Record<string, unknown> = {};
    for (const value of values) {
      if (!isRecord(value)) throw new Error(`Package ${packageId} must contain JSON objects`);
      for (const [key, nested] of Object.entries(value)) {
        if (key in merged) throw new Error(`Package ${packageId} repeats collection ${key}`);
        merged[key] = nested;
      }
    }
    return merged;
  }

  private loadFile(releasePackage: ReleasePackage, file: ReleaseFile) {
    const cached = this.fileLoads.get(file.uri);
    if (cached) return cached;
    const loading = this.fetchAndVerify(releasePackage, file);
    this.fileLoads.set(file.uri, loading);
    return loading;
  }

  private async fetchAndVerify(releasePackage: ReleasePackage, file: ReleaseFile) {
    const response = await this.fetcher(this.resolveAsset(file.uri));
    if (!response.ok) throw new Error(`Unable to load ${releasePackage.id} file ${file.uri}: ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength !== file.bytes) throw new Error(`Byte size mismatch for ${file.uri}`);
    const digest = await sha256(bytes);
    if (digest !== file.sha256.toLowerCase()) throw new Error(`SHA-256 mismatch for ${file.uri}`);
    try {
      return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    } catch {
      throw new Error(`Invalid JSON in ${file.uri}`);
    }
  }
}

function validateRecords(name: string, value: unknown): readonly HistoricalRecord[] {
  if (!Array.isArray(value) || value.some((record) => !isRecord(record))) {
    throw new Error(`Historical collection ${name} must be an array of records`);
  }
  return value;
}

function isRecord(value: unknown): value is HistoricalRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function identityOf(value: unknown) {
  if (!isRecord(value)) return undefined;
  for (const key of ['id', 'personId', 'eventId', 'heritageId', 'polityId']) {
    if (typeof value[key] === 'string') return value[key];
  }
  return undefined;
}

function numberAt(record: HistoricalRecord, field: string) {
  const value = record[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${field} must be a finite number`);
  return value;
}

function searchableText(record: HistoricalRecord) {
  return ['name', 'title', 'historicalName', 'summary', 'description']
    .map((field) => typeof record[field] === 'string' ? record[field] : '')
    .join(' ')
    .toLocaleLowerCase();
}

function recordReferences(record: HistoricalRecord, id: string) {
  return Object.values(record).some((value) => value === id || (Array.isArray(value) && value.includes(id)));
}

function assertCivilYear(year: number) {
  if (!Number.isInteger(year) || year === 0) throw new Error(`Historical query year 0 is not a valid civil year: ${year}`);
}

async function sha256(bytes: Uint8Array) {
  const data = bytes.buffer instanceof ArrayBuffer
    ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    : new Uint8Array(bytes).buffer;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
