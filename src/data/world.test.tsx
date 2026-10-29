import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import type { ReleaseManifest } from '../content/release-types';
import { CachePackageFiles } from '../offline/cache-package-files';
import { sha256Hex } from '../offline/hash';
import { useWorldSlice } from './world';

const assetUrl = vi.hoisted(() => vi.fn((path:string) => `/chronoatlas/${path}`));
vi.mock('../runtime/asset-url', () => ({ publicAssetUrl: assetUrl }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  assetUrl.mockClear();
});
const chunk = (start:number) => ({ start, end:start+99, polities:[], records:[], geometries:[] });

async function releaseWithWorld(options: {
  releaseId: string;
  start: number;
  body: string;
  uri?: string;
  bytes?: number;
  sha256?: string;
}): Promise<ReleaseManifest> {
  const bytes = new TextEncoder().encode(options.body);
  return {
    releaseId: options.releaseId,
    schemaVersion: '1', minimumAppVersion: '0.1.0', createdAt: '2026-10-29T00:00:00Z',
    channel: 'preview', complianceProfile: 'internal-research',
    packages: [{
      id: `world-${options.start}`, kind: 'world', region: 'world', yearRange: [options.start, options.start + 99],
      required: false, dependencies: [], compressedBytes: bytes.byteLength, recordCount: 0, licenseIds: ['CC-BY-4.0'],
      files: [{
        uri: options.uri ?? `data/world/${options.start}.json`, mediaType: 'application/json',
        sha256: options.sha256 ?? await sha256Hex(bytes), bytes: options.bytes ?? bytes.byteLength,
        collection: `world-${options.start}`, sourceDigest: await sha256Hex(bytes),
      }],
    }],
  };
}

test('selects the world package and immutable file declared by the active release', async () => {
  const body = JSON.stringify(chunk(100));
  const release = await releaseWithWorld({ releaseId: 'release-world-selection', start: 100, body, uri: 'data/world/custom-100.json' });
  const fetcher = vi.fn().mockResolvedValue(new Response(body));
  vi.stubGlobal('fetch', fetcher);

  const { result } = renderHook(() => useWorldSlice(123, true, release));

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(assetUrl).toHaveBeenCalledWith('data/world/custom-100.json');
  expect(fetcher).toHaveBeenCalledWith('/chronoatlas/data/world/custom-100.json', expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

test('rejects a world file whose byte length differs from the active release manifest', async () => {
  const body = JSON.stringify(chunk(200));
  const release = await releaseWithWorld({ releaseId: 'release-world-size', start: 200, body, bytes: new TextEncoder().encode(body).byteLength + 1 });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)));

  const { result } = renderHook(() => useWorldSlice(220, true, release));

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.slice).toBeUndefined();
});

test('rejects a world file whose SHA-256 differs from the active release manifest', async () => {
  const body = JSON.stringify(chunk(300));
  const release = await releaseWithWorld({ releaseId: 'release-world-hash', start: 300, body, sha256: '0'.repeat(64) });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)));

  const { result } = renderHook(() => useWorldSlice(320, true, release));

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.slice).toBeUndefined();
});

test('isolates cached world files by release id and URI', async () => {
  const firstBody = JSON.stringify({ ...chunk(400), polities: [{ id: 'first-release' }] });
  const secondBody = JSON.stringify({ ...chunk(400), polities: [{ id: 'second-release' }] });
  const firstRelease = await releaseWithWorld({ releaseId: 'release-world-a', start: 400, body: firstBody });
  const secondRelease = await releaseWithWorld({ releaseId: 'release-world-b', start: 400, body: secondBody });
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response(firstBody))
    .mockResolvedValueOnce(new Response(secondBody));
  vi.stubGlobal('fetch', fetcher);
  const first = renderHook(() => useWorldSlice(420, true, firstRelease));
  await waitFor(() => expect(first.result.current.status).toBe('ready'));
  first.unmount();

  const second = renderHook(() => useWorldSlice(420, true, secondRelease));

  await waitFor(() => expect(second.result.current.status).toBe('ready'));
  expect(second.result.current.slice?.polities[0]?.id).toBe('second-release');
  expect(fetcher).toHaveBeenCalledTimes(2);
});

test('includes the declared SHA-256 in the in-memory cache identity', async () => {
  const firstBody = JSON.stringify({ ...chunk(600), polities: [{ id: 'first-hash' }] });
  const secondBody = JSON.stringify({ ...chunk(600), polities: [{ id: 'second-hash' }] });
  const firstRelease = await releaseWithWorld({ releaseId: 'same-release-id', start: 600, body: firstBody });
  const secondRelease = await releaseWithWorld({ releaseId: 'same-release-id', start: 600, body: secondBody });
  const fetcher = vi.fn().mockResolvedValueOnce(new Response(firstBody)).mockResolvedValueOnce(new Response(secondBody));
  vi.stubGlobal('fetch', fetcher);
  const first = renderHook(() => useWorldSlice(620, true, firstRelease));
  await waitFor(() => expect(first.result.current.status).toBe('ready'));
  first.unmount();

  const second = renderHook(() => useWorldSlice(620, true, secondRelease));
  await waitFor(() => expect(second.result.current.status).toBe('ready'));

  expect(second.result.current.slice?.polities[0]?.id).toBe('second-hash');
  expect(fetcher).toHaveBeenCalledTimes(2);
});

