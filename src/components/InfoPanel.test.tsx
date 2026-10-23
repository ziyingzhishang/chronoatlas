import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { InfoPanel } from './InfoPanel';
import { LocaleProvider } from '../i18n/locale';
import { localizeState } from '../i18n/content';

test('shows current polities when no entity is selected', () => {
  render(<InfoPanel state={getHistoricalState(937)} selectedEntity={undefined} />);
  expect(screen.getByText('南唐')).toBeInTheDocument();
  expect(screen.queryByText('使用最大参考')).not.toBeInTheDocument();
  expect(screen.getAllByText('暂无国家边界资料').length).toBeGreaterThan(0);
});

test('passes the detail drawer callback to actionable coverage tasks', async () => {
  const user = userEvent.setup();
  const onOpenEntity = vi.fn();
  render(<LocaleProvider><InfoPanel state={getHistoricalState(937)} selectedEntity={undefined} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  await user.click(screen.getByText('展开可行动缺口'));
  await user.click(screen.getAllByRole('button', { name: /打开实体详情：/ })[0]);

  expect(onOpenEntity).toHaveBeenCalledTimes(1);
  expect(onOpenEntity.mock.calls[0][0]).toEqual(expect.objectContaining({ type: expect.any(String), id: expect.any(String) }));
});

test('opens an event detail from the current-year event summary through the entity callback', async () => {
  const user = userEvent.setup();
  const onOpenEntity = vi.fn();

  render(<InfoPanel state={getHistoricalState(618)} selectedEntity={undefined} onOpenEntity={onOpenEntity} />);

  await user.click(screen.getByRole('button', { name: '唐建立' }));

  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded' });
});

test('shows historical and modern names for a selected place', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'place', id: 'xianyang' }} />);
  expect(screen.getByRole('heading', { name: '咸阳' })).toBeInTheDocument();
  expect(screen.getByText('现代位置')).toBeInTheDocument();
  expect(screen.getAllByText('咸阳市').length).toBeGreaterThanOrEqual(1);
});

test('uses the full event catalog in a non-Changan city study view', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'place', id: 'xianyang' }} />);
  expect(screen.getAllByRole('button', { name: '秦迁都咸阳' }).length).toBeGreaterThanOrEqual(2);
  expect(screen.getAllByRole('button', { name: '秦统一后咸阳成为帝国中心' }).length).toBeGreaterThanOrEqual(2);
});

test('preserves a raw source zero endpoint without treating it as a selectable civil year', () => {
  const state = getHistoricalState(-1);
  const boundary = state.boundaries[0];
  state.activePolities.push({id:'world-rome',name:'罗马帝国',originalName:'Roman Empire',region:'world',type:'regime',startYear:-14,endYear:-1,color:'#888888',description:'来源记录',sourceIds:['cliopatria']});
  state.boundaries.push({...boundary,id:'rome-test',polityId:'world-rome',validFrom:-14,validTo:-1,sourceFrom:-14,sourceTo:0,sourceName:'Roman Empire',presentation:'interval'});
  render(<InfoPanel state={state} selectedEntity={{type:'polity',id:'world-rome'}} />);
  expect(screen.getByText('适用时段：前14年—前1年')).toBeInTheDocument();
  expect(screen.getByText(/来源原始时段：前14年—0（来源边界值，非公元0年）/)).toBeInTheDocument();
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

test('shows evidence level, derivation, review state and citation for a curated boundary', () => {
  const state = getHistoricalState(937);
  const base = state.boundaries[0];
  state.boundaries.push({...base, id:'test-southern-tang-maximum', polityId:'southern_tang', validFrom:937, validTo:959, snapshotYear:937, presentation:'maximum', evidence:{...base.evidence, evidenceLevel:'C', derivation:'maximum-record', reviewStatus:'pending'}});
  render(<LocaleProvider><InfoPanel state={state} selectedEntity={{type:'polity', id:'southern_tang'}} /></LocaleProvider>);
  expect(screen.getAllByTestId('boundary-evidence')[0]).not.toHaveAttribute('open');
  expect(screen.getByText('证据级别：C')).toBeInTheDocument();
  expect(screen.getByText('派生方式：最大参考')).toBeInTheDocument();
  expect(screen.getByText('复核状态：待逐段复核')).toBeInTheDocument();
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
