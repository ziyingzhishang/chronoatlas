import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import { App } from './App';
import { mapInstances } from '../test/maplibre-mock';
import { yearToIndex } from '../domain/timeline';
import '../styles/theme.css';

beforeEach(() => {
  localStorage.clear();
});

test('selecting a new year updates the year label, active polity summary, and map state', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button',{name:'展开时间控制器'}));
  await user.clear(screen.getByRole('spinbutton', { name: '输入历史年份' }));
  await user.type(screen.getByRole('spinbutton', { name: '输入历史年份' }), '959{Enter}');

  expect(screen.getByText('959年', { selector: '.map-status-year' })).toBeInTheDocument();
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'later_zhou'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  expect(within(screen.getByRole('complementary', { name: '历史信息' })).getByText('后周')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: '历史地图' })).toHaveAttribute('data-year', '959');
  await user.click(screen.getByRole('button',{name:'收起'}));
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'悬浮时间控制器'}));
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
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  await userEvent.click(screen.getByRole('button',{name:/查看前1046年附近/}));
  expect(screen.getByRole('option',{name:/周克商/})).toBeInTheDocument();
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
  await userEvent.clear(screen.getByRole('spinbutton',{name:'输入历史年份'}));
  await userEvent.type(screen.getByRole('spinbutton',{name:'输入历史年份'}),'801');
  await userEvent.click(screen.getByRole('button',{name:'前往'}));
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
});

test('choosing an event opens its details without changing the map year until the period is requested',async()=>{
  render(<App/>);
  const initialYear = screen.getByRole('region',{name:'历史地图'}).getAttribute('data-year');
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史内容'}),'秦统一');
  const eventOption=screen.getByRole('button',{name:/秦统一六国/});
  await userEvent.click(eventOption);
  expect(screen.getByRole('region',{name:'历史地图'})).toHaveAttribute('data-year',initialYear);
  expect(screen.getByRole('article',{name:'事件详情'})).toHaveTextContent('秦统一六国');
  expect(eventOption).toHaveAttribute('aria-pressed','true');
  expect(document.querySelector('.global-search-groups')!.compareDocumentPosition(screen.getByRole('article',{name:'事件详情'})) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByRole('complementary',{name:'历史转折'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:/返回事件列表/}));
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:/秦统一六国/})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:/秦统一六国/}));
  await userEvent.click(screen.getByRole('button',{name:'查看该时期'}));
  expect(screen.getByRole('region',{name:'历史地图'})).toHaveAttribute('data-year','-221');
  expect(screen.getByRole('article',{name:'事件详情'})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:/返回事件列表/}));
  expect(screen.getByRole('region',{name:'历史地图'})).toHaveAttribute('data-year','-221');
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  await userEvent.clear(screen.getByRole('spinbutton',{name:'输入历史年份'}));
  await userEvent.type(screen.getByRole('spinbutton',{name:'输入历史年份'}),'801');
  await userEvent.click(screen.getByRole('button',{name:'前往'}));
  expect(screen.queryByRole('article',{name:'事件详情'})).not.toBeInTheDocument();
});

test('opening a search result preserves the map year until the reader explicitly locates the event', async () => {
  render(<App />);
  const map = screen.getByRole('region', { name: '历史地图' });
  const initialYear = map.getAttribute('data-year');
  await userEvent.type(screen.getByRole('searchbox', { name: '搜索历史内容' }), '秦统一');
  await userEvent.click(screen.getByRole('button', { name: /秦统一六国/ }));

  expect(map).toHaveAttribute('data-year', initialYear);
  expect(screen.getByRole('article', { name: '事件详情' })).toHaveTextContent('秦统一六国');

  await userEvent.click(screen.getByRole('button', { name: '查看该时期' }));
  expect(map).toHaveAttribute('data-year', '-221');
});

test('closing a full event detail restores the search context and returns focus to search', async () => {
  render(<App />);
  const search = screen.getByRole('searchbox', { name: '搜索历史内容' });
  await userEvent.type(search, '秦统一');
  await userEvent.click(screen.getByRole('button', { name: /秦统一六国/ }));
  await userEvent.click(screen.getByRole('button', { name: '打开完整事件详情' }));
  await userEvent.click(screen.getByRole('button', { name: '关闭详情' }));

  expect(screen.getByRole('searchbox', { name: '搜索历史内容' })).toHaveValue('秦统一');
  expect(screen.getByRole('button', { name: /秦统一六国/ })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: '搜索历史内容' })).toHaveFocus();
});

