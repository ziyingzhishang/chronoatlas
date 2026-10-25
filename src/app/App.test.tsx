import { act, render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';
import userEvent from '@testing-library/user-event';
import { mapInstances } from '../test/maplibre-mock';

test('keeps secondary controls closed until requested', async () => {
  render(<App />);
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent('800年');
  expect(screen.queryByRole('button', { name: '图层' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '事件' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '详情' })).not.toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: '工作台工具' })).toHaveClass('workspace-tool-nav');
  expect(screen.getByRole('searchbox', { name: '搜索历史事件' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  expect(screen.getByRole('complementary', { name: '政权目录' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  expect(screen.queryByRole('complementary', { name: '政权目录' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  expect(screen.getByRole('complementary', { name: '政权目录' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('searchbox', { name: '搜索历史事件' }));
  expect(screen.queryByRole('complementary', { name: '政权目录' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '事件地域' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /安史之乱/ })).toBeInTheDocument();
  await userEvent.type(screen.getByRole('searchbox', { name: '搜索历史事件' }), '秦统一');
  expect(screen.getByRole('option', { name: /秦统一六国/ })).toBeInTheDocument();
  expect(screen.queryByRole('status', { name: '疆域资料状态' })).not.toBeInTheDocument();
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'全历史'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  expect(screen.getByRole('button', { name: '全历史' })).toBeInTheDocument();
});

test('opens the more information as a bottom-right HUD', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '更多' }));
  expect(screen.getByRole('dialog', { name: '阅读说明与来源' })).toHaveClass('workspace-hud');
});

test('opens a deep entity drawer from the polity study view and supports back navigation', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: /^李世民$/ }));
  expect(screen.getByRole('dialog', { name: '李世民' })).toHaveClass('entity-drawer');
  expect(screen.queryByRole('complementary', { name: '政权目录' })).not.toBeInTheDocument();
  expect(screen.getByText('人物关系')).toBeInTheDocument();
  await userEvent.click(within(screen.getByRole('dialog', { name: '李世民' })).getByRole('button', { name: '关闭详情' }));
  expect(screen.queryByRole('dialog', { name: '李世民' })).not.toBeInTheDocument();
});

test('opens a resizable event topic beside the map from the event search result card', async () => {
  render(<App />);
  const search = screen.getByRole('searchbox', { name: '搜索历史事件' });

  await userEvent.type(search, '秦统一');
  await userEvent.click(screen.getByRole('option', { name: /秦统一六国/ }));
  await userEvent.click(screen.getByRole('button', { name: '打开完整事件详情' }));

  const drawer = screen.getByRole('dialog', { name: '秦统一六国' });
  const mapPane = screen.getByRole('region', { name: '地图工作区' });
  const divider = screen.getByRole('separator', { name: '调整地图与专题栏宽度' });
  expect(drawer).toHaveClass('entity-drawer', 'entity-drawer-event');
  expect(getComputedStyle(drawer).width).toBe('44%');
  expect(drawer.parentElement).toBe(mapPane.parentElement);
  expect(mapPane).toContainElement(screen.getByRole('button', { name: '下一年' }).closest('.time-controller'));
  expect(drawer).not.toContainElement(divider);
  expect(divider).toHaveAttribute('aria-valuenow', '44');
  expect(within(drawer).getByText('地图时点：前221年')).toBeInTheDocument();
  expect(within(drawer).getByRole('article', { name: '事件详情' })).toBeInTheDocument();
});

test('opens polity detail from the compact card in the existing entity drawer', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: '展开政权详情' }));

  const drawer = screen.getByRole('dialog', { name: '唐' });
  expect(drawer).toHaveClass('entity-drawer');
  expect(within(drawer).getByRole('heading', { name: '建立过程' })).toBeInTheDocument();
  expect(screen.getAllByRole('dialog', { name: '唐' })).toHaveLength(1);
  expect(within(drawer).queryByRole('button', { name: '展开政权详情' })).not.toBeInTheDocument();
}, 30000);

test('opens relationship targets and keeps the summary-to-detail drawer hierarchy', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('link', { name: '李世民' }));

  const personDrawer = screen.getByRole('dialog', { name: '李世民' });
  expect(within(personDrawer).getByRole('article', { name: '人物详情' })).toBeInTheDocument();
  expect(within(personDrawer).getByRole('heading', { name: '人物关系' })).toBeInTheDocument();
}, 30000);

test('opens event and heritage details from the polity study summary', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));

  await userEvent.click(screen.getByRole('button', { name: '唐在长安建立' }));
  const eventDrawer = screen.getByRole('dialog', { name: '唐在长安建立' });
  expect(eventDrawer).toHaveClass('entity-drawer');
  expect(getComputedStyle(eventDrawer).width).toBe('44%');
  expect(within(eventDrawer).getByRole('article', { name: '事件详情' })).toContainElement(within(eventDrawer).getByRole('heading', { name: '唐在长安建立', level: 3 }));

  await userEvent.click(within(eventDrawer).getByRole('button', { name: '李渊' }));
  expect(screen.getByRole('dialog', { name: '李渊' })).toHaveClass('entity-drawer-person');

  await userEvent.click(within(screen.getByRole('dialog', { name: '李渊' })).getByRole('button', { name: '返回上一个实体' }));
  await userEvent.click(within(screen.getByRole('dialog', { name: '唐在长安建立' })).getByRole('button', { name: '关闭详情' }));
  await userEvent.click(screen.getByRole('button', { name: '大明宫遗址' }));
  const heritageDrawer = screen.getByRole('dialog', { name: '大明宫遗址' });
  expect(heritageDrawer).toHaveClass('entity-drawer');
  expect(getComputedStyle(heritageDrawer).width).toBe('44%');
  expect(within(heritageDrawer).getByRole('heading', { name: '建造沿革' })).toBeInTheDocument();
});

