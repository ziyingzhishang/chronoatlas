import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  bundledContentCatalog,
  bundledContentManifest,
  bundledContentRepository,
  bundledHistoricalSnapshot,
  bundledHistoricalStateSource,
  bundledReleaseManifest,
  type BundledContentCatalog,
} from './bundled-content';
import {
  validateContentCollections,
  type ContentCollections,
  type HistoricalContentRepository,
  type ReleaseSnapshotRepository,
} from './repository';
import { InMemoryHistoricalSnapshot, type HistoricalSnapshot } from './snapshot';
import type { ReleaseManifest } from './release-types';
import type { HistoricalStateSource } from '../domain/history-state';
import type { BoundaryEvidence, BoundaryState } from '../domain/types';
import { useLocale } from '../i18n/locale';
import { OFFLINE_RELEASE_CHANGE_EVENT } from '../offline/release-events';

interface ContentContextValue {
  catalog: BundledContentCatalog;
  revision: string;
  external: boolean;
  snapshot: HistoricalSnapshot;
  release: ReleaseManifest;
  historySource: HistoricalStateSource;
}

export type ContentState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; value: ContentContextValue; snapshot: HistoricalSnapshot; release: ReleaseManifest };

const bundledValue: ContentContextValue = {
  catalog: bundledContentCatalog,
  revision: bundledContentManifest.revision,
  external: false,
  snapshot: bundledHistoricalSnapshot,
  release: bundledReleaseManifest,
  historySource: bundledHistoricalStateSource,
};

const ContentContext = createContext<ContentContextValue>(bundledValue);

export function ContentProvider({ children, repository }: {
  children: ReactNode;
  repository?: HistoricalContentRepository | ReleaseSnapshotRepository;
}) {
  const { t } = useLocale();
  const activeRepository = repository ?? bundledContentRepository;
  const usesBundledRepository = activeRepository === bundledContentRepository;
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<ContentState>(usesBundledRepository
    ? { status: 'ready', value: bundledValue, snapshot: bundledHistoricalSnapshot, release: bundledReleaseManifest }
    : { status: 'loading' });

  useEffect(() => {
    const reload = () => setReloadToken((value) => value + 1);
    globalThis.addEventListener?.(OFFLINE_RELEASE_CHANGE_EVENT, reload);
    return () => globalThis.removeEventListener?.(OFFLINE_RELEASE_CHANGE_EVENT, reload);
  }, []);

  useEffect(() => {
    let active = true;
    if (usesBundledRepository) {
      setState({ status: 'ready', value: bundledValue, snapshot: bundledHistoricalSnapshot, release: bundledReleaseManifest });
      return () => { active = false; };
    }
    setState({ status: 'loading' });
    loadRepository(activeRepository).then((value) => {
      if (active) setState({ status: 'ready', value, snapshot: value.snapshot, release: value.release });
    }).catch((reason: unknown) => {
      if (active) setState({ status: 'error', error: reason instanceof Error ? reason : new Error(String(reason)) });
    });
    return () => { active = false; };
  }, [activeRepository, reloadToken, usesBundledRepository]);

  const stableValue = useMemo(() => state.status === 'ready' ? state.value : undefined, [state]);
  if (state.status === 'loading') return <main className="content-load-state" role="status">{t('正在加载历史内容…')}</main>;
  if (state.status === 'error') return <main className="content-load-state content-load-error" role="alert"><h1>{t('历史内容加载失败')}</h1><p>{readerSafeContentError(state.error, t)}</p></main>;
  return <ContentContext.Provider value={stableValue!}><div className="content-provider" data-content-revision={state.value.revision}>{children}</div></ContentContext.Provider>;
}

function readerSafeContentError(error: Error, t: (key: string) => string) {
  if (/sha-?256|checksum|digest|integrity|byte size|releases\/|core-zh|china-territory|package/i.test(error.message)) {
    return t('历史资料校验失败，请稍后重试或使用当前内置资料。');
  }
  return t('历史资料暂时无法加载，请稍后重试。');
}

