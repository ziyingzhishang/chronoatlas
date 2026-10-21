import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { App } from './App';
import { mapInstances } from '../test/maplibre-mock';
import { yearToIndex } from '../domain/timeline';

test('selecting a new year updates the year label, active polity summary, and map state', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button',{name:'展开时间控制器'}));
  await user.clear(screen.getByRole('spinbutton', { name: '输入历史年份' }));
  await user.type(screen.getByRole('spinbutton', { name: '输入历史年份' }), '959{Enter}');

  expect(screen.getByRole('heading', { name: '959年' })).toBeInTheDocument();
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'later_zhou'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  expect(within(screen.getByRole('complementary', { name: '历史信息' })).getByText('后周')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year', '959');
  await user.click(screen.getByRole('button',{name:'关闭面板'}));
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'悬浮时间控制器'}));
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year','959');
});

test('closing a map detail panel dismisses the selected territory',async()=>{
  render(<App/>);
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'tang'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  await userEvent.click(screen.getByRole('button',{name:'关闭面板'}));
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
  await userEvent.click(screen.getByRole('button',{name:/查看前1046年附近/}));
  expect(screen.getByRole('option',{name:/周克商/})).toBeInTheDocument();
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'下一年'}));
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
});

test('choosing an event changes the map year and keeps its details open',async()=>{
  render(<App/>);
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史事件'}),'秦统一');
  await userEvent.click(screen.getByRole('option',{name:/秦统一六国/}));
  expect(screen.getByRole('region',{name:'历史地图'})).toHaveAttribute('data-year','-221');
  expect(screen.getByRole('article',{name:'事件详情'})).toHaveTextContent('秦统一六国');
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:/返回事件列表/}));
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
  expect(screen.getByRole('option',{name:/秦统一六国/})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('option',{name:/秦统一六国/}));
  await userEvent.click(screen.getByRole('button',{name:'下一年'}));
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
});

test('rapid timeline dragging commits the final territory year without recreating or moving the map',async()=>{
  render(<App/>);
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  const map=mapInstances.at(-1)!;
  const instanceCount=mapInstances.length;
  act(()=>map.emit('style.load'));
  const slider=screen.getByRole('slider');
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
