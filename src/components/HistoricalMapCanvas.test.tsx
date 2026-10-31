import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { setWorkerUrl } from 'maplibre-gl';
import { expect, test, vi } from 'vitest';
import { HistoricalMapCanvas, type MapHandle } from './HistoricalMapCanvas';
import { getHistoricalState } from '../domain/history-state';
import { allLayers } from '../map/history-map';
import { mapInstances } from '../test/maplibre-mock';

const props = () => ({ state: getHistoricalState(800), selectedEntity: undefined, refreshToken:0,
  visibleLayers: new Set(allLayers), basemap: 'relief' as const,
  projection: 'mercator' as const,
  onSelectEntity: vi.fn(), onCameraChange: vi.fn(), onRenderedYearChange:vi.fn() });

test('switches projection on the existing map without recreating it', () => {
  const initial = props();
  const { rerender } = render(<HistoricalMapCanvas {...initial} />);
  const map = mapInstances.at(-1)!;
  act(() => map.emit('style.load'));
  map.setProjection.mockClear();

  rerender(<HistoricalMapCanvas {...initial} projection="globe" />);

  expect(mapInstances.at(-1)).toBe(map);
  expect(map.setProjection).toHaveBeenCalledWith({ type: 'globe' });
  expect(map.remove).not.toHaveBeenCalled();
});