async function loadRepository(repository: HistoricalContentRepository | ReleaseSnapshotRepository): Promise<ContentContextValue> {
  if ('open' in repository) {
    const snapshot = await repository.open();
    const entries = await Promise.all(Object.keys(bundledContentCatalog).map(async (name) => [name, await snapshot.getCollection(name)] as const));
    const collections: ContentCollections = Object.fromEntries(entries);
    validateContentCollections(collections);
    if (!isBundledCatalog(collections)) throw new Error('Release snapshot does not provide the complete reader catalog');
    const boundaries = await snapshot.getCollection('boundaries');
    return {
      catalog: collections,
      revision: snapshot.release.releaseId,
      external: true,
      snapshot,
      release: snapshot.release,
      historySource: historySourceFromCatalog(collections, boundaries),
    };
  }

  const legacy = await repository.load();
  const missing = Object.keys(bundledContentCatalog).filter((name) => !Array.isArray(legacy.collections[name]));
  if (missing.length) throw new Error(`Content snapshot is missing collections: ${missing.join(', ')}`);
  validateContentCollections(legacy.collections);
  if (!isBundledCatalog(legacy.collections)) throw new Error('Content snapshot does not provide the complete reader catalog');
  const release = legacyRelease(legacy.manifest.revision);
  const snapshot = new InMemoryHistoricalSnapshot(release, legacy.collections);
  return {
    catalog: legacy.collections,
    revision: legacy.manifest.revision,
    external: true,
    snapshot,
    release,
    historySource: historySourceFromCatalog(legacy.collections, []),
  };
}

function isBundledCatalog(collections: ContentCollections): collections is BundledContentCatalog {
  return Object.keys(bundledContentCatalog).every((name) => Array.isArray(collections[name]));
}

function legacyRelease(revision: string): ReleaseManifest {
  return { ...bundledReleaseManifest, releaseId: /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(revision) ? revision : 'legacy-external' };
}

function historySourceFromCatalog(catalog: BundledContentCatalog, boundaries: readonly unknown[]): HistoricalStateSource {
  const validatedBoundaries = boundaries.filter(isBoundaryState);
  if (validatedBoundaries.length !== boundaries.length) throw new Error('Release boundary collection is malformed');
  return {
    polities: catalog.polities,
    boundaries: validatedBoundaries.map(normalizeBoundaryState),
    events: catalog.events,
    places: catalog.places,
    capitalTerms: catalog.capitalTerms,
    modernSovereignty: catalog.mapReferences,
  };
}

type PublishedBoundaryState = Omit<BoundaryState, 'evidence'> & {
  evidence: Partial<BoundaryEvidence> & Pick<BoundaryEvidence, 'citations' | 'uncertaintyNote'>;
};

const controlTypes = new Set(['direct', 'indirect', 'disputed', 'influence', 'unspecified']);
const confidenceLevels = new Set(['high', 'medium', 'low']);
const evidenceLevels = new Set(['A', 'B', 'C', 'D']);
const boundaryDerivations = new Set([
  'direct-source', 'licensed-digitization', 'nearest-same-polity', 'maximum-record',
  'administrative-synthesis', 'cultural-core', 'control-centers', 'influence-area',
]);
const reviewStatuses = new Set(['pending', 'source-checked', 'cross-checked']);
const mapRepresentations = new Set([
  'direct-boundary', 'licensed-digitization', 'reference-boundary', 'cultural-core',
  'control-centers', 'influence-area', 'maximum-reference',
]);

