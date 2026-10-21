import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
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

test('shows historical and modern names for a selected place', () => {
  render(<InfoPanel state={getHistoricalState(-221)} selectedEntity={{ type: 'place', id: 'xianyang' }} />);
  expect(screen.getByRole('heading', { name: '咸阳' })).toBeInTheDocument();
  expect(screen.getByText('现代位置')).toBeInTheDocument();
  expect(screen.getByText('咸阳市')).toBeInTheDocument();
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
