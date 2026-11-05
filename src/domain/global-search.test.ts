import { expect, test } from 'vitest';
import { buildGlobalSearchIndex, type GlobalSearchData } from './global-search';
import type { HistoricalEvent, HeritageAsset, Person, Place, Polity } from './types';

const event: HistoricalEvent = { id: 'event-1', year: 100, title: '迁都长安', summary: '朝廷迁入新都', region: 'china', category: '迁都', sourceIds: ['source-1'] };
const person: Person = { id: 'person-1', name: '王某', aliases: ['王君'], birthYear: 50, roles: ['君主'], polityIds: ['world-polity'], description: '治理边疆地区。', sourceIds: ['source-1'] };
const polity: Polity = { id: 'world-polity', name: '西域政权', type: 'kingdom', startYear: 1, endYear: 200, region: 'world', color: '#000', description: '同期世界政权。', sourceIds: [] };
const place: Place = { id: 'changan', historicalName: '长安', aliases: ['西京'], modernName: '西安市', modernAdministrativeUnit: '陕西省', longitude: 108, latitude: 34, pointType: 'ancient-city-site', sourceIds: ['source-1'] };
const heritage: HeritageAsset = { id: 'palace', name: '宫城遗址', placeId: 'changan', type: 'palace', modernStatus: 'archaeological-site', description: '唐代宫殿遗址。', sourceIds: [] };

const data: GlobalSearchData = {
  events: [event], eventDetails: [], people: [person], personDetails: [], polities: [polity], polityDetails: [],
  places: [place], heritage: [heritage], heritageDetails: [{ heritageId: 'palace', modernLocation: '长安', historicalAssociations: ['王某曾在此活动'], associatedPolities: ['world-polity'], associatedEvents: [], associatedPeople: ['person-1'], survivingFeatures: ['宫墙'], presentDayValue: '城市遗产', sourceIds: ['source-1'], uncertaintyNote: '局部位置待核' }],
  claims: [], sources: [{ id: 'source-1', title: '稀有史料标题', scope: '人物与长安', note: '用于交叉核对。' }], capitalTerms: [{ polityId: 'world-polity', placeId: 'changan', validFrom: 1, validTo: 200, role: 'primary', status: 'formal', confidence: 'high', sourceIds: ['source-1'] }],
};

const index = () => buildGlobalSearchIndex(data, text => text);

test('finds modern city names once under their historical place and identifies the matched name', () => {
  const results = index().search('西安市');
  const placeResults = results.filter(result => result.type === 'place');
  expect(placeResults).toHaveLength(1);
  expect(placeResults[0]).toMatchObject({ type: 'place', id: 'changan', title: '长安', modernName: '西安市', matchKind: 'modern-name' });
});

test('searches linked source and detail text but returns only navigable parent entities', () => {
  const results = index().search('稀有史料标题');
  expect(results.map(result => result.type)).toEqual(['event', 'person', 'place', 'heritage']);
  expect(results.every(result => result.matchKind === 'related')).toBe(true);
  expect(results.every(result => result.entity !== undefined)).toBe(true);
});

test('maps region and namespaced category filters to each entity type', () => {
  const results = index().search('王某', { region: 'world', category: 'person:君主' });
  expect(results).toHaveLength(1);
  expect(results[0]).toMatchObject({ type: 'person', id: 'person-1' });
  expect(index().search('王某', { region: 'china', category: 'person:君主' })).toEqual([]);
  expect(index().search('迁都', { region: 'china', category: 'event:迁都' })).toHaveLength(1);
});

test('orders name matches ahead of content matches and offers namespaced category choices', () => {
  const results = index().search('长安');
  expect(results.map(result => result.type)).toEqual(['place', 'event', 'heritage', 'person']);
  expect(results[0]?.matchKind).toBe('name');
  expect(index().categories).toEqual(expect.arrayContaining([
    expect.objectContaining({ value: 'person:君主', label: '人物 · 君主' }),
    expect.objectContaining({ value: 'place:ancient-city-site', label: '地点 · 古城/都城遗址' }),
  ]));
});
