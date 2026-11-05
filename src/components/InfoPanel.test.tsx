import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { InfoPanel } from './InfoPanel';
import { LocaleProvider } from '../i18n/locale';
import { localizeState } from '../i18n/content';
import { buildLocalMapData } from '../map/history-map';

test('shows current polities when no entity is selected', () => {
  render(<InfoPanel state={getHistoricalState(937)} selectedEntity={undefined} />);
  expect(screen.getByText('南唐')).toBeInTheDocument();
  expect(screen.queryByText('使用最大参考')).not.toBeInTheDocument();
  expect(screen.getAllByText('展示控制中心／影响范围').length).toBeGreaterThan(0);
});

test('does not expose coverage workflow state on the reader surface', async () => {
  const onOpenEntity = vi.fn();
  render(<LocaleProvider><InfoPanel state={getHistoricalState(937)} selectedEntity={undefined} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  expect(screen.queryByTestId('knowledge-coverage-panel')).not.toBeInTheDocument();
  expect(document.body).not.toHaveTextContent('覆盖审计');
  expect(onOpenEntity).not.toHaveBeenCalled();
});

test('opens an event detail from the current-year event summary through the entity callback', async () => {
  const user = userEvent.setup();
  const onOpenEntity = vi.fn();

  render(<InfoPanel state={getHistoricalState(618)} selectedEntity={undefined} onOpenEntity={onOpenEntity} />);

  await user.click(screen.getByRole('button', { name: '唐建立' }));

  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded' });
});

test('opens the complete event detail from a selected event summary', async () => {
  const user = userEvent.setup();
  const onOpenEntity = vi.fn();
  const state = getHistoricalState(618);

  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'event', id: 'tang-founded' }} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  expect(screen.getByRole('heading', { name: '唐建立' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '打开完整事件详情' }));

  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded' });
});

test('shows historical and modern names for a selected place', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'place', id: 'xianyang' }} />);
  expect(screen.getByRole('heading', { name: '咸阳' })).toBeInTheDocument();
  expect(screen.getByText('现代位置')).toBeInTheDocument();
  expect(screen.getAllByText('咸阳市').length).toBeGreaterThanOrEqual(1);
});

test('keeps polity audit reports out of the reader panel', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'polity', id: 'qin' }} />);

  expect(screen.queryByTestId('knowledge-coverage-panel')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /覆盖/ })).not.toBeInTheDocument();
});

test('keeps city audit reports and coordinates out of the reader panel', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'place', id: 'xianyang' }} />);

  expect(screen.queryByTestId('knowledge-coverage-panel')).not.toBeInTheDocument();
  expect(document.body).not.toHaveTextContent('坐标');
  expect(document.body).not.toHaveTextContent('34.33°N');
});

