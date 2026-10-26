import { publicAssetUrl } from '../runtime/asset-url';
import { validateReleaseManifest } from './release-validation';
import { RemoteHistoricalSnapshot, type HistoricalSnapshot } from './snapshot';

export type ContentMediaKind = 'image' | 'audio' | 'video' | 'document' | 'map-overlay';

export interface ContentMediaAsset {
  id: string;
  kind: ContentMediaKind;
  uri: string;
  mimeType: string;
  alt?: string;
  caption?: string;
  credit?: string;
  license?: string;
  sourceId?: string;
}

export interface ContentManifest {
  schemaVersion: 1;
  revision: string;
  collections: Record<string, string>;
  media: ContentMediaAsset[];
}

export type ContentCollections = Record<string, readonly unknown[]>;

export interface ContentSnapshot {
  manifest: ContentManifest;
  collections: ContentCollections;
}

export interface HistoricalContentRepository {
  load(): Promise<ContentSnapshot>;
}

type ContentFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface HistoricalDataRepositoryOptions {
  fetcher?: ContentFetch;
  baseUrl?: string;
}

export interface ReleaseSnapshotRepository {
  open(releaseId?: string): Promise<HistoricalSnapshot>;
}

/** Opens one immutable release. The mutable latest pointer is resolved once. */
export class HistoricalDataRepository implements ReleaseSnapshotRepository {
  private readonly fetcher: ContentFetch;
  private readonly baseUrl: string;

  constructor(options: HistoricalDataRepositoryOptions = {}) {
    this.fetcher = options.fetcher ?? fetch;
    this.baseUrl = options.baseUrl ?? import.meta.env.BASE_URL;
  }

  async open(releaseId?: string): Promise<HistoricalSnapshot> {
    const fixedReleaseId = releaseId ?? await this.resolveLatestReleaseId();
    assertReleaseId(fixedReleaseId);
    const manifestUrl = publicAssetUrl(`releases/${fixedReleaseId}/manifest.json`, this.baseUrl);
    const response = await this.fetcher(manifestUrl);
    if (!response.ok) throw new Error(`Unable to load release manifest ${fixedReleaseId}: ${response.status}`);
    const manifest = validateReleaseManifest(await response.json() as unknown);
    if (manifest.schemaVersion !== '1') {
      throw new Error(`Unsupported release schema version: ${manifest.schemaVersion}`);
    }
    if (manifest.releaseId !== fixedReleaseId) {
      throw new Error(`Release manifest identity mismatch: expected ${fixedReleaseId}, got ${manifest.releaseId}`);
    }
    return new RemoteHistoricalSnapshot(
      manifest,
      this.fetcher,
      (uri) => publicAssetUrl(uri, this.baseUrl),
    );
  }