function isBoundaryState(value: unknown): value is PublishedBoundaryState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const evidence = record.evidence as Record<string, unknown> | undefined;
  const hasInternalEvidence = evidence !== undefined && (
    evidence.evidenceLevel !== undefined || evidence.derivation !== undefined || evidence.reviewStatus !== undefined
  );
  return typeof record.id === 'string'
    && typeof record.polityId === 'string'
    && isFiniteNumber(record.validFrom)
    && isFiniteNumber(record.validTo)
    && isFiniteNumber(record.snapshotYear)
    && isGeoJsonGeometry(record.geometry)
    && controlTypes.has(String(record.controlType))
    && confidenceLevels.has(String(record.confidence))
    && Array.isArray(record.sourceIds) && record.sourceIds.every(item => typeof item === 'string')
    && (record.mapRepresentation === undefined || mapRepresentations.has(String(record.mapRepresentation)))
    && evidence !== undefined && !Array.isArray(evidence)
    && Array.isArray(evidence.citations)
    && typeof evidence.uncertaintyNote === 'string'
    && (!hasInternalEvidence || (
      evidenceLevels.has(String(evidence.evidenceLevel))
      && boundaryDerivations.has(String(evidence.derivation))
      && reviewStatuses.has(String(evidence.reviewStatus))
    ));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPosition(value: unknown): value is GeoJSON.Position {
  return Array.isArray(value) && value.length >= 2 && value.every(isFiniteNumber);
}

function isPositions(value: unknown): value is GeoJSON.Position[] {
  return Array.isArray(value) && value.length > 0 && value.every(isPosition);
}

function isPositionGroups(value: unknown): value is GeoJSON.Position[][] {
  return Array.isArray(value) && value.length > 0 && value.every(isPositions);
}

function isPositionVolumes(value: unknown): value is GeoJSON.Position[][][] {
  return Array.isArray(value) && value.length > 0 && value.every(isPositionGroups);
}

function isGeoJsonGeometry(value: unknown): value is GeoJSON.Geometry {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const geometry = value as Record<string, unknown>;
  if (geometry.type === 'Point') return isPosition(geometry.coordinates);
  if (geometry.type === 'MultiPoint' || geometry.type === 'LineString') return isPositions(geometry.coordinates);
  if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') return isPositionGroups(geometry.coordinates);
  if (geometry.type === 'MultiPolygon') return isPositionVolumes(geometry.coordinates);
  if (geometry.type === 'GeometryCollection') {
    return Array.isArray(geometry.geometries) && geometry.geometries.every(isGeoJsonGeometry);
  }
  return false;
}

function normalizeBoundaryState(boundary: PublishedBoundaryState): BoundaryState {
  const { evidenceLevel: publishedLevel, derivation: publishedDerivation, reviewStatus: publishedReview } = boundary.evidence;
  if (publishedLevel && publishedDerivation && publishedReview) {
    return {
      ...boundary,
      evidence: {
        ...boundary.evidence,
        evidenceLevel: publishedLevel,
        derivation: publishedDerivation,
        reviewStatus: publishedReview,
      },
    };
  }
  const representation = boundary.mapRepresentation ?? 'direct-boundary';
  const evidenceLevel = representation === 'licensed-digitization' ? 'B'
    : representation === 'maximum-reference' || representation === 'reference-boundary' ? 'C'
    : representation === 'control-centers' || representation === 'cultural-core' || representation === 'influence-area' ? 'D'
    : 'A';
  const derivation = representation === 'maximum-reference' ? 'maximum-record'
    : representation === 'reference-boundary' ? 'nearest-same-polity'
    : representation === 'licensed-digitization' ? 'licensed-digitization'
    : representation === 'control-centers' ? 'control-centers'
    : representation === 'cultural-core' ? 'cultural-core'
    : representation === 'influence-area' ? 'influence-area'
    : 'direct-source';
  return {
    ...boundary,
    evidence: {
      ...boundary.evidence,
      evidenceLevel,
      derivation,
      reviewStatus: 'pending',
      citations: boundary.evidence.citations ?? [],
      uncertaintyNote: boundary.evidence.uncertaintyNote ?? '',
    },
  };
}

export function useHistoricalContent() {
  return useContext(ContentContext);
}