test('shows the early Min five-prefecture description with its source while preserving the unfilled boundary status', () => {
  const state = getHistoricalState(909);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'polity', id: 'min' }} /></LocaleProvider>);

  expect(screen.getByText(/909—910年闽国资料概述福、泉、建、漳、汀五州/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'CHGIS 时间地名录：闽国（909—943）' })).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ href: 'https://tgaz.fudan.edu.cn/tgaz/placename/hvd_100000' }),
    ]),
  );
  expect(screen.getByText('暂无疆域几何')).toBeInTheDocument();
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'min' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('shows Ma Chu early territorial events as sourced context without implying a boundary', () => {
  const state = getHistoricalState(908);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'polity', id: 'chu_ten' }} /></LocaleProvider>);

  expect(screen.getByText(/针对907—910年：《资治通鉴》记907年马殷受封楚王、908年楚军攻取岭南六州/)).toBeInTheDocument();
  expect(screen.getByText(/不足以证明六州全境全年稳定受控/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '《资治通鉴》卷二百六十六至二百六十七·后梁纪一至二' }).length).toBeGreaterThan(0);
  expect(screen.getByText('暂无疆域几何')).toBeInTheDocument();
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'chu_ten' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('shows Former Shu early territorial events as sourced context without implying a boundary', () => {
  const state = getHistoricalState(910);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'polity', id: 'former_shu' }} /></LocaleProvider>);

  expect(screen.getByText(/针对907—910年前蜀：《资治通鉴》记907年王建在成都即帝位、908年讲武、909年太子判六军/)).toBeInTheDocument();
  expect(screen.getByText(/910年求取巴、剑二州的交涉不等于已查明各县全年控制/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '《资治通鉴》卷二百六十六至二百六十七·后梁纪一至二（前蜀初期）' }).length).toBeGreaterThan(0);
  expect(screen.getByText('暂无疆域几何')).toBeInTheDocument();
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'former_shu' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('shows Later Shu founding and Quzhou events as sourced context without implying a boundary', () => {
  const state = getHistoricalState(934);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'polity', id: 'later_shu' }} /></LocaleProvider>);

  expect(screen.getByText(/针对934—935年后蜀：《资治通鉴》卷278—279记934年孟知祥在成都称帝、五镇任命及渠州叛乱平定，935年蜀大赦/)).toBeInTheDocument();
  expect(screen.getByText(/不能证明全境连续边界/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '《资治通鉴》卷二百七十八至二百七十九·后唐纪七至八（后蜀初期）' }).length).toBeGreaterThan(0);
  expect(screen.getAllByText('《渠县志》沿革及渠州历史地名资料').length).toBeGreaterThan(0);
  expect(screen.getByText('暂无疆域几何')).toBeInTheDocument();
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'later_shu' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('shows Jingnan investiture and neighboring regime change as context without implying a boundary', () => {
  const state = getHistoricalState(925);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'polity', id: 'jingnan' }} /></LocaleProvider>);

  expect(screen.getByText(/针对924—925年荆南：《资治通鉴》卷273记924年高季兴进封南平王；卷274记925年后蜀灭亡，高季兴闻讯忧惧/)).toBeInTheDocument();
  expect(screen.getByText(/封爵和邻国政权更替不能说明荆南疆域变化/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '《资治通鉴》卷二七三至二七四·荆南早期' }).length).toBeGreaterThan(0);
  expect(screen.getByText('暂无疆域几何')).toBeInTheDocument();
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'jingnan' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('shows Northern Han claimed prefectures and wartime limits with the supporting sources', () => {
  const state = getHistoricalState(951);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{ type: 'polity', id: 'northern_han' }} /></LocaleProvider>);

  expect(screen.getByText(/针对951—959年北汉：951年《资治通鉴》所称十二州与《新五代史·职方考》所列十州有时间和统计口径差异/)).toBeInTheDocument();
  expect(screen.getByText(/州目和959年政区图均不足以证明每年实控边界/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '《资治通鉴》卷二九〇至二九四·北汉建立与后周战争' }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: '《新五代史》卷六十·职方考第三' }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: '《中国行政区划通史·五代十国卷》及其学术评介' }).length).toBeGreaterThan(0);
  expect(screen.getByText('展示控制中心／影响范围')).toBeInTheDocument();
  expect(screen.queryByText('直接控制')).not.toBeInTheDocument();
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'northern_han' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('shows the debated Qin commandery changes in Qi with their research reference', () => {
  render(<LocaleProvider><InfoPanel state={getHistoricalState(-219)} selectedEntity={{ type: 'polity', id: 'qin' }} /></LocaleProvider>);

  expect(screen.getByText(/齐地郡级区划在统一后出现阶段性调整/)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '秦代齐地置郡研究述评' }).length).toBeGreaterThan(0);
});

test('uses the full event catalog in a non-Changan city study view', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'place', id: 'xianyang' }} />);
  expect(screen.getAllByRole('button', { name: '秦迁都咸阳' }).length).toBeGreaterThanOrEqual(2);
  expect(screen.getAllByRole('button', { name: '秦统一后咸阳成为帝国中心' }).length).toBeGreaterThanOrEqual(2);
});

test('does not expose a raw source zero endpoint as reader content', () => {
  const state = getHistoricalState(-1);
  const boundary = state.boundaries[0];
  state.activePolities.push({id:'world-rome',name:'罗马帝国',originalName:'Roman Empire',region:'world',type:'regime',startYear:-14,endYear:-1,color:'#888888',description:'来源记录',sourceIds:['cliopatria']});
  state.boundaries.push({...boundary,id:'rome-test',polityId:'world-rome',validFrom:-14,validTo:-1,sourceFrom:-14,sourceTo:0,sourceName:'Roman Empire',presentation:'interval'});
  render(<InfoPanel state={state} selectedEntity={{type:'polity',id:'world-rome'}} />);
  expect(screen.getByText('前14年—前1年')).toBeInTheDocument();
  expect(document.body).not.toHaveTextContent('来源原始时段');
});

