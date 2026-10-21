import { expect, test } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { buildMapData, createMapStyle } from './history-map';
import { localizeState } from '../i18n/content';

test('map data follows the year and keeps stable entity identifiers', () => {
  const tang = buildMapData(getHistoricalState(800));
  const song = buildMapData(getHistoricalState(1100));
  expect(tang.boundaries.features.some(f => f.properties?.polityId === 'tang')).toBe(true);
  expect(song.boundaries.features.some(f => f.properties?.polityId === 'tang')).toBe(false);
  expect(song.boundaries.features.some(f => f.properties?.polityId === 'song_northern')).toBe(true);
  expect(tang.places.features.find(f => f.properties?.entityId === 'xianyang')?.geometry.coordinates).toEqual([108.7, 34.33]);
});

test('separates local and world boundaries into independent sources',()=>{
  const state=getHistoricalState(800);
  const localPolity=state.activePolities[0];
  const localBoundary=state.boundaries.find(boundary=>boundary.polityId===localPolity.id)!;
  state.activePolities.push({...localPolity,id:'world-test',region:'world'});
  state.boundaries.push({...localBoundary,id:'world-boundary',polityId:'world-test'});
  const data=buildMapData(state);
  expect(data.boundaries.features.some(feature=>feature.properties?.polityId==='world-test')).toBe(false);
  expect(data.worldBoundaries.features.map(feature=>feature.properties?.polityId)).toEqual(['world-test']);
  expect(data.polityLabels.features).not.toContainEqual(expect.objectContaining({properties:expect.objectContaining({entityId:'world-test'})}));
  expect(data.worldPolityLabels.features.map(feature=>feature.properties?.entityId)).toEqual(['world-test']);
  expect(createMapStyle().sources).toHaveProperty('worldBoundaries');
  expect(createMapStyle().sources).toHaveProperty('worldPolityLabels');
});

test('polity labels stay near their geographic footprint regardless of polygon winding', () => {
  const state = getHistoricalState(800);
  expect(buildMapData(state).polityLabels.features.length).toBeGreaterThan(0);
  for (const label of buildMapData(state).polityLabels.features) {
    expect(label.geometry.coordinates[0]).toBeGreaterThan(70);
    expect(label.geometry.coordinates[0]).toBeLessThan(140);
    expect(label.geometry.coordinates[1]).toBeGreaterThan(10);
    expect(label.geometry.coordinates[1]).toBeLessThan(60);
  }
});

test('unlocated historical events are not invented on the map', () => {
  const state = getHistoricalState(-221);
  state.events = [{ id: 'unknown', year: -221, title: '未知位置', summary: '', sourceIds: [] }];
  expect(buildMapData(state).events.features).toEqual([]);
});

test('only explicitly located events get map markers, not an inherited legacy place',()=>{
  const state=getHistoricalState(800);
  state.events=[{id:'legacy',year:800,title:'旧记录',summary:'',placeId:'changan',sourceIds:[]},{id:'located',year:800,title:'有位置',summary:'',coordinates:[100,30],locationPrecision:'approximate',sourceIds:[]}];
  expect(buildMapData(state).events.features.map(f=>f.properties?.entityId)).toEqual(['located']);
  expect(buildMapData(state).events.features[0].geometry.coordinates).toEqual([100,30]);
});

test('the basemap can fall back to local land while history remains above both raster layers', () => {
  const style = createMapStyle();
  expect(style.sources['land'].type).toBe('geojson');
  for (const id of ['relief', 'satellite']) {
    const source = style.sources[id];
    expect(source.type).toBe('raster');
    if (source.type === 'raster') expect(source.tiles?.[0]).toContain('/tile/{z}/{y}/{x}');
    expect(style.layers.findIndex(l => l.id === `${id}-raster`)).toBeLessThan(style.layers.findIndex(l => l.id === 'boundary-fill'));
  }
});

