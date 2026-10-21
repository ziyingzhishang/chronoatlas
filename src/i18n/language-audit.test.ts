import { expect, test } from 'vitest';
import { auditDisplayText, auditPolityDisplayName } from './language-audit';
import { getHistoricalState } from '../domain/history-state';
import { localizeState } from './content';
import { buildMapData } from '../map/history-map';

test('rejects mixed product language while allowing structured originals',()=>{
  expect(auditDisplayText('秦统一六国','en','ui')).toContain('English UI contains Han text');
  expect(auditDisplayText('Qin Dynasty','zh-CN','ui')).toContain('Chinese UI contains unlabelled Latin text');
  expect(auditDisplayText('Qin Dynasty','zh-CN','source-original')).toEqual([]);
  expect(auditDisplayText('Esri · CC BY 4.0','zh-CN','attribution')).toEqual([]);
  expect(auditDisplayText('English','zh-CN','language-name')).toEqual([]);
});

test('localized map labels pass the audit with an explicit unknown-name exemption',()=>{
  const state=getHistoricalState(800);
  const chinese=localizeState(state,'zh-CN');
  for(const feature of buildMapData(chinese).polityLabels.features){
    const polity=chinese.activePolities.find(item=>item.id===feature.properties?.entityId)!;
    expect(auditPolityDisplayName(polity,'zh-CN','map')).toEqual([]);
  }
  const original=state.activePolities[0];
  state.activePolities=[{...original,id:'world-unknown',region:'world',name:'Unmapped Realm',originalName:'Unmapped Realm'}];
  state.boundaries=[{...state.boundaries[0],polityId:'world-unknown'}];
  const unknown=localizeState(state,'zh-CN');
  const polity=unknown.activePolities[0];
  const label=String(buildMapData(unknown).worldPolityLabels.features[0].properties?.name);
  expect(auditPolityDisplayName(polity,'zh-CN','map')).toEqual([]);
  expect(auditDisplayText(label,'zh-CN','entity')).toContain('Chinese entity contains unlabelled Latin text');
});