test('satellite enhances territory fill and restores relief styling without replacing the map', () => {
  const initial=props();
  const {rerender}=render(<HistoricalMapCanvas {...initial}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  map.setPaintProperty.mockClear();
  rerender(<HistoricalMapCanvas {...initial} basemap="satellite"/>);
  const satellite=map.setPaintProperty.mock.calls.find(c=>c[0]==='boundary-fill'&&c[1]==='fill-opacity')?.[2];
  expect(satellite).toEqual(['case',['==',['get','maximum'],true],0.14,['match',['get','confidence'],'high',0.5,'medium',0.42,0.34]]);
  map.setPaintProperty.mockClear();
  rerender(<HistoricalMapCanvas {...initial}/>);
  expect(map.setPaintProperty).toHaveBeenCalledWith('boundary-fill','fill-opacity',['get','opacity']);
  expect(map.remove).not.toHaveBeenCalled();
  expect(map.flyTo).not.toHaveBeenCalled();
});

test('the map receives a bundled worker asset instead of inferring a path inside Vite dependencies',()=>{
  render(<HistoricalMapCanvas {...props()}/>);
  expect(setWorkerUrl).toHaveBeenCalledWith(expect.stringContaining('maplibre-gl-worker'));
});

test('defers resize work while a docked time panel is being dragged and resizes once afterward',async()=>{
  const initial=props();
  const {rerender}=render(<HistoricalMapCanvas {...initial} deferResize/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  map.resize.mockClear();
  rerender(<HistoricalMapCanvas {...initial} deferResize/>);
  expect(map.resize).not.toHaveBeenCalled();
  rerender(<HistoricalMapCanvas {...initial} deferResize={false}/>);
  await waitFor(()=>expect(map.resize).toHaveBeenCalledOnce());
  expect(mapInstances.at(-1)).toBe(map);
});

test('a worker startup failure is visible and retry recreates the renderer',async()=>{
  render(<HistoricalMapCanvas {...props()}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('error',{error:new Error('Worker failed to load. Check that the worker URL is correct.')}));
  expect(screen.getByRole('status')).toHaveTextContent('地图渲染未能启动');
  await userEvent.click(screen.getByRole('button',{name:'重试'}));
  expect(map.remove).toHaveBeenCalledOnce();
  expect(mapInstances.at(-1)).not.toBe(map);
});

test('switching year, texture and layers updates the same map without moving the camera', async () => {
  const initial = props();
  const { rerender, unmount } = render(<HistoricalMapCanvas {...initial} />);
  const map = mapInstances.at(-1)!;
  const count = mapInstances.length;
  act(() => map.emit('style.load'));
  rerender(<HistoricalMapCanvas {...initial} state={getHistoricalState(1100)} basemap="satellite" visibleLayers={new Set(['boundaries'])} />);
  expect(mapInstances).toHaveLength(count);
  expect(map.setLayoutProperty).toHaveBeenCalledWith('relief-raster', 'visibility', 'none');
  expect(map.setLayoutProperty).toHaveBeenCalledWith('satellite-raster', 'visibility', 'visible');
  expect(map.setLayoutProperty).toHaveBeenCalledWith('place-names', 'visibility', 'none');
  await waitFor(() => expect(map.getSource('boundaries')!.setData.mock.lastCall![0].features.some((f: GeoJSON.Feature) => f.properties?.polityId === 'song_northern')).toBe(true));
  const latest = map.getSource('boundaries')!.setData.mock.lastCall![0];
  expect(latest.features.some((f: GeoJSON.Feature) => f.properties?.polityId === 'song_northern')).toBe(true);
  expect(latest.features.some((f: GeoJSON.Feature) => f.properties?.polityId === 'tang')).toBe(false);
  expect(map.flyTo).not.toHaveBeenCalled();
  expect(map.easeTo).not.toHaveBeenCalled();
  unmount();
  expect(map.remove).toHaveBeenCalledOnce();
});

test('submits local boundaries before deferring an independently replaceable world boundary source',async()=>{
  const state=getHistoricalState(800);
  const localPolity=state.activePolities[0];
  const localBoundary=state.boundaries.find(boundary=>boundary.polityId===localPolity.id)!;
  state.activePolities.push({...localPolity,id:'world-test',region:'world'});
  state.boundaries.push({...localBoundary,id:'world-boundary',polityId:'world-test'});
  render(<HistoricalMapCanvas {...props()} state={state}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  const local=map.getSource('boundaries')!.setData.mock.lastCall![0];
  expect(local.features.some((feature:GeoJSON.Feature)=>feature.properties?.polityId==='world-test')).toBe(false);
  expect(map.getSource('worldBoundaries')!.setData).not.toHaveBeenCalled();
  await waitFor(()=>expect(map.getSource('worldBoundaries')!.setData.mock.lastCall![0].features).toHaveLength(1));
  const world=map.getSource('worldBoundaries')!.setData.mock.lastCall![0];
  expect(world.features.map((feature:GeoJSON.Feature)=>feature.properties?.polityId)).toEqual(['world-test']);
  expect(map.getSource('boundaries')!.setData.mock.invocationCallOrder[0])
    .toBeLessThan(map.getSource('worldBoundaries')!.setData.mock.invocationCallOrder[0]);
});

test('keeps the last rendered world layer visible until the latest historical revision is ready',async()=>{
  const withWorld=(id:string)=>{
    const state=getHistoricalState(800);
    const localPolity=state.activePolities[0];
    const localBoundary=state.boundaries.find(boundary=>boundary.polityId===localPolity.id)!;
    state.activePolities.push({...localPolity,id,region:'world'});
    state.boundaries.push({...localBoundary,id:`boundary-${id}`,polityId:id});
    return state;
  };
  const first=withWorld('world-first');
  const {rerender}=render(<HistoricalMapCanvas {...props()} state={first}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  await waitFor(()=>expect(map.getSource('worldBoundaries')!.setData.mock.lastCall![0].features).toHaveLength(1));
  const oldData=map.getSource('worldBoundaries')!.setData.mock.lastCall![0];
  const second=withWorld('world-second');
  map.getSource('worldBoundaries')!.setData.mockClear();
  rerender(<HistoricalMapCanvas {...props()} state={second}/>);
  await waitFor(()=>expect(map.getSource('worldBoundaries')!.setData.mock.lastCall![0].features[0].properties?.polityId).toBe('world-second'));
  expect(map.getSource('worldBoundaries')!.setData.mock.calls.some(([data])=>data.features.length===0)).toBe(false);
  expect(oldData.features[0].properties?.polityId).toBe('world-first');
});

test('preserves the last world geometry during a cross-century data load and clears it after a local-only state commits',async()=>{
  const withWorld=getHistoricalState(800);
  const localPolity=withWorld.activePolities[0];
  const localBoundary=withWorld.boundaries.find(boundary=>boundary.polityId===localPolity.id)!;
  withWorld.activePolities.push({...localPolity,id:'world-held',region:'world'});
  withWorld.boundaries.push({...localBoundary,id:'boundary-world-held',polityId:'world-held'});
  const {rerender}=render(<HistoricalMapCanvas {...props()} state={withWorld}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  await waitFor(()=>expect(map.getSource('worldBoundaries')!.setData.mock.lastCall![0].features).toHaveLength(1));
  const worldSource=map.getSource('worldBoundaries')!.setData;
  const localSource=map.getSource('boundaries')!.setData;
  worldSource.mockClear();
  localSource.mockClear();
  const localOnly=getHistoricalState(900);
  rerender(<HistoricalMapCanvas {...props()} state={localOnly} worldDataPending/>);
  await waitFor(()=>expect(localSource).toHaveBeenCalled());
  expect(worldSource).not.toHaveBeenCalled();
  rerender(<HistoricalMapCanvas {...props()} state={localOnly} worldDataPending={false}/>);
  await waitFor(()=>expect(worldSource.mock.lastCall![0].features).toEqual([]));
});

test('clears stale world boundaries when the next selected year has no world slice',async()=>{
  const withWorld=getHistoricalState(800);
  const localPolity=withWorld.activePolities[0];
  const localBoundary=withWorld.boundaries.find(boundary=>boundary.polityId===localPolity.id)!;
  withWorld.activePolities.push({...localPolity,id:'world-test',region:'world'});
  withWorld.boundaries.push({...localBoundary,id:'world-boundary',polityId:'world-test'});
  const initial={...props(),state:withWorld};
  const {rerender}=render(<HistoricalMapCanvas {...initial}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  await waitFor(()=>expect(map.getSource('worldBoundaries')!.setData.mock.lastCall![0].features).toHaveLength(1));
  rerender(<HistoricalMapCanvas {...initial} state={getHistoricalState(1100)} refreshToken={1}/>);
  expect(map.getSource('worldBoundaries')!.setData.mock.lastCall![0].features).toEqual([]);
});

test('a year changed during initialization is the one rendered when the style becomes ready', () => {
  const initial = props();
  const { rerender } = render(<HistoricalMapCanvas {...initial} />);
  const map = mapInstances.at(-1)!;
  rerender(<HistoricalMapCanvas {...initial} state={getHistoricalState(1100)} basemap="satellite" />);
  act(() => map.emit('style.load'));
  const first = map.getSource('boundaries')!.setData.mock.calls[0][0];
  expect(first.features.some((f: GeoJSON.Feature) => f.properties?.polityId === 'song_northern')).toBe(true);
  expect(map.setLayoutProperty).toHaveBeenCalledWith('satellite-raster', 'visibility', 'visible');
});

test('a final refresh token flushes the selected year even when its state object is unchanged',()=>{
  const initial=props();
  const {rerender}=render(<HistoricalMapCanvas {...initial}/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  map.getSource('boundaries')!.setData.mockClear();
  initial.onRenderedYearChange.mockClear();
  rerender(<HistoricalMapCanvas {...initial} refreshToken={1}/>);
  expect(map.getSource('boundaries')!.setData).toHaveBeenCalledOnce();
  expect(initial.onRenderedYearChange).toHaveBeenLastCalledWith(800);
});

test('a tile failure keeps history and offers a retry of the active basemap', async () => {
  render(<HistoricalMapCanvas {...props()} />);
  const map = mapInstances.at(-1)!;
  act(() => { map.emit('style.load'); map.emit('error', { sourceId: 'relief' }); });
  expect(screen.getByText(/历史图层仍可阅读/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '重试' }));
  expect(map.getSource('relief')!.setTiles).toHaveBeenCalledOnce();
  expect(map.remove).not.toHaveBeenCalled();
  act(() => map.emit('sourcedata', { sourceId: 'relief', isSourceLoaded: true }));
  expect(screen.queryByRole('button', { name: '重试' })).not.toBeInTheDocument();
});

test('camera controls rotate relative to current bearing, reset north, and focus a real place', () => {
  const ref = createRef<MapHandle>();
  render(<HistoricalMapCanvas ref={ref} {...props()} />);
  const map = mapInstances.at(-1)!;
  ref.current!.perform('rotateRight');
  expect(map.rotateTo).toHaveBeenCalledWith(60, expect.anything());
  ref.current!.perform('north');
  expect(map.resetNorthPitch).toHaveBeenCalledOnce();
  ref.current!.focus({ type: 'place', id: 'changan' });
  expect(map.flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [108.94, 34.34], zoom: 5.5 }));
});

test('focus keeps one reversible camera checkpoint', () => {
  const ref = createRef<MapHandle>();
  const onCameraHistoryChange = vi.fn();
  render(<HistoricalMapCanvas ref={ref} {...props()} onCameraHistoryChange={onCameraHistoryChange} />);
  const map = mapInstances.at(-1)!;

  ref.current!.focus({ type: 'place', id: 'changan' });
  expect(onCameraHistoryChange).toHaveBeenLastCalledWith(true);

  ref.current!.restorePrevious();
  expect(map.flyTo).toHaveBeenLastCalledWith(expect.objectContaining({ center: [105, 35], zoom: 4.3 }));
  expect(onCameraHistoryChange).toHaveBeenLastCalledWith(false);
});

test('explicit event locations can be focused without assigning unlocated events a place',()=>{
  const ref=createRef<MapHandle>();
  const state=getHistoricalState(800);
  state.events=[{id:'located',year:800,title:'事件',summary:'',sourceIds:[],coordinates:[10,20],locationPrecision:'approximate'}];
  render(<HistoricalMapCanvas ref={ref} {...props()} state={state}/>);
  ref.current!.focus({type:'event',id:'located'});
  expect(mapInstances.at(-1)!.flyTo).toHaveBeenCalledWith(expect.objectContaining({center:[10,20]}));
});

test('focusing a polity uses its current polygon rather than a stale place center', () => {
  const ref=createRef<MapHandle>();
  const state=getHistoricalState(250);
  state.boundaries=[{...state.boundaries[0],polityId:'test-polity',geometry:{type:'Polygon',coordinates:[[[10,20],[30,20],[30,40],[10,40],[10,20]]]}}];
  render(<HistoricalMapCanvas ref={ref} {...props()} state={state}/>);
  ref.current!.focus({type:'polity',id:'test-polity'});
  expect(mapInstances.at(-1)!.fitBounds).toHaveBeenCalledWith([[10,20],[30,40]],expect.objectContaining({maxZoom:6}));
});

test('selected maximum outlines remain dashed instead of acquiring a solid highlight', () => {
  render(<HistoricalMapCanvas {...props()} state={getHistoricalState(-221)} selectedEntity={{type:'polity',id:'qin'}} />);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  expect(map.setFilter).toHaveBeenCalledWith('boundary-selected',['all',['==',['get','evidenceLevel'],'A'],['in',['get','controlType'],['literal',['direct','unspecified']]],['==',['get','entityId'],'qin']]);
  expect(map.setFilter).toHaveBeenCalledWith('boundary-digitized-selected',['all',['==',['get','evidenceLevel'],'B'],['==',['get','entityId'],'qin']]);
  expect(map.setFilter).toHaveBeenCalledWith('boundary-indirect-selected',['all',['!=',['get','maximum'],true],['==',['get','controlType'],'indirect'],['==',['get','entityId'],'qin']]);
  expect(map.setFilter).toHaveBeenCalledWith('boundary-disputed-selected',['all',['!=',['get','maximum'],true],['==',['get','controlType'],'disputed'],['==',['get','entityId'],'qin']]);
  expect(map.setFilter).toHaveBeenCalledWith('boundary-influence-selected',['all',['!=',['get','maximum'],true],['==',['get','controlType'],'influence'],['==',['get','entityId'],'qin']]);
  expect(map.setFilter).toHaveBeenCalledWith('boundary-maximum-selected',['all',['==',['get','evidenceLevel'],'C'],['==',['get','entityId'],'qin']]);
});

test('focusing across the date line uses the short wrapped longitude interval', () => {
  const ref=createRef<MapHandle>();
  const state=getHistoricalState(250);
  state.boundaries=[{...state.boundaries[0],polityId:'islands',geometry:{type:'MultiPolygon',coordinates:[[[[175,10],[179,10],[179,15],[175,15],[175,10]]],[[[-179,12],[-175,12],[-175,18],[-179,18],[-179,12]]]]}}];
  render(<HistoricalMapCanvas ref={ref} {...props()} state={state}/>);
  ref.current!.focus({type:'polity',id:'islands'});
  expect(mapInstances.at(-1)!.fitBounds).toHaveBeenCalledWith([[175,10],[185,18]],expect.anything());
});

test('recreating a lost graphics context waits for its own style before syncing a new year', async () => {
  const initial = props();
  const { rerender } = render(<HistoricalMapCanvas {...initial} />);
  const oldMap = mapInstances.at(-1)!;
  act(() => oldMap.emit('style.load'));
  initial.onRenderedYearChange.mockClear();
  act(() => oldMap.canvas.dispatchEvent(new Event('webglcontextlost')));
  await userEvent.click(screen.getByRole('button', { name: '重试' }));
  expect(initial.onRenderedYearChange).toHaveBeenCalledWith(undefined);
  const newMap = mapInstances.at(-1)!;
  expect(newMap).not.toBe(oldMap);
  expect(oldMap.remove).toHaveBeenCalledOnce();
  rerender(<HistoricalMapCanvas {...initial} state={getHistoricalState(1100)} />);
  expect(newMap.getSource('boundaries')).toBeUndefined();
  act(() => newMap.emit('style.load'));
  expect(newMap.getSource('boundaries')!.setData.mock.lastCall![0].features.some((f: GeoJSON.Feature) => f.properties?.polityId === 'song_northern')).toBe(true);
});
