import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { MapView, allLayers } from './MapView';
import { mapInstances } from '../test/maplibre-mock';

test('renders the current polity names and selects a polity when its area is clicked', async () => {
  const onSelectEntity = vi.fn();
  const user = userEvent.setup();
  const state = getHistoricalState(-221);

  render(
    <MapView
      state={state}
      selectedEntity={undefined}
      visibleLayers={new Set(allLayers)}
      onSelectEntity={onSelectEntity}
    />,
  );

  expect(screen.getByText('秦')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '选择秦疆域' }));
  expect(onSelectEntity).toHaveBeenCalledWith({ type: 'polity', id: 'qin' });
});

test('clears the selected map entity when a blank map area is clicked', () => {
  const onClearSelection = vi.fn();
  render(<MapView state={getHistoricalState(-221)} selectedEntity={{ type: 'polity', id: 'qin' }} visibleLayers={new Set(allLayers)} onSelectEntity={vi.fn()} onClearSelection={onClearSelection} />);
  act(() => mapInstances.at(-1)!.emit('click', { point: { x: 1, y: 1 } }));
  expect(onClearSelection).toHaveBeenCalledOnce();
});

test('marks the map with the current historical year', () => {
  render(
    <MapView
      state={getHistoricalState(-221)}
      selectedEntity={undefined}
      visibleLayers={new Set(allLayers)}
      onSelectEntity={vi.fn()}
    />,
  );

  const region=screen.getByRole('region', { name: '历史地图' });
  expect(region).toHaveAttribute('data-year', '-221');
  expect(region).toHaveAttribute('aria-busy','true');
  act(()=>mapInstances.at(-1)!.emit('style.load'));
  expect(region).toHaveAttribute('data-rendered-year','-221');
  expect(region).toHaveAttribute('aria-busy','false');
});

test('readers can switch basemaps and use accessible zoom and rotate controls', async () => {
  const user = userEvent.setup();
  render(<MapView state={getHistoricalState(-221)} selectedEntity={undefined} visibleLayers={new Set(allLayers)} onSelectEntity={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: '卫星影像' }));
  expect(screen.getByRole('button', { name: '卫星影像' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: '放大地图' }));
  await user.click(screen.getByRole('button', { name: '向右旋转30度' }));
  expect(mapInstances.at(-1)!.zoomIn).toHaveBeenCalledOnce();
  expect(mapInstances.at(-1)!.rotateTo).toHaveBeenCalledWith(60, expect.anything());
});

test('offers a compact layer shortcut without opening the full workspace panel', async () => {
  const user = userEvent.setup();
  const onOpenDetails=vi.fn();
  render(<MapView state={getHistoricalState(-221)} selectedEntity={undefined} visibleLayers={new Set(allLayers)} onSelectEntity={vi.fn()} onLayerChange={vi.fn()} onOpenDetails={onOpenDetails} workspacePanel={null} />);

  await user.click(screen.getByText('◈', { exact: true }));

  expect(screen.getByRole('group', { name: '快捷图层' })).toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: '历史疆域' })).toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'政权与地点目录'}));
  expect(onOpenDetails).toHaveBeenCalledOnce();
});

test('offers mercator and globe projection controls in the map toolbar', async () => {
  const user = userEvent.setup();
  render(<MapView state={getHistoricalState(-221)} selectedEntity={undefined} visibleLayers={new Set(allLayers)} onSelectEntity={vi.fn()} workspacePanel={null} />);

  expect(screen.getByRole('button', { name: '切换球形视图' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '切换球形视图' }));
  expect(screen.getByRole('button', { name: '切换平铺视图' })).toHaveAttribute('aria-pressed', 'true');
});

test('labels the maximum reference with its source period and allows hiding it', async () => {
  const state = getHistoricalState(937);
  const base = state.boundaries[0];
  state.boundaries.push({...base, id:'test-southern-tang-maximum', polityId:'southern_tang', validFrom:937, validTo:959, snapshotYear:937, presentation:'maximum', evidence:{...base.evidence, evidenceLevel:'C', derivation:'maximum-record', reviewStatus:'pending'}});
  state.coverage = {...state.coverage, mode:'mixed', maximumCount:1};
  render(<MapView state={state} selectedEntity={undefined} visibleLayers={new Set(allLayers)} onSelectEntity={vi.fn()} />);
  const map = mapInstances.at(-1)!;
  act(() => map.emit('style.load'));
  expect(screen.getByRole('status', { name: '疆域资料状态' })).toHaveTextContent('最大范围参考');
  expect(map.getSource('boundaries')!.setData.mock.lastCall![0].features.length).toBeGreaterThan(0);
  await userEvent.click(screen.getByRole('checkbox', { name: '显示最大范围参考' }));
  await waitFor(() => expect(map.getSource('boundaries')!.setData.mock.lastCall![0].features.some((f: GeoJSON.Feature)=>f.properties?.polityId==='southern_tang')).toBe(false));
  const updates=map.getSource('boundaries')!.setData.mock.calls.length;
  act(()=>map.emit('moveend'));
  expect(map.getSource('boundaries')!.setData.mock.calls.length).toBe(updates);
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year', '937');
  await userEvent.click(screen.getByRole('checkbox', { name: '显示最大范围参考' }));
  await waitFor(() => expect(map.getSource('boundaries')!.setData.mock.lastCall![0].features.some((f: GeoJSON.Feature) => f.properties?.polityId === 'southern_tang')).toBe(true));
});

test('coverage separates local catalog and contemporaneous world figures', () => {
  const state=getHistoricalState(250);
  state.activePolities.push({...state.activePolities[0],id:'world-rome',name:'罗马',region:'world'});
  state.boundaries.push({...state.boundaries[0],id:'rome',polityId:'world-rome'});
  render(<MapView state={state} selectedEntity={undefined} visibleLayers={new Set(allLayers)} onSelectEntity={vi.fn()} />);
  expect(screen.getByRole('status',{name:'疆域资料状态'})).toHaveTextContent('中国及周边目录');
  expect(screen.getByRole('status',{name:'疆域资料状态'})).toHaveTextContent('同期世界：1 个来源时段图形');
});
