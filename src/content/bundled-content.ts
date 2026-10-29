import { bundledAuthoringSnapshot, bundledHistoricalStateSource, bundledPublicCollections } from './bundled-adapter';
import { InMemoryContentRepository, type ContentManifest } from './repository';
import { InMemoryHistoricalSnapshot } from './snapshot';
import type { ReleaseManifest } from './release-types';

/**
 * Transitional typed catalog for the current build. UI and domain code can move
 * to this boundary before the backing data moves out of TypeScript modules.
 */
export const bundledContentCatalog = bundledPublicCollections;

export type BundledContentCatalog = typeof bundledContentCatalog;

export const bundledContentManifest: ContentManifest = {
  schemaVersion: 1,
  revision: 'bundled-2026-10-24',
  collections: Object.fromEntries(Object.keys(bundledContentCatalog).map((name) => [name, `memory://${name}`])),
  media: [],
};

export const bundledContentRepository = new InMemoryContentRepository(
  bundledContentManifest,
  bundledContentCatalog,
);

export const bundledReleaseManifest = {
  releaseId: bundledContentManifest.revision,
  schemaVersion: '1',
  minimumAppVersion: '0.1.0',
  createdAt: '2026-10-24T00:00:00Z',
  channel: 'preview',
  complianceProfile: 'internal-research',
  packages: [{
    id: 'core-zh', kind: 'content', required: true, dependencies: [], compressedBytes: 0,
    recordCount: Object.values(bundledContentCatalog).reduce((count, records) => count + records.length, 0),
    licenseIds: ['MIT'],
    files: [{
      uri: 'data/bundled-content.json', mediaType: 'application/json', sha256: '0'.repeat(64),
      bytes: 0, collection: 'core-zh', sourceDigest: '0'.repeat(64),
    }],
  }, ...bundledAuthoringSnapshot.worldChunks.map((chunk) => ({
    id: `world-${chunk.start < 0 ? `bce-${Math.abs(chunk.start)}` : `ce-${chunk.start}`}`,
    kind: 'world' as const,
    region: 'world',
    yearRange: [chunk.start, chunk.end] as [number, number],
    required: false,
    dependencies: ['core-zh'],
    compressedBytes: chunk.bytes,
    recordCount: chunk.records,
    licenseIds: ['CC-BY-4.0'],
    files: [{
      uri: `data/world/${chunk.filename}`,
      mediaType: 'application/json',
      sha256: chunk.sha256,
      bytes: chunk.bytes,
      collection: `world-${chunk.start}`,
      sourceDigest: chunk.sha256,
    }],
  }))],
} satisfies ReleaseManifest;

const coverageConclusions = bundledAuthoringSnapshot.territory.coverageDecisions.map((decision) => ({
  polityId: decision.polityId,
  from: decision.from,
  to: decision.to,
  representation: decision.verdict === 'leave-unfilled' ? 'leave-unfilled'
    : decision.verdict === 'cultural-core' ? 'cultural-core'
    : decision.verdict === 'control-centers' ? 'control-centers'
    : 'direct-boundary',
  sourceIds: decision.citationIds,
  geometryIds: decision.verdict === 'leave-unfilled' ? [] : decision.sourceBoundaryIds,
}));

export const bundledHistoricalSnapshot = new InMemoryHistoricalSnapshot(
  bundledReleaseManifest,
  bundledContentCatalog,
  { boundaries: bundledAuthoringSnapshot.territory.boundaries, coverageConclusions },
);

export { bundledHistoricalStateSource };