test('opens the capital place detail from the polity study summary', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: '长安' }));

  const placeDrawer = screen.getByRole('dialog', { name: '长安' });
  expect(placeDrawer).toHaveClass('entity-drawer');
  expect(within(placeDrawer).getByRole('button', { name: '西安市' })).toBeInTheDocument();
});

test('opens an ended historical polity from the city study view in the topic split', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: '长安' }));

  const cityDrawer = screen.getByRole('dialog', { name: '长安' });
  const regimeBlock = within(cityDrawer).getByRole('heading', { name: '曾以此地为政治中心的政权' }).parentElement!;
  await userEvent.click(within(regimeBlock).getByRole('button', { name: '隋' }));

  const polityDrawer = screen.getByRole('dialog', { name: '隋' });
  expect(polityDrawer).toHaveClass('entity-drawer', 'entity-drawer-polity');
  expect(getComputedStyle(polityDrawer).width).toBe('44%');
  expect(within(polityDrawer).getByRole('heading', { name: '建立过程' })).toBeInTheDocument();
});

test('keeps the city perspective continuous from the city timeline to event and heritage drawers', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: '长安' }));

  const cityDrawer = screen.getByRole('dialog', { name: '长安' });
  const timeline = within(cityDrawer).getByRole('region', { name: '城市历史时间轴' });
  await userEvent.click(within(timeline).getByRole('button', { name: '唐在长安建立' }));

  const eventDrawer = screen.getByRole('dialog', { name: '唐在长安建立' });
  expect(eventDrawer).toHaveClass('entity-drawer-event');
  expect(within(eventDrawer).getByRole('article', { name: '事件详情' })).toBeInTheDocument();
  await userEvent.click(within(eventDrawer).getByRole('button', { name: '返回上一个实体' }));

  const returnedCityDrawer = screen.getByRole('dialog', { name: '长安' });
  const returnedTimeline = within(returnedCityDrawer).getByRole('region', { name: '城市历史时间轴' });
  await userEvent.click(within(returnedTimeline).getByRole('button', { name: '大明宫遗址' }));

  const heritageDrawer = screen.getByRole('dialog', { name: '大明宫遗址' });
  expect(heritageDrawer).toHaveClass('entity-drawer-heritage');
  expect(within(heritageDrawer).getByRole('heading', { name: '建造沿革' })).toBeInTheDocument();
});

test('opens the complete heritage drawer from the city relation panel', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: '长安' }));

  const cityDrawer = screen.getByRole('dialog', { name: '长安' });
  const heritageSection = within(cityDrawer).getByRole('heading', { name: '遗产与城市记忆' }).parentElement!;
  await userEvent.click(within(heritageSection).getByRole('button', { name: '大明宫遗址' }));

  const heritageDrawer = screen.getByRole('dialog', { name: '大明宫遗址' });
  expect(heritageDrawer).toHaveClass('entity-drawer-heritage');
  expect(getComputedStyle(heritageDrawer).width).toBe('44%');
  expect(within(heritageDrawer).getByRole('heading', { name: '建造沿革' })).toBeInTheDocument();
  expect(within(heritageDrawer).getAllByText('不确定性：').length).toBeGreaterThan(0);
  expect(within(heritageDrawer).getByRole('button', { name: '返回上一个实体' })).toBeInTheDocument();
});

test('opens the complete heritage drawer from a map-selected place detail', async () => {
  render(<App />);
  const map = mapInstances.at(-1)!;
  map.queryRenderedFeatures.mockReturnValue([{ layer: { id: 'place-dots' }, properties: { entityId: 'changan' } }] as never[]);

  act(() => map.emit('style.load'));
  act(() => map.emit('click', { point: { x: 10, y: 10 } }));

  const cityDrawer = screen.getByRole('complementary', { name: '政权目录' });
  expect(within(cityDrawer).getByRole('heading', { name: '长安' })).toBeInTheDocument();
  const heritageSection = within(cityDrawer).getByRole('heading', { name: '遗产与城市记忆' }).parentElement!;
  await userEvent.click(within(heritageSection).getByRole('button', { name: '大明宫遗址' }));

  const heritageDrawer = screen.getByRole('dialog', { name: '大明宫遗址' });
  expect(heritageDrawer).toHaveClass('entity-drawer-heritage');
  expect(getComputedStyle(heritageDrawer).width).toBe('44%');
  expect(within(heritageDrawer).getByRole('heading', { name: '建造沿革' })).toBeInTheDocument();
});