  private async resolveLatestReleaseId() {
    const response = await this.fetcher(publicAssetUrl('releases/latest.json', this.baseUrl), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load latest release pointer: ${response.status}`);
    const value = await response.json() as unknown;
    if (!value || typeof value !== 'object' || typeof (value as { releaseId?: unknown }).releaseId !== 'string') {
      throw new Error('Latest release pointer must contain releaseId');
    }
    return (value as { releaseId: string }).releaseId;
  }
}

function assertReleaseId(value: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) throw new Error(`Unsafe release id: ${value}`);
}

export class InMemoryContentRepository implements HistoricalContentRepository {
  constructor(
    private readonly manifest: ContentManifest,
    private readonly collections: ContentCollections,
  ) {}

  async load(): Promise<ContentSnapshot> {
    validateManifest(this.manifest);
    validateContentCollections(this.collections);
    return { manifest: this.manifest, collections: this.collections };
  }
}

export class ManifestContentRepository implements HistoricalContentRepository {
  constructor(
    private readonly manifestUrl: string,
    private readonly fetcher: ContentFetch = fetch,
  ) {}

  async load(): Promise<ContentSnapshot> {
    const manifestResponse = await this.fetcher(this.manifestUrl);
    if (!manifestResponse.ok) throw new Error(`Unable to load content manifest: ${manifestResponse.status}`);
    const manifest = await manifestResponse.json() as unknown;
    validateManifest(manifest);

    const entries = await Promise.all(Object.entries(manifest.collections).map(async ([name, reference]) => {
      const response = await this.fetcher(resolveReference(reference, this.manifestUrl));
      if (!response.ok) throw new Error(`Unable to load content collection ${name}: ${response.status}`);
      const collection = await response.json() as unknown;
      validateCollection(name, collection);
      return [name, collection] as const;
    }));

    return { manifest, collections: Object.fromEntries(entries) };
  }
}

function resolveReference(reference: string, manifestUrl: string) {
  if (/^[a-z][a-z\d+.-]*:/i.test(reference)) return reference;
  if (manifestUrl.startsWith('/')) {
    return new URL(reference, `https://content.local${manifestUrl}`).pathname;
  }
  return new URL(reference, manifestUrl).toString();
}

function validateManifest(value: unknown): asserts value is ContentManifest {
  if (!value || typeof value !== 'object') throw new Error('Invalid content manifest');
  const record = value as Record<string, unknown>;
  if (record.schemaVersion !== 1) throw new Error(`Unsupported content schema version: ${String(record.schemaVersion)}`);
  if (typeof record.revision !== 'string' || !record.revision.trim()) throw new Error('Content manifest revision is required');
  if (!record.collections || typeof record.collections !== 'object' || Array.isArray(record.collections)) throw new Error('Content manifest collections are required');
  if (!Array.isArray(record.media)) throw new Error('Content manifest media must be an array');
  for (const [name, reference] of Object.entries(record.collections)) {
    if (!name || typeof reference !== 'string' || !reference.trim()) throw new Error(`Invalid content collection reference: ${name}`);
  }
  const mediaIds = new Set<string>();
  const mediaKinds: ContentMediaKind[] = ['image', 'audio', 'video', 'document', 'map-overlay'];
  for (const asset of record.media) {
    if (!asset || typeof asset !== 'object') throw new Error('Invalid content media asset');
    const media = asset as Record<string, unknown>;
    if (typeof media.id !== 'string' || !media.id.trim() || typeof media.uri !== 'string' || !media.uri.trim() || typeof media.mimeType !== 'string' || !media.mimeType.includes('/')) throw new Error('Content media asset requires id, uri and MIME type');
    if (!mediaKinds.includes(media.kind as ContentMediaKind)) throw new Error(`Invalid content media kind: ${String(media.kind)}`);
    if (mediaIds.has(media.id)) throw new Error(`Duplicate content media id: ${media.id}`);
    mediaIds.add(media.id);
    for (const field of ['alt', 'caption', 'credit', 'license', 'sourceId']) {
      if (media[field] !== undefined && typeof media[field] !== 'string') throw new Error(`Content media ${media.id} field ${field} must be a string`);
    }
  }
}

const collectionRequiredStrings: Record<string, readonly string[]> = {
  polities: ['id', 'name'],
  places: ['id', 'historicalName'],
  people: ['id', 'name'],
  events: ['id', 'title'],
  studyEvents: ['id', 'title'],
  claims: ['id', 'subjectId', 'predicate'],
  heritage: ['id', 'name'],
  capitalTerms: ['polityId', 'placeId'],
  personDetails: ['personId', 'biography'],
  eventDetails: ['eventId'],
  heritageDetails: ['heritageId'],
  polityDetails: ['polityId'],
  sources: ['id', 'title'],
  eventTimeReviews: ['eventId', 'status', 'expectedPrecision', 'explanation', 'timelineStrategy'],
  mapReferences: ['id'],
};

export function validateContentCollections(collections: ContentCollections) {
  for (const [name, collection] of Object.entries(collections)) validateCollection(name, collection);
}

function validateCollection(name: string, value: unknown): asserts value is readonly unknown[] {
  if (!Array.isArray(value)) throw new Error(`Content collection ${name} must be an array`);
  const required = collectionRequiredStrings[name] ?? ['id'];
  const identities = new Set<string>();
  value.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Content collection ${name}[${index}] must be an object`);
    const record = item as Record<string, unknown>;
    for (const field of required) {
      if (typeof record[field] !== 'string' || !record[field].trim()) throw new Error(`Content collection ${name}[${index}] requires string field ${field}`);
    }
    validateRecordShape(name, record, index);
    const identity = typeof record.id === 'string' ? record.id
      : typeof record.personId === 'string' ? record.personId
      : typeof record.eventId === 'string' ? record.eventId
      : typeof record.heritageId === 'string' ? record.heritageId
      : typeof record.polityId === 'string' && name === 'polityDetails' ? record.polityId
      : name === 'capitalTerms' ? `${record.polityId}|${record.placeId}|${String(record.validFrom)}|${String(record.validTo)}`
      : required.map((field) => record[field]).join('|');
    if (identities.has(identity)) throw new Error(`Duplicate content collection identity in ${name}: ${identity}`);
    identities.add(identity);
  });
}

function validateRecordShape(name: string, record: Record<string, unknown>, index: number) {
  const at = `${name}[${index}]`;
  if (name === 'polities') {
    requireEnum(record, 'type', ['dynasty', 'kingdom', 'regime', 'tribal_polity', 'local_rule'], at);
    requireNumbers(record, ['startYear', 'endYear'], at);
    requireStrings(record, ['color', 'description'], at);
    requireStringArray(record, 'sourceIds', at);
    optionalEnum(record, 'region', ['world'], at);
    optionalStrings(record, ['capitalPlaceId', 'originalName', 'referenceUrl'], at);
    optionalObject(record, 'localizedName', at, (localized, localizedAt) => {
      requireEnum(localized, 'status', ['verified', 'source-original'], localizedAt);
      requireString(localized, 'mapLabel', localizedAt);
      optionalStrings(localized, ['sourceName'], localizedAt);
    });
    optionalObjectArray(record, 'capitalTerms', at, (term, termAt) => validateCapitalTerm(term, termAt));
  } else if (name === 'places') {
    requireNumbers(record, ['longitude', 'latitude'], at);
    requireStringArray(record, 'aliases', at);
    requireStringArray(record, 'sourceIds', at);
    optionalNumbers(record, ['validFrom', 'validTo'], at);
    optionalEnum(record, 'mappingStatus', ['exact', 'approximate', 'regional', 'debated'], at);
    optionalEnum(record, 'pointType', ['ancient-city-site', 'modern-city-centre', 'archaeological-site', 'regional-reference', 'mobile-centre'], at);
    optionalEnum(record, 'confidence', ['high', 'medium', 'low'], at);
    optionalStrings(record, ['modernName', 'modernAdministrativeUnit', 'notes'], at);
    optionalStringArrays(record, ['relatedPlaceIds'], at);
    if (record.geometry !== undefined && (!record.geometry || typeof record.geometry !== 'object' || Array.isArray(record.geometry))) throw new Error(`${at}.geometry must be a GeoJSON object`);
  } else if (name === 'people') {
    requireString(record, 'description', at);
    requireStringArray(record, 'sourceIds', at);
    optionalNumbers(record, ['birthYear', 'deathYear'], at);
    optionalStringArrays(record, ['aliases', 'roles', 'polityIds'], at);
  } else if (name === 'events' || name === 'studyEvents') {
    requireNumber(record, 'year', at);
    requireString(record, 'summary', at);
    requireStringArray(record, 'sourceIds', at);
    optionalNumbers(record, ['endYear'], at);
    optionalEnum(record, 'datePrecision', ['year', 'approximate', 'range'], at);
    optionalEnum(record, 'region', ['china', 'world'], at);
    optionalEnum(record, 'verification', ['checked', 'partial'], at);
    optionalEnum(record, 'locationPrecision', ['approximate', 'confirmed'], at);
    optionalStrings(record, ['placeId', 'category', 'background', 'process', 'impact', 'mapNote'], at);
    optionalObjectArray(record, 'references', at, (reference, referenceAt) => {
      requireStrings(reference, ['title', 'url'], referenceAt);
      optionalStrings(reference, ['detail'], referenceAt);
    });
    if (record.coordinates !== undefined && (!Array.isArray(record.coordinates) || record.coordinates.length !== 2 || record.coordinates.some((value) => typeof value !== 'number' || !Number.isFinite(value)))) throw new Error(`${at}.coordinates must be a finite [longitude, latitude] tuple`);
  } else if (name === 'claims') {
    requireEnum(record, 'datePrecision', ['day', 'year', 'approximate', 'range', 'century', 'unknown'], at);
    requireEnum(record, 'perspective', ['polity', 'city', 'person', 'heritage', 'source', 'overview'], at);
    requireEnum(record, 'evidenceType', ['explicit-record', 'archaeology', 'cross-checked', 'inference', 'tradition'], at);
    requireEnum(record, 'confidence', ['high', 'medium', 'low'], at);
    requireStringArray(record, 'sourceIds', at);
    optionalNumbers(record, ['validFrom', 'validTo'], at);
    optionalStrings(record, ['objectId', 'uncertaintyNote'], at);
  } else if (name === 'heritage') {
    requireStrings(record, ['placeId', 'description'], at);
    requireEnum(record, 'type', ['palace', 'city-site', 'tomb', 'temple', 'inscription', 'museum', 'other'], at);
    requireEnum(record, 'modernStatus', ['extant', 'archaeological-site', 'relocated', 'lost', 'uncertain'], at);
    requireStringArray(record, 'sourceIds', at);
    optionalNumbers(record, ['constructionFrom', 'constructionTo'], at);
  } else if (name === 'capitalTerms') {
    validateCapitalTerm(record, at);
  } else if (name === 'personDetails') {
    requireStringArrays(record, ['aliases', 'keyEvents', 'sourceIds'], at);
    requireObjectArray(record, 'offices', at, (office, officeAt) => {
      requireString(office, 'title', officeAt);
      requireEnum(office, 'datePrecision', ['year', 'range', 'approximate', 'unknown'], officeAt);
      requireStringArray(office, 'sourceIds', officeAt);
      optionalNumbers(office, ['validFrom', 'validTo'], officeAt);
      optionalStrings(office, ['polityId', 'placeId', 'uncertaintyNote'], officeAt);
    });
    optionalStrings(record, ['uncertaintyNote'], at);
  } else if (name === 'eventDetails') {
    requireStringArrays(record, ['polityIds', 'causes', 'consequences', 'locationIds', 'relatedEventIds', 'sourceIds'], at);
    requireObjectArray(record, 'participants', at, (participant, participantAt) => {
      requireStrings(participant, ['personId', 'role'], participantAt);
      optionalStrings(participant, ['note'], participantAt);
      optionalEnum(participant, 'relationType', ['direct', 'contextual'], participantAt);
    });
    optionalObjectArray(record, 'phases', at, (phase, phaseAt) => {
      requireStrings(phase, ['label', 'summary'], phaseAt);
      optionalNumbers(phase, ['startYear', 'endYear'], phaseAt);
    });
    optionalStrings(record, ['uncertaintyNote'], at);
  } else if (name === 'heritageDetails') {
    requireStrings(record, ['modernLocation', 'presentDayValue', 'uncertaintyNote'], at);
    requireStringArrays(record, ['historicalAssociations', 'associatedPeople', 'associatedPolities', 'associatedEvents', 'survivingFeatures', 'sourceIds'], at);
    requireObjectArray(record, 'constructionHistory', at, (phase, phaseAt) => {
      requireStrings(phase, ['label', 'period', 'description'], phaseAt);
      requireEnum(phase, 'type', ['original', 'site', 'reconstruction', 'restoration'], phaseAt);
      requireStringArray(phase, 'sourceIds', phaseAt);
      optionalNumbers(phase, ['from', 'to'], phaseAt);
      optionalStrings(phase, ['uncertaintyNote'], phaseAt);
    });
  } else if (name === 'polityDetails') {
    requireStrings(record, ['perspectiveSummary', 'uncertaintyNote'], at);
    requireStringArrays(record, ['foundationProcess', 'principalFigureIds', 'heritageIds', 'eventIds', 'claimIds', 'sourceIds'], at);
    requireObjectArray(record, 'turningPoints', at, (point, pointAt) => {
      requireNumber(point, 'year', pointAt);
      requireStrings(point, ['title', 'summary'], pointAt);
      optionalStrings(point, ['eventId'], pointAt);
    });
    requireObjectArray(record, 'capitalPhases', at, (phase, phaseAt) => {
      requireString(phase, 'placeId', phaseAt);
      requireNumbers(phase, ['validFrom', 'validTo'], phaseAt);
      requireEnum(phase, 'role', ['primary', 'secondary', 'seasonal', 'temporary', 'de_facto', 'military', 'mobile_court', 'disputed'], phaseAt);
      requireEnum(phase, 'status', ['formal', 'actual', 'claimed', 'uncertain', 'seasonal'], phaseAt);
      optionalStrings(phase, ['note'], phaseAt);
    });
    optionalObjectArray(record, 'periods', at, (period, periodAt) => {
      requireStrings(period, ['id', 'label', 'summary'], periodAt);
      requireNumbers(period, ['startYear', 'endYear'], periodAt);
      requireEnum(period, 'datePrecision', ['year', 'approximate', 'range'], periodAt);
      optionalStringArrays(period, ['eventIds'], periodAt);
    });
  } else if (name === 'sources') {
    requireStrings(record, ['scope', 'note'], at);
    optionalStrings(record, ['authorOrInstitution', 'urlOrCitation'], at);
  } else if (name === 'eventTimeReviews') {
    requireEnum(record, 'status', ['confirmed', 'approximate', 'unknown'], at);
    requireEnum(record, 'expectedPrecision', ['year', 'approximate', 'range'], at);
    requireEnum(record, 'timelineStrategy', ['year-marker', 'approximate-marker', 'range-band', 'unknown-window'], at);
  } else if (name === 'mapReferences') {
    requireNumber(record, 'effectiveFrom', at);
    if (!record.featureCollection || typeof record.featureCollection !== 'object' || Array.isArray(record.featureCollection)) {
      throw new Error(`${at}.featureCollection must be a GeoJSON feature collection`);
    }
    const featureCollection = record.featureCollection as Record<string, unknown>;
    if (featureCollection.type !== 'FeatureCollection' || !Array.isArray(featureCollection.features)) {
      throw new Error(`${at}.featureCollection must be a GeoJSON feature collection`);
    }
  }
}

function validateCapitalTerm(record: Record<string, unknown>, at: string) {
  requireStrings(record, ['polityId', 'placeId'], at);
  requireNumbers(record, ['validFrom', 'validTo'], at);
  requireEnum(record, 'role', ['primary', 'secondary', 'seasonal', 'temporary', 'de_facto', 'military', 'mobile_court', 'disputed'], at);
  requireEnum(record, 'status', ['formal', 'actual', 'claimed', 'uncertain', 'seasonal'], at);
  requireEnum(record, 'confidence', ['high', 'medium', 'low'], at);
  requireStringArray(record, 'sourceIds', at);
  optionalStrings(record, ['notes'], at);
}

function requireString(record: Record<string, unknown>, field: string, at: string) {
  if (typeof record[field] !== 'string' || !record[field].trim()) throw new Error(`${at}.${field} must be a non-empty string`);
}
function requireStrings(record: Record<string, unknown>, fields: string[], at: string) { fields.forEach((field) => requireString(record, field, at)); }
function optionalStrings(record: Record<string, unknown>, fields: string[], at: string) { fields.forEach((field) => { if (record[field] !== undefined && typeof record[field] !== 'string') throw new Error(`${at}.${field} must be a string`); }); }
function requireNumber(record: Record<string, unknown>, field: string, at: string) { if (typeof record[field] !== 'number' || !Number.isFinite(record[field])) throw new Error(`${at}.${field} must be a finite number`); }
function requireNumbers(record: Record<string, unknown>, fields: string[], at: string) { fields.forEach((field) => requireNumber(record, field, at)); }
function optionalNumbers(record: Record<string, unknown>, fields: string[], at: string) { fields.forEach((field) => { if (record[field] !== undefined) requireNumber(record, field, at); }); }
function requireStringArray(record: Record<string, unknown>, field: string, at: string) { if (!Array.isArray(record[field]) || record[field].some((value) => typeof value !== 'string')) throw new Error(`${at}.${field} must be a string array`); }
function requireStringArrays(record: Record<string, unknown>, fields: string[], at: string) { fields.forEach((field) => requireStringArray(record, field, at)); }
function optionalStringArrays(record: Record<string, unknown>, fields: string[], at: string) { fields.forEach((field) => { if (record[field] !== undefined) requireStringArray(record, field, at); }); }
function requireEnum(record: Record<string, unknown>, field: string, values: readonly string[], at: string) { if (typeof record[field] !== 'string' || !values.includes(record[field])) throw new Error(`${at}.${field} must be one of ${values.join(', ')}`); }
function optionalEnum(record: Record<string, unknown>, field: string, values: readonly string[], at: string) { if (record[field] !== undefined) requireEnum(record, field, values, at); }
function requireObjectArray(record: Record<string, unknown>, field: string, at: string, validate: (item: Record<string, unknown>, itemAt: string) => void) {
  if (!Array.isArray(record[field])) throw new Error(`${at}.${field} must be an array`);
  record[field].forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`${at}.${field}[${index}] must be an object`);
    validate(item as Record<string, unknown>, `${at}.${field}[${index}]`);
  });
}
function optionalObjectArray(record: Record<string, unknown>, field: string, at: string, validate: (item: Record<string, unknown>, itemAt: string) => void) { if (record[field] !== undefined) requireObjectArray(record, field, at, validate); }
function optionalObject(record: Record<string, unknown>, field: string, at: string, validate: (item: Record<string, unknown>, itemAt: string) => void) {
  if (record[field] === undefined) return;
  if (!record[field] || typeof record[field] !== 'object' || Array.isArray(record[field])) throw new Error(`${at}.${field} must be an object`);
  validate(record[field] as Record<string, unknown>, `${at}.${field}`);
}
