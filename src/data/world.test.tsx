import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useWorldSlice } from './world';

const assetUrl = vi.hoisted(() => vi.fn((path:string) => `/chronoatlas/${path}`));
vi.mock('../runtime/asset-url', () => ({ publicAssetUrl: assetUrl }));

afterEach(() => {
  vi.unstubAllGlobals();
  assetUrl.mockClear();
});
const chunk = (start:number) => ({ start, end:start+99, polities:[], records:[], geometries:[] });

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
