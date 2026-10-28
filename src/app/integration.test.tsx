import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { mapInstances } from '../test/maplibre-mock';
import { yearToIndex } from '../domain/timeline';

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const size = this.classList.contains('workspace-map-pane')
      ? { width: 1200, height: 800 }
      : { width: 0, height: 0 };
    return { ...size, x: 0, y: 0, top: 0, left: 0, right: size.width, bottom: size.height, toJSON: () => ({}) };
  });
});

afterEach(() => vi.restoreAllMocks());

test('selecting a new year updates the year label, active polity summary, and map state', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button',{name:'打开时间轴'}));
  await user.clear(screen.getByRole('spinbutton', { name: '输入历史年份' }));
  await user.type(screen.getByRole('spinbutton', { name: '输入历史年份' }), '959{Enter}');

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent('959年');
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'later_zhou'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  expect(within(screen.getByRole('complementary', { name: '历史信息' })).getByText('后周')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year', '959');
  await user.click(screen.getByRole('button',{name:'收起'}));
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'关闭时间分析'}));
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year','959');
});

test('closing a map detail panel dismisses the selected territory',async()=>{
  render(<App/>);
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'tang'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  await userEvent.click(screen.getByRole('button',{name:'收起'}));
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
});

test('clicking blank map closes an open territory detail panel',async()=>{
  render(<App/>);
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'tang'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  expect(screen.getByRole('complementary',{name:'历史信息'})).toBeInTheDocument();
  map.queryRenderedFeatures.mockReturnValue([] as any);
  act(()=>map.emit('click',{point:{x:2,y:2}}));
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
});

test('ordinary year navigation returns the timeline search to the current window',async()=>{
  render(<App/>);
  await userEvent.click(screen.getByRole('button',{name:'打开时间轴'}));
  await userEvent.click(screen.getByRole('button',{name:'历史事件'}));
  await userEvent.click(screen.getByRole('button',{name:/查看前1046年附近/}));
  expect(screen.getByRole('option',{name:/周克商/})).toBeInTheDocument();
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'下一年'}));
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
});

test('choosing an event changes the map year and keeps its details open',async()=>{
  render(<App/>);
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史事件'}),'秦统一');
  const eventOption=screen.getByRole('option',{name:/秦统一六国/});
  await userEvent.click(eventOption);
  expect(screen.getByRole('region',{name:'历史地图'})).toHaveAttribute('data-year','-221');
  expect(screen.getByRole('article',{name:'事件详情'})).toHaveTextContent('秦统一六国');
  expect(eventOption).toHaveAttribute('aria-selected','true');
  expect(screen.getByRole('listbox').compareDocumentPosition(screen.getByRole('article',{name:'事件详情'})) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:/返回事件列表/}));
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
  expect(screen.getByRole('option',{name:/秦统一六国/})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('option',{name:/秦统一六国/}));
  await userEvent.click(screen.getByRole('button',{name:'下一年'}));
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
});

test('changing the event query hides a stale detail card and clears timeline groups',async()=>{
  render(<App/>);
  await userEvent.click(screen.getByRole('button',{name:'打开时间轴'}));
  await userEvent.click(screen.getByRole('button',{name:'历史事件'}));
  await userEvent.click(screen.getByRole('button',{name:/查看前1046年附近/}));
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史事件'}),'秦统一');
  await userEvent.click(screen.getByRole('option',{name:/秦统一六国/}));
  expect(screen.getByRole('article',{name:'事件详情'})).toBeInTheDocument();
  await userEvent.clear(screen.getByRole('searchbox',{name:'搜索历史事件'}));
  expect(screen.getByRole('option',{name:/秦统一六国/})).toBeInTheDocument();
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史事件'}),'安史');
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
});

test('rapid timeline dragging commits the final territory year without recreating or moving the map',async()=>{
  render(<App/>);
  await userEvent.click(screen.getByRole('button',{name:'打开时间轴'}));
  const map=mapInstances.at(-1)!;
  const instanceCount=mapInstances.length;
  act(()=>map.emit('style.load'));
  const slider=screen.getByRole('slider',{name:'选择历史年份'});
  fireEvent.input(slider,{target:{value:String(yearToIndex(1271))}});
  fireEvent.input(slider,{target:{value:String(yearToIndex(1644))}});
  fireEvent.change(slider,{target:{value:String(yearToIndex(1644))}});
  const mapRegion=screen.getByRole('region',{name:'历史地图'});
  expect(mapRegion).toHaveAttribute('data-year','1644');
  await waitFor(()=>expect(mapRegion).toHaveAttribute('data-rendered-year','1644'));
  expect(mapRegion).toHaveAttribute('aria-busy','false');
  expect(mapInstances).toHaveLength(instanceCount);
  expect(map.flyTo).not.toHaveBeenCalled();
  expect(map.easeTo).not.toHaveBeenCalled();
  expect(map.fitBounds).not.toHaveBeenCalled();
});