test('loads an installed release-owned world slice before using the network', async () => {
  const body = JSON.stringify(chunk(700));
  const release = await releaseWithWorld({
    releaseId: 'installed-world-release', start: 700, body,
    uri: 'releases/installed-world-release/world-ce-700.json',
  });
  vi.stubGlobal('caches', {});
  const installed = vi.spyOn(CachePackageFiles.prototype, 'read')
    .mockResolvedValue(new TextEncoder().encode(body));
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);

  const { result } = renderHook(() => useWorldSlice(720, true, release));
  await waitFor(() => expect(result.current.status).toBe('ready'));

  expect(installed).toHaveBeenCalledWith('installed-world-release', 'world-700', 'releases/installed-world-release/world-ce-700.json');
  expect(fetcher).not.toHaveBeenCalled();
});

test('reports unavailable when the active release has no world package for the year', async () => {
  const body = JSON.stringify(chunk(500));
  const release = await releaseWithWorld({ releaseId: 'release-world-gap', start: 500, body });
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);

  const { result } = renderHook(() => useWorldSlice(777, true, release));

  expect(result.current.status).toBe('unavailable');
  expect(fetcher).not.toHaveBeenCalled();
});

test('loads world chunks beneath the configured site base', async () => {
  const fetcher = vi.fn().mockResolvedValue({ok:true,json:async()=>chunk(-200)});
  vi.stubGlobal('fetch', fetcher);

  const {result} = renderHook(() => useWorldSlice(-200, true));

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(assetUrl).toHaveBeenCalledWith('data/world/-200.json');
  expect(fetcher).toHaveBeenCalledWith(
    '/chronoatlas/data/world/-200.json',
    expect.objectContaining({signal: expect.any(AbortSignal)}),
  );
});
test('a slow previous century cannot replace the requested world data', async () => {
  let finishOld!: (value:unknown)=>void;
  vi.stubGlobal('fetch', vi.fn((url:string) => url.endsWith('/800.json')
    ? new Promise(resolve => { finishOld = resolve; })
    : Promise.resolve({ok:true,json:async()=>chunk(900)})));
  const {result, rerender} = renderHook(({year})=>useWorldSlice(year,true),{initialProps:{year:800}});
  rerender({year:900});
  await waitFor(()=>expect(result.current.slice?.start).toBe(900));
  await act(async()=>finishOld({ok:true,json:async()=>chunk(800)}));
  expect(result.current.slice?.start).toBe(900);
});

test('errors are visible and retry loads only the requested year', async () => {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce({ok:false,status:503})
    .mockResolvedValueOnce({ok:true,json:async()=>chunk(1200)}));
  const {result}=renderHook(()=>useWorldSlice(1230,true));
  await waitFor(()=>expect(result.current.status).toBe('error'));
  act(()=>result.current.retry());
  await waitFor(()=>expect(result.current.slice?.start).toBe(1200));
});

test('no requests are made for disabled or out-of-coverage world years', () => {
  const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
  const {result,rerender}=renderHook(({year,enabled})=>useWorldSlice(year,enabled),{initialProps:{year:1000,enabled:false}});
  expect(result.current.slice).toBeUndefined();
  rerender({year:2026,enabled:true});
  expect(result.current.status).toBe('unavailable');
  expect(fetcher).not.toHaveBeenCalled();
});

test('obsolete or disabled world requests are aborted instead of accumulating during a rapid scrub', () => {
  const signals:AbortSignal[]=[];
  vi.stubGlobal('fetch',vi.fn((_url:string,options?:RequestInit)=>{if(options?.signal)signals.push(options.signal);return new Promise(()=>{});}));
  const {rerender}=renderHook(({year,enabled})=>useWorldSlice(year,enabled),{initialProps:{year:1300,enabled:true}});
  for(const year of [1400,1500,1600,1700,1300]) rerender({year,enabled:true});
  expect(signals).toHaveLength(6);
  expect(signals.slice(0,-1).every(s=>s.aborted)).toBe(true);
  expect(signals.at(-1)?.aborted).toBe(false);
  rerender({year:1300,enabled:false});
  expect(signals.at(-1)?.aborted).toBe(true);
});

test('shared pending requests survive one consumer but abort after the last leaves',()=>{
  const signals:AbortSignal[]=[];
  const fetcher=vi.fn((_url:string,options?:RequestInit)=>{if(options?.signal)signals.push(options.signal);return new Promise(()=>{});});
  vi.stubGlobal('fetch',fetcher);
  const first=renderHook(()=>useWorldSlice(1800,true));
  const second=renderHook(()=>useWorldSlice(1801,true));
  expect(fetcher).toHaveBeenCalledOnce();
  first.unmount();
  expect(signals[0]?.aborted).toBe(false);
  second.unmount();
  expect(signals[0]?.aborted).toBe(true);
});