test('modern Taiwan reference is a separate year-gated map source', () => {
  expect(buildMapData(getHistoricalState(1948)).modernSovereignty.features).toHaveLength(0);
  expect(buildMapData(getHistoricalState(1949)).modernSovereignty.features[0].properties).toMatchObject({
    sovereigntyGroup: 'china',
    administrativeLabel: '台湾省',
  });
  const style = createMapStyle();
  expect(style.sources).toHaveProperty('modernSovereignty');
  expect(style.layers.find(layer => layer.id === 'modern-sovereignty-fill')).toBeDefined();
});

test('the selected maximum style preserves uncertainty dashes',()=>{
  const layer=createMapStyle().layers.find(l=>l.id==='boundary-maximum-selected');
  expect(layer).toMatchObject({type:'line',paint:{'line-dasharray':[4,3]}});
});

test('maximum and modern-reference labels use the supplied display translator',()=>{
  const state=getHistoricalState(937);
  const base=state.boundaries[0];
  state.boundaries.push({...base,id:'test-southern-tang-maximum',polityId:'southern_tang',validFrom:937,validTo:959,snapshotYear:937,presentation:'maximum',evidence:{...base.evidence,evidenceLevel:'C',derivation:'maximum-record',reviewStatus:'pending'}});
  const data=buildMapData(state,text=>text==='〔最大参考〕'?' [maximum reference]':text==='今·'?'Modern: ':text);
  expect(data.polityLabels.features.some(f=>f.properties?.name.includes('[maximum reference]'))).toBe(true);
  const places=buildMapData(getHistoricalState(800),text=>text==='今·'?'Modern: ':text).places;
  expect(places.features.find(f=>f.properties?.modernName)?.properties?.modernName).toMatch(/^Modern: /);
});

test('map labels use the compact localized entity label',()=>{
  const state=getHistoricalState(800);
  const original=state.activePolities[0];
  state.activePolities=[{...original,id:'world-unknown',region:'world',name:'Unmapped Realm',originalName:'Unmapped Realm'}];
  state.boundaries=[{...state.boundaries[0],polityId:'world-unknown'}];
  const localized=localizeState(state,'zh-CN');
  expect(localized.activePolities[0].name).toBe('原名：Unmapped Realm（中文译名待核验）');
  expect(buildMapData(localized).worldPolityLabels.features[0].properties?.name).toBe('Unmapped Realm〔译名待核验〕');
});

test('selection keeps indirect, disputed and influence boundaries dashed',()=>{
  const style=createMapStyle();
  const solid=style.layers.find(l=>l.id==='boundary-selected');
  expect(solid).toMatchObject({filter:['all',['==',['get','evidenceLevel'],'A'],['in',['get','controlType'],['literal',['direct','unspecified']]],['==',['get','entityId'],'']]});
  for(const [type,dash] of [['indirect',[6,3]],['disputed',[3,3]],['influence',[1,2]]] as const){
    expect(style.layers.find(l=>l.id===`boundary-${type}-selected`)).toMatchObject({type:'line',paint:{'line-dasharray':dash},filter:['all',['!=',['get','maximum'],true],['==',['get','controlType'],type],['==',['get','entityId'],'']]});
  }
});

test('map features expose evidence metadata and style layers preserve B/C/D distinctions', () => {
  const state = getHistoricalState(800);
  state.boundaries = [
    {...state.boundaries[0], evidence:{...state.boundaries[0].evidence, evidenceLevel:'B', derivation:'licensed-digitization'}},
  ];
  expect(buildMapData(state).boundaries.features[0].properties).toMatchObject({
    evidenceLevel:'B', derivation:'licensed-digitization', reviewStatus:'source-checked',
  });
  const style = createMapStyle();
  expect(style.layers.find(layer=>layer.id==='boundary-digitized')).toMatchObject({
    type:'line', paint:{'line-dasharray':[8,2,2,2]},
  });
  expect(style.layers.find(layer=>layer.id==='boundary-d-centers')).toMatchObject({type:'circle'});
  expect(style.layers.find(layer=>layer.id==='boundary-d-area')).toMatchObject({type:'fill'});
});