test('event search filters and results keep readable touch targets', async () => {
  render(<App />);
  await userEvent.type(screen.getByRole('searchbox', { name: '搜索历史内容' }), '秦统一');
  expect(getComputedStyle(screen.getByRole('combobox', { name: '搜索地域' })).minHeight).toBe('44px');
  expect(getComputedStyle(screen.getByRole('button', { name: /秦统一六国/ })).minHeight).toBe('44px');
  const result = screen.getByRole('button', { name: /秦统一六国/ });
  expect(getComputedStyle(within(result).getByText(/统一／分裂/)).fontSize).toBe('12px');
});

test('empty map search only shows events recorded for the selected year', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('searchbox', { name: '搜索历史内容' }));
  expect(screen.getByText('本年暂无已收录事件')).toBeInTheDocument();
  expect(screen.getByRole('listbox').querySelectorAll('[role="option"]')).toHaveLength(0);
});

test('search finds a person and restores query and focus after reading the detail', async () => {
  render(<App />);
  const search = screen.getByRole('searchbox', { name: '搜索历史内容' });
  await userEvent.type(search, '嬴政');
  const personGroup = screen.getByRole('group', { name: /人物/ });
  const personResult = within(personGroup).getByRole('button', { name: /嬴政/ });
  await userEvent.click(personResult);
  expect(screen.getByRole('dialog', { name: '嬴政' })).toBeInTheDocument();
  expect(screen.getByText('嬴政', { selector: 'h2' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '关闭详情' }));
  expect(screen.getByRole('searchbox', { name: '搜索历史内容' })).toHaveValue('嬴政');
  expect(screen.getByRole('button', { name: /嬴政/ })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: '搜索历史内容' })).toHaveFocus();
});

test('modern city hits stay under one historical place and locating does not change the map year', async () => {
  render(<App />);
  const map = screen.getByRole('region', { name: '历史地图' });
  const year = map.getAttribute('data-year');
  await userEvent.type(screen.getByRole('searchbox', { name: '搜索历史内容' }), '西安市');
  const placeGroup = screen.getByRole('group', { name: /地点/ });
  const results = within(placeGroup).getAllByRole('button').filter(result => result.hasAttribute('aria-pressed'));
  expect(results.filter(result => result.querySelector('strong')?.textContent?.trim() === '长安')).toHaveLength(1);
  expect(results.find(result => result.querySelector('strong')?.textContent?.trim() === '长安')).toHaveTextContent('今名命中');
  await userEvent.click(screen.getByRole('button', { name: '定位到地点：长安' }));
  expect(map).toHaveAttribute('data-year', year);
  expect(mapInstances.at(-1)!.flyTo).toHaveBeenCalled();
});

test('global result groups show five items first and expand from the keyboard', async () => {
  render(<App />);
  await userEvent.type(screen.getByRole('searchbox', { name: '搜索历史内容' }), '长安');
  const eventGroup = screen.getByRole('group', { name: /事件 ·/ });
  const visibleResults = () => within(eventGroup).getAllByRole('button').filter(button => button.hasAttribute('aria-pressed'));
  expect(visibleResults()).toHaveLength(5);
  const more = within(eventGroup).getByRole('button', { name: /更多结果/ });
  more.focus();
  await userEvent.keyboard('{Enter}');
  expect(visibleResults().length).toBeGreaterThan(5);
});

test('changing the event query hides a stale detail card and clears timeline groups',async()=>{
  render(<App/>);
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  await userEvent.click(screen.getByRole('button',{name:/查看前1046年附近/}));
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史内容'}),'秦统一');
  await userEvent.click(screen.getByRole('button',{name:/秦统一六国/}));
  expect(screen.getByRole('article',{name:'事件详情'})).toBeInTheDocument();
  const search = screen.getByRole('searchbox',{name:'搜索历史内容'});
  await userEvent.clear(search);
  await userEvent.type(search,'安史');
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
