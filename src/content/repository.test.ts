import { describe, expect, it, vi } from 'vitest';
import { InMemoryContentRepository, ManifestContentRepository, type ContentManifest } from './repository';
import { bundledContentRepository } from './bundled-content';

describe('historical content repositories', () => {
  it('keeps bundled content behind the same repository boundary used by future stores', async () => {
    const manifest: ContentManifest = {
      schemaVersion: 1,
      revision: 'test-revision',
      collections: { people: 'memory://people' },
      media: [],
    };
    const person = { id: 'li-shimin', name: '李世民', description: '唐太宗', sourceIds: ['source-1'] };
    const repository = new InMemoryContentRepository(manifest, { people: [person] });

    const snapshot = await repository.load();

    expect(snapshot.manifest.revision).toBe('test-revision');
    expect(snapshot.collections.people).toEqual([person]);
  });

  it('loads collection files from a manifest while leaving media in object storage', async () => {
    const manifest: ContentManifest = {
      schemaVersion: 1,
      revision: '2026-10-24',
      collections: {
        people: 'collections/people.json',
        events: 'collections/events.json',
      },
      media: [{
        id: 'daming-palace-aerial',
        kind: 'image',
        uri: 'https://media.example.test/daming-palace.webp',
        mimeType: 'image/webp',
        alt: '大明宫遗址航拍',
      }],
    };
    const responses: Record<string, unknown> = {
      '/content/manifest.json': manifest,
      '/content/collections/people.json': [{ id: 'li-shimin', name: '李世民', description: '唐太宗', sourceIds: ['source-1'] }],
      '/content/collections/events.json': [{ id: 'xuanwu-gate', title: '玄武门之变', year: 626, summary: '唐初政治事件', sourceIds: ['source-1'] }],
    };
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return new Response(JSON.stringify(responses[url]), { status: responses[url] ? 200 : 404 });
    });

    const snapshot = await new ManifestContentRepository('/content/manifest.json', fetcher).load();

    expect(snapshot.collections.people).toEqual([{ id: 'li-shimin', name: '李世民', description: '唐太宗', sourceIds: ['source-1'] }]);
    expect(snapshot.collections.events).toEqual([{ id: 'xuanwu-gate', title: '玄武门之变', year: 626, summary: '唐初政治事件', sourceIds: ['source-1'] }]);
    expect(snapshot.manifest.media[0].uri).toBe('https://media.example.test/daming-palace.webp');
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('rejects unsupported manifests before content is displayed', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ schemaVersion: 2, revision: 'future', collections: {}, media: [] })));

    await expect(new ManifestContentRepository('/content/manifest.json', fetcher).load())
      .rejects.toThrow('Unsupported content schema version');
  });

  it('rejects malformed media and duplicate collection identities atomically', async () => {
    const malformedManifest = {
      schemaVersion: 1,
      revision: 'bad-media',
      collections: {},
      media: [{ id: 'asset-1', kind: 'executable', uri: '/asset.bin', mimeType: 'invalid' }],
    } as unknown as ContentManifest;
    await expect(new InMemoryContentRepository(malformedManifest, {}).load()).rejects.toThrow('MIME type');

    const manifest: ContentManifest = { schemaVersion: 1, revision: 'duplicates', collections: { people: 'memory://people' }, media: [] };
    await expect(new InMemoryContentRepository(manifest, { people: [
      { id: 'same', name: '甲', description: '甲', sourceIds: [] },
      { id: 'same', name: '乙', description: '乙', sourceIds: [] },
    ] }).load())
      .rejects.toThrow('Duplicate content collection identity');
  });

  it('rejects malformed domain fields before casting a collection snapshot', async () => {
    const manifest: ContentManifest = { schemaVersion: 1, revision: 'bad-event', collections: { events: 'memory://events' }, media: [] };
    await expect(new InMemoryContentRepository(manifest, {
      events: [{ id: 'bad', title: '错误事件', year: 'not-a-year', summary: '错误', sourceIds: [] }],
    }).load()).rejects.toThrow('events[0].year must be a finite number');

    await expect(new InMemoryContentRepository(manifest, {
      events: [{ id: 'bad-reference', title: '错误引用', year: 626, summary: '错误', sourceIds: [], references: 'not-an-array' }],
    }).load()).rejects.toThrow('events[0].references must be an array');
  });

  it('publishes the existing in-code catalogs through the repository boundary during migration', async () => {
    const snapshot = await bundledContentRepository.load();

    expect(snapshot.collections.polities.length).toBeGreaterThan(0);
    expect(snapshot.collections.places.length).toBeGreaterThan(0);
    expect(snapshot.collections.people.length).toBeGreaterThan(0);
    expect(snapshot.collections.events.length).toBeGreaterThan(0);
    expect(snapshot.collections.claims.length).toBeGreaterThan(0);
    expect(snapshot.collections.heritage.length).toBeGreaterThan(0);
  });
});
