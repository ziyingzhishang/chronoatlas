import { expect, test } from 'vitest';
import { getHistoricalState } from './history-state';

test('fills the three kingdoms with three separate period geometries', () => {
  const state = getHistoricalState(250);
  expect(state.boundaries.map(b => b.polityId)).toEqual(expect.arrayContaining(['wei_three', 'shu_three', 'wu_three']));
  expect(state.boundaries.some(b => b.polityId === 'han_eastern')).toBe(false);
});

test('does not paint a maximum reference across the Qin unification transition', () => {
  expect(getHistoricalState(-221).boundaries.some(b => b.polityId === 'qin')).toBe(false);
  expect(getHistoricalState(-218).boundaries.some(b => b.polityId === 'qin')).toBe(true);
});

test('period geometry changes within the Qing dynasty', () => {
  const early = getHistoricalState(1650).boundaries.find(b => b.polityId === 'qing');
  const late = getHistoricalState(1900).boundaries.find(b => b.polityId === 'qing');
  expect(early).toMatchObject({ temporalKind: 'interval', validFrom: 1648, validTo: 1652 });
  expect(late?.geometry).not.toEqual(early?.geometry);
});

test('the Wu Zhou interruption does not paint Tang as a concurrent dynasty', () => {
  const state = getHistoricalState(700);
  expect(state.boundaries.some(b => b.polityId === 'wu_zhou')).toBe(true);
  expect(state.boundaries.some(b => b.polityId === 'tang')).toBe(false);
});

test('Jin succession cannot carry a Western Jin maximum into Eastern Jin', () => {
  expect(getHistoricalState(317).boundaries.map(b => b.polityId)).toContain('jin_eastern');
  expect(getHistoricalState(317).boundaries.map(b => b.polityId)).not.toContain('jin_western');
});

test('legacy fallback option cannot recreate an explicitly unfilled transition', () => {
  expect(getHistoricalState(-221, {maximumFallback:true}).boundaries.some(b=>b.polityId==='qin')).toBe(false);
  expect(getHistoricalState(-210, {maximumFallback:false}).boundaries.some(b=>b.polityId==='qin')).toBe(true);
});

test('world context is filtered to the requested year and never retains a stale century', () => {
  const b=getHistoricalState(250).boundaries.find(b=>b.polityId==='wei_three')!;
  const world={start:200,end:299,polities:[{...getHistoricalState(250).activePolities[0],id:'world-rome',region:'world' as const,name:'罗马'}],
    boundaries:[{...b,id:'rome',polityId:'world-rome',validFrom:240,validTo:260}]};
  expect(getHistoricalState(250,{world}).boundaries.some(b=>b.id==='rome')).toBe(true);
  expect(getHistoricalState(270,{world}).activePolities.some(p=>p.id==='world-rome')).toBe(false);
  expect(getHistoricalState(350,{world}).boundaries.some(b=>b.id==='rome')).toBe(false);
});

test('Sixteen Kingdoms transition gaps stay unfilled while sourced neighbors remain visible', () => {
  expect(getHistoricalState(400).boundaries.map(b=>b.polityId)).toEqual(expect.arrayContaining(['western_qin','later_liang','southern_liang']));
  expect(getHistoricalState(400).boundaries.map(b=>b.polityId)).not.toContain('western_liang');
  expect(getHistoricalState(407).boundaries.map(b=>b.polityId)).toContain('western_liang');
  expect(getHistoricalState(400).boundaries.map(b=>b.polityId)).not.toContain('southern_yan');
  expect(getHistoricalState(402).boundaries.map(b=>b.polityId)).toContain('southern_yan');
  expect(getHistoricalState(360).boundaries.map(b=>b.polityId)).toContain('former_liang');
  expect(getHistoricalState(420).boundaries.map(b=>b.polityId)).toContain('northern_yan');
});

test('restoration and renamed-regime transition years do not repaint a maximum of the replaced name', () => {
  expect(getHistoricalState(705).boundaries.map(b=>b.polityId)).not.toContain('wu_zhou');
  expect(getHistoricalState(1636).boundaries.map(b=>b.polityId)).not.toContain('later_jin');
});

test('Western Qin is absent during its interruption, even when maximum fallback is enabled', () => {
  for (let year=401;year<=408;year++) {
    const state=getHistoricalState(year);
    expect(state.activePolities.map(p=>p.id)).not.toContain('western_qin');
    expect(state.boundaries.map(b=>b.polityId)).not.toContain('western_qin');
  }
  expect(getHistoricalState(409).activePolities.map(p=>p.id)).toContain('western_qin');
});