test('uses localized dates, control labels and source notes in an English polity detail', () => {
  localStorage.setItem('history-locale','en');
  const state=localizeState(getHistoricalState(-218),'en');
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{type:'polity',id:'qin'}} /></LocaleProvider>);
  expect(screen.getByText('221 BCE to 206 BCE')).toBeInTheDocument();
  expect(screen.getByText('Source does not distinguish control types')).toBeInTheDocument();
  expect(screen.getByText(/A reading focus for 403 BCE/)).toBeInTheDocument();
  localStorage.removeItem('history-locale');
});

test('marks an untranslated world entity and labels its source original in Chinese',()=>{
  const state=getHistoricalState(800);
  const original=state.activePolities[0];
  state.activePolities=[{...original,id:'world-unknown',region:'world',name:'Unmapped Realm',originalName:'Unmapped Realm'}];
  const localized=localizeState(state,'zh-CN');
  render(<LocaleProvider><InfoPanel state={localized} selectedEntity={{type:'polity',id:'world-unknown'}} /></LocaleProvider>);
  expect(screen.getByRole('heading',{name:'原名：Unmapped Realm（中文译名待核验）'})).toBeInTheDocument();
  expect(screen.getByText('来源原名：Unmapped Realm')).toBeInTheDocument();
});

test('shows the approved Taiwan sovereignty notice in PRC details from 1949', () => {
  const state = getHistoricalState(1949);
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{type:'polity', id:'prc'}} /></LocaleProvider>);
  expect(screen.getByTestId('taiwan-sovereignty-notice')).toHaveTextContent('台湾是中国领土不可分割的一部分');
  expect(screen.getByRole('link', {name:'《反分裂国家法》第二条'})).toHaveAttribute('href', expect.stringContaining('moe.gov.cn'));
});

test('shows boundary sources and limitations without internal evidence codes', () => {
  const state = getHistoricalState(937);
  const base = state.boundaries[0];
  state.boundaries.push({...base, id:'test-southern-tang-maximum', polityId:'southern_tang', validFrom:937, validTo:959, snapshotYear:937, presentation:'maximum', evidence:{...base.evidence, evidenceLevel:'C', derivation:'maximum-record', reviewStatus:'pending'}});
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{type:'polity', id:'southern_tang'}} /></LocaleProvider>);
  expect(screen.getAllByText('资料说明').length).toBeGreaterThan(0);
  expect(document.body).not.toHaveTextContent('证据级别：C');
  expect(document.body).not.toHaveTextContent('派生方式');
  expect(document.body).not.toHaveTextContent('复核状态');
  expect(document.body).not.toHaveTextContent('个原始坐标点');
  expect(document.body).not.toHaveTextContent(/万 km²/);
  expect(document.body).not.toHaveTextContent('来源文献原题：');
  expect(screen.getByRole('link', {name:/Cliopatria/})).toBeInTheDocument();
});

test('opens full polity details through the entity callback instead of expanding the summary card', async () => {
  const user = userEvent.setup();
  const onOpenEntity = vi.fn();
  render(<LocaleProvider><InfoPanel state={getHistoricalState(-218)} selectedEntity={{type:'polity', id:'qin'}} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  expect(screen.getByText('秦统一六国后建立的中央集权帝国。')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '展开政权详情' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: '展开政权详情' }));

  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'qin' });
  expect(screen.queryByRole('heading', { name: '建立过程' })).not.toBeInTheDocument();
});

test('renders the complete polity detail directly when the info panel is inside its entity drawer', () => {
  render(<LocaleProvider><InfoPanel state={getHistoricalState(-218)} selectedEntity={{type:'polity', id:'qin'}} polityDetailMode="drawer" /></LocaleProvider>);

  expect(screen.queryByRole('button', { name: '展开政权详情' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '建立过程' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '关键转折' })).toBeInTheDocument();
  expect(screen.getByText(/秦帝国以统一战争结束战国列国/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '嬴政' })).toBeInTheDocument();
});
