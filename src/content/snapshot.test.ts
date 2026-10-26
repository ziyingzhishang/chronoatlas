import { describe, expect, it, vi } from 'vitest';
import { HistoricalDataRepository } from './repository';

const json = (value: unknown) => `${JSON.stringify(value)}\n`;
const file = (uri: string, collection: string, text: string, sha256: string) => ({
  uri,
  mediaType: 'application/json',
  sha256,
  bytes: new TextEncoder().encode(text).byteLength,
  collection,
  sourceDigest: sha256,
});

function fixture() {
  const coreText = json({
    polities: [{ id: 'release-polity', name: '版本政权', startYear: 1, endYear: 10 }],
    events: [{ id: 'release-event', title: '版本事件', year: 5, summary: '摘要' }],
    places: [], people: [], claims: [], heritage: [], capitalTerms: [], personDetails: [],
    eventDetails: [], heritageDetails: [], polityDetails: [], sources: [], eventTimeReviews: [], studyEvents: [],
  });
  const territoryText = json({
    boundaries: [{ id: 'boundary-a', polityId: 'release-polity', validFrom: 1, validTo: 10 }],
    coverageConclusions: [{ polityId: 'release-polity', from: 1, to: 10, representation: 'direct-boundary', sourceIds: [] }],
  });
  const manifest = {
    releaseId: 'release-a', schemaVersion: '1', minimumAppVersion: '0.1.0',
    createdAt: '2026-10-26T00:00:00Z', channel: 'preview', complianceProfile: 'internal-research',
    packages: [
      { id: 'core-zh', kind: 'content', required: true, dependencies: [], compressedBytes: new TextEncoder().encode(coreText).byteLength, recordCount: 2, licenseIds: ['MIT'], files: [file('releases/release-a/core-zh.json', 'core-zh', coreText, 'd98f786abf486a636a1d27ceb79d9f1ff5e9b4aa03d035c1af2e994f1d2ff8d8')] },
      { id: 'china-territory', kind: 'territory', region: 'china', yearRange: [1, 10], required: true, dependencies: ['core-zh'], compressedBytes: new TextEncoder().encode(territoryText).byteLength, recordCount: 2, licenseIds: ['MIT'], files: [file('releases/release-a/china-territory.json', 'china-territory', territoryText, '440353de579e96c9715f6d012b05ca4d8fa3afb39f02d6798f234fd36028c594')] },
    ],
  };
  return { coreText, territoryText, manifest };
}

function fixtureFetcher(overrides: Record<string, Response> = {}) {
  const { coreText, territoryText, manifest } = fixture();
  const responses: Record<string, Response> = {
    '/releases/latest.json': new Response(json({ releaseId: 'release-a' })),
    '/releases/release-a/manifest.json': new Response(json(manifest)),
    '/releases/release-a/core-zh.json': new Response(coreText),
    '/releases/release-a/china-territory.json': new Response(territoryText),
    ...overrides,
  };
  return vi.fn(async (input: RequestInfo | URL) => responses[String(input)]?.clone() ?? new Response('', { status: 404 }));
}

describe('HistoricalDataRepository', () => {
  it('locks one release and never refetches latest during snapshot queries', async () => {
    const fetcher = fixtureFetcher();
    const snapshot = await new HistoricalDataRepository({ fetcher, baseUrl: '/' }).open();

    expect(snapshot.release.releaseId).toBe('release-a');
    expect((await snapshot.queryPolitiesAt(5))[0]).toMatchObject({ id: 'release-polity' });
    expect((await snapshot.queryPolitiesAt(5))[0]).toMatchObject({ id: 'release-polity' });
    expect(fetcher.mock.calls.filter(([url]) => String(url) === '/releases/latest.json')).toHaveLength(1);
    expect(fetcher.mock.calls.filter(([url]) => String(url) === '/releases/release-a/core-zh.json')).toHaveLength(1);
  });

  it('opens an explicit release without consulting the mutable pointer and rejects year zero', async () => {
    const fetcher = fixtureFetcher();
    const snapshot = await new HistoricalDataRepository({ fetcher, baseUrl: '/' }).open('release-a');

    expect(fetcher).not.toHaveBeenCalledWith('/releases/latest.json');
    await expect(snapshot.queryPolitiesAt(0)).rejects.toThrow(/year 0/i);
  });

  it('fails closed for unsupported manifests and collection load failures', async () => {
    const unsupported = fixture();
    unsupported.manifest.schemaVersion = '2';
    const badManifestFetcher = fixtureFetcher({
      '/releases/release-a/manifest.json': new Response(json(unsupported.manifest)),
    });
    await expect(new HistoricalDataRepository({ fetcher: badManifestFetcher, baseUrl: '/' }).open('release-a'))
      .rejects.toThrow(/schema|invalid/i);

    const missingCoreFetcher = fixtureFetcher({
      '/releases/release-a/core-zh.json': new Response('', { status: 503 }),
    });
    const snapshot = await new HistoricalDataRepository({ fetcher: missingCoreFetcher, baseUrl: '/' }).open('release-a');
    await expect(snapshot.search('版本')).rejects.toThrow(/core-zh|503/i);
    await expect(snapshot.getEntity('release-polity')).rejects.toThrow(/core-zh|503/i);
  });
});
