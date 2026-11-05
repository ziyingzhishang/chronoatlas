import { expect, test } from 'vitest';
import { boundaryCatalog } from './boundaries';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { eventDetails } from './event-details';
import { places } from './places';
import { polities } from './polities';
import { getHistoricalState } from '../domain/history-state';
import { polityDisplayName } from '../presentation/map-status';
import { buildLocalMapData } from '../map/history-map';
import coevalReview from '../../docs/audits/topics/later-yan-qin-founding-384-386.json';
import westernYanAnnual from '../../docs/audits/out-of-ledger/western-yan-384-394.json';

const source = {
  polities,
  boundaries: boundaryCatalog,
  events,
  places,
  capitalTerms: capitalHistory,
  modernSovereignty: [],
};

test.each([
  [384, []],
  [385, ['changan']],
  [386, ['changzi_western_yan']],
  [387, ['changzi_western_yan']],
  [393, ['changzi_western_yan']],
  [394, []],
] as const)('projects only evidenced Western Yan centers in %s', (year, expectedPlaceIds) => {
  const state = getHistoricalState(source, year);
  const expected = new Set<string>(expectedPlaceIds);

  expect(state.activePolities.map((polity) => polity.id)).toContain('western_yan');
  expect((state.capitalTerms ?? []).filter((term) => term.polityId === 'western_yan').map((term) => term.placeId))
    .toEqual(expectedPlaceIds);
  expect(state.places.filter((place) => expected.has(place.id)).map((place) => place.id))
    .toEqual(expectedPlaceIds);
  expect(state.boundaries.filter((boundary) => boundary.polityId === 'western_yan')).toEqual([]);
  expect(state.coverage.missingPolityIds).toContain('western_yan');
});

test.each([
  [384, '西燕'],
  [385, '西燕'],
  [386, '西燕'],
  [387, '西燕—后燕并存；长子为西燕政治中心'],
  [392, '翟钊奔长子；西燕、后燕并存'],
  [394, '西燕终止；台壁败、长子陷落'],
] as const)('shows Western Yan in the annual map status for %s', (year, expectedLabel) => {
  const state = getHistoricalState(source, year);
  expect(polityDisplayName(state.activePolities, year)).toContain(expectedLabel);
});

test('maps the Longzi stage as a regional reference point with the source coordinates', () => {
  expect(places.find((place) => place.id === 'changzi_western_yan')).toMatchObject({
    longitude: 112.86315,
    latitude: 36.11639,
    pointType: 'regional-reference',
    mappingStatus: 'regional',
    confidence: 'low',
  });
});

test('renders the coexisting 386 stage centers together without inventing their territory polygons', () => {
  const year = 386;
  const state = getHistoricalState(source, year);
  const mapData = buildLocalMapData(state);
  const expectedCenters = new Map([
    ['western_yan', 'changzi_western_yan'],
    ['later_liang', 'guzang'],
    ['wei_northern', 'shengle'],
  ]);

  for (const [polityId, placeId] of expectedCenters) {
    expect(state.activePolities.map((polity) => polity.id)).toContain(polityId);
    expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry: expect.objectContaining({ type: 'Point' }),
      properties: expect.objectContaining({ polityId, placeId }),
    }));
    expect(mapData.boundaries.features.some((feature) => feature.properties?.polityId === polityId
      && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'))).toBe(false);
  }

  expect(polityDisplayName(state.activePolities, year)).toContain('西燕');
  expect(polityDisplayName(state.activePolities, year)).toContain('后凉');
  expect(polityDisplayName(state.activePolities, year)).toContain('北魏');
});

test('keeps the shared 384–386 audit consistent with the reviewed Western Yan map points', () => {
  const coexistenceNote = coevalReview.coexistenceNotes.join(' ');

  expect(coexistenceNote).toContain('385年显示长安阶段中心点');
  expect(coexistenceNote).toContain('386年显示长子年末阶段中心点');
  expect(coexistenceNote).toContain('不显示疆域面');
  expect(coexistenceNote).not.toContain('西燕暂不显示中心点');
});

test('projects every Western Yan annual audit row without carrying centers or polygons into unsupported years', () => {
  expect(westernYanAnnual.years.map((row) => row.year)).toEqual(
    Array.from({ length: 11 }, (_, index) => 384 + index),
  );

  for (const row of westernYanAnnual.years) {
    const state = getHistoricalState(source, row.year);
    const mapData = buildLocalMapData(state);
    const points = mapData.capitalPlaces.features
      .filter((feature) => feature.properties?.polityId === 'western_yan');
    const polygons = mapData.boundaries.features.filter((feature) => (
      feature.properties?.polityId === 'western_yan'
      && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')
    ));

    expect(state.activePolities.map((polity) => polity.id), `${row.year} active`).toContain('western_yan');
    expect(row.territoryBoundary, `${row.year} annual boundary`).toBeNull();
    expect(row.sourceBoundaryIds, `${row.year} source boundaries`).toEqual([]);
    expect(points.map((feature) => feature.properties?.placeId), `${row.year} center`).toEqual(
      row.centerPlaceId ? [row.centerPlaceId] : [],
    );
    expect(polygons, `${row.year} polygons`).toEqual([]);
  }
});

test('records competing Taibi location studies without inventing a 394 event point', () => {
  const year = westernYanAnnual.years.find((row) => row.year === 394)!;
  const state = getHistoricalState(source, 394);
  const mapData = buildLocalMapData(state);
  const event = events.find((item) => item.id === 'western-yan-ended-394')!;
  const eventDetail = eventDetails.find((item) => item.eventId === event.id)!;

  expect(year.sourceIds).toEqual(expect.arrayContaining([
    'shui-jing-zhu-taibi-location',
    'licheng-gazetteer-taibi-location',
    'xu-ning-taibi-location-study',
  ]));
  expect(year.evidenceGap).toContain('北台村');
  expect(year.evidenceGap).toContain('县东十五里');
  expect(year.mapExpression).toBe('historical-conclusion-only');
  expect(year.centerPlaceId).toBeNull();
  expect(event.coordinates).toBeUndefined();
  expect(event.locationPrecision).toBeUndefined();
  expect(eventDetail.sourceIds).toEqual(expect.arrayContaining(year.sourceIds));
  expect(eventDetail.locationIds).toEqual([]);
  expect(mapData.events.features.some((feature) => feature.properties?.entityId === event.id)).toBe(false);
});

test.each([
  [384, []],
  [385, ['changan']],
  [386, ['changzi_western_yan']],
  [393, ['changzi_western_yan']],
  [394, []],
] as const)('renders only the annual Western Yan center point in %s', (year, expectedPlaceIds) => {
  const state = getHistoricalState(source, year);
  const mapData = buildLocalMapData(state);
  const westernYanPoints = mapData.capitalPlaces.features
    .filter((point) => point.properties?.polityId === 'western_yan');

  expect(westernYanPoints.map((point) => point.properties?.placeId)).toEqual(expectedPlaceIds);
  expect(westernYanPoints.every((point) => point.geometry.type === 'Point')).toBe(true);
  expect(mapData.boundaries.features.some((boundary) => boundary.properties?.polityId === 'western_yan')).toBe(false);
});