test('analysis range navigation and a final year commit preserve camera, layers, topic, and range', async () => {
  const user = userEvent.setup();
  render(<App/>);
  const map = mapInstances.at(-1)!;
  const instanceCount = mapInstances.length;
  act(() => map.emit('style.load'));

  await user.click(screen.getByRole('button', { name: '当前历史状态' }));
  await user.click(screen.getByRole('button', { name: /^唐/ }));
  await user.click(screen.getByRole('button', { name: '展开政权详情' }));
  const topic = screen.getByRole('dialog', { name: '唐' });
  await user.click(screen.getByLabelText('地图图层'));
  const placeLayer = screen.getByRole('checkbox', { name: '历史地名' });
  await user.click(placeLayer);
  expect(placeLayer).not.toBeChecked();
  const cameraCalls = map.flyTo.mock.calls.length + map.easeTo.mock.calls.length + map.fitBounds.mock.calls.length;

  await user.click(screen.getByRole('button', { name: '打开时间轴' }));
  await user.selectOptions(screen.getByRole('combobox', { name: '选择朝代并放大时间轴' }), 'ming');

  const mapRegion = screen.getByRole('region', { name: '历史地图' });
  expect(mapRegion).toHaveAttribute('data-year', '800');
  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent('800年');
  expect(screen.getByText('当前视窗：明')).toBeInTheDocument();
  expect(topic).toBeInTheDocument();
  expect(placeLayer).not.toBeChecked();
  expect(map.flyTo.mock.calls.length + map.easeTo.mock.calls.length + map.fitBounds.mock.calls.length).toBe(cameraCalls);

  const slider = screen.getByRole('slider', { name: '选择历史年份' });
  fireEvent.input(slider, { target: { value: String(yearToIndex(1368)) } });
  fireEvent.input(slider, { target: { value: String(yearToIndex(1644)) } });
  fireEvent.change(slider, { target: { value: String(yearToIndex(1644)) } });
  await waitFor(() => expect(mapRegion).toHaveAttribute('data-rendered-year', '1644'));

  await user.click(screen.getByRole('button', { name: '关闭时间分析' }));
  expect(topic).toBeInTheDocument();
  expect(placeLayer).not.toBeChecked();
  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent('1644年');
  expect(mapInstances).toHaveLength(instanceCount);
  expect(map.flyTo.mock.calls.length + map.easeTo.mock.calls.length + map.fitBounds.mock.calls.length).toBe(cameraCalls);

  await user.click(screen.getByRole('button', { name: '打开时间轴' }));
  expect(screen.getByText('当前视窗：明')).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: '选择历史年份' })).toHaveAttribute('min', String(yearToIndex(1368)));
  expect(screen.getByRole('slider', { name: '选择历史年份' })).toHaveAttribute('max', String(yearToIndex(1644)));
});

test('playback pauses on a stable final rendered year without moving the camera', () => {
  vi.useFakeTimers();
  try {
    render(<App/>);
    const map = mapInstances.at(-1)!;
    act(() => map.emit('style.load'));
    const mapRegion = screen.getByRole('region', { name: '历史地图' });

    fireEvent.click(screen.getByRole('button', { name: '播放' }));
    act(() => vi.advanceTimersByTime(1_950));
    expect(mapRegion).toHaveAttribute('data-year', '803');
    expect(mapRegion).not.toHaveAttribute('data-rendered-year', '803');

    fireEvent.click(screen.getByRole('button', { name: '暂停' }));
    expect(mapRegion).toHaveAttribute('data-rendered-year', '803');
    act(() => vi.advanceTimersByTime(1_300));
    expect(mapRegion).toHaveAttribute('data-year', '803');
    expect(mapRegion).toHaveAttribute('data-rendered-year', '803');
    expect(map.flyTo).not.toHaveBeenCalled();
    expect(map.easeTo).not.toHaveBeenCalled();
    expect(map.fitBounds).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

test('the App step control crosses directly from 1 BCE to 1 CE', async () => {
  const user = userEvent.setup();
  render(<App/>);
  await user.click(screen.getByRole('button', { name: '打开时间轴' }));
  const yearInput = screen.getByRole('spinbutton', { name: '输入历史年份' });
  await user.clear(yearInput);
  await user.type(yearInput, '-1{Enter}');
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year', '-1');

  await user.click(screen.getByRole('button', { name: '下一年' }));
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year', '1');
});
