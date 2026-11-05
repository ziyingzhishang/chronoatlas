import { expect, test } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { isDefiniteBoundary } from '../domain/boundary-evidence';
import { buildLocalMapData } from '../map/history-map';
import { boundaryCatalog } from './boundaries';
import { boundaryGeometryConflicts } from './boundary-conflicts';
import audit from '../../internal/audits/coverage-audit.json';
import coverageDecisions from './coverage-decisions.json';
import { eventDetails } from './event-details';
import { events } from './events';
import { capitalHistory } from './capital-history';
import { places } from './places';
import { sourceNotes } from './sources';
import xiaAnnualAudit from '../../docs/audits/topics/xia-early-cultural-core-annual-2070-1600.json';
import southernYanAnnualAudit from '../../docs/audits/topics/southern-yan-founding-398-401.json';
import southernYanTerminationAudit from '../../docs/audits/topics/southern-yan-termination-410.json';
import westernLiangAnnualAudit from '../../docs/audits/topics/western-liang-founding-400-406.json';
import westernLiangTerminationAudit from '../../docs/audits/topics/western-liang-termination-410-421.json';
import northernYanAnnualAudit from '../../docs/audits/topics/northern-yan-founding-407-409.json';
import xiaFoundingAnnualAudit from '../../docs/audits/topics/xia-founding-407-409.json';
import northernWeiFoundingAnnualAudit from '../../docs/audits/topics/northern-wei-founding-386.json';
import northernWeiTerminationAnnualAudit from '../../docs/audits/topics/northern-wei-termination-534.json';
import liuSongFoundingAnnualAudit from '../../docs/audits/topics/liu-song-founding-420-425.json';
import southernQiFoundingAnnualAudit from '../../docs/audits/topics/southern-qi-founding-479.json';
import southernLiangFoundingAnnualAudit from '../../docs/audits/topics/southern-liang-founding-502-509.json';
import southernChenFoundingAnnualAudit from '../../docs/audits/topics/southern-chen-founding-557-560.json';
import northernZhouFoundingAnnualAudit from '../../docs/audits/topics/northern-zhou-founding-557-560.json';
import northernQiFoundingAnnualAudit from '../../docs/audits/topics/northern-qi-founding-550-554.json';
import firstTurkicKhaganateFoundingAnnualAudit from '../../docs/audits/topics/turkic-founding-552-554.json';
import laterTurkicKhaganateAnnualAudit from '../../docs/audits/topics/turkic-khaganates-661-744.json';
import earlyTibetanAnnualAudit from '../../docs/audits/topics/tibetan-empire-early-formation-618-622.json';
import nanzhaoAnnualAudit from '../../docs/audits/topics/nanzhao-early-territorial-gap-738-740.json';
import westernZhouAnnualAudit from '../../docs/audits/topics/western-zhou-annual-1046-1001.json';
import southernMing1644AnnualAudit from '../../docs/audits/topics/southern-ming-formation-1644.json';
import southernMingEndAnnualAudit from '../../docs/audits/topics/southern-ming-termination-1659-1662.json';
import laterJinFoundingAnnualAudit from '../../docs/audits/topics/later-jin-founding-1616-1618.json';
import laterJin1636AnnualAudit from '../../docs/audits/topics/later-jin-termination-1636.json';
import qingTerminationAnnualAudit from '../../docs/audits/topics/qing-termination-1912.json';
import republicWarlordEraAnnualAudit from '../../docs/audits/topics/republic-warlord-era-1916-1929.json';
import prcFounding1949AnnualAudit from '../../docs/audits/topics/prc-founding-1949.json';
import prcCurrentReferenceAnnualAudit from '../../docs/audits/topics/prc-current-reference-2025-2026.json';
import northernQiTerminationAnnualAudit from '../../docs/audits/topics/northern-qi-termination-577.json';
import suiFoundingAnnualAudit from '../../docs/audits/topics/sui-founding-581-586.json';
import tangFoundingAnnualAudit from '../../docs/audits/topics/tang-founding-618-622.json';
import laterLiangFoundingAnnualAudit from '../../docs/audits/topics/later-liang-907-910.json';
import laterTangFoundingAnnualAudit from '../../docs/audits/topics/later-tang-founding-923-925.json';
import laterTangTerminationAnnualAudit from '../../docs/audits/topics/later-tang-termination-936.json';
import laterJinTerminationAnnualAudit from '../../docs/audits/topics/later-jin-termination-947.json';
import laterZhouFoundingAnnualAudit from '../../docs/audits/topics/later-zhou-territorial-gap-951-959.json';
import northernHanAnnualAudit from '../../docs/audits/topics/northern-han-establishment-and-early-wars-951-959.json';
import xiongnuFormationAnnualAudit from '../../docs/audits/topics/xiongnu-formation-209-bce.json';
import goguryeoFoundingAnnualAudit from '../../docs/audits/topics/goguryeo-founding-37-bce.json';
import laterQinTermination417AnnualAudit from '../../docs/audits/topics/later-qin-termination-417.json';
import sillaEarlyGapAnnualAudit from '../../docs/audits/topics/silla-early-gap-57-bce-377.json';
import northernSongAnnualAudit from '../../docs/audits/topics/northern-song-founding-960.json';
import southernSongAnnualAudit from '../../docs/audits/topics/southern-song-southward-1127-1138.json';
import southernSongTerminationAudit from '../../docs/audits/topics/southern-song-termination-1279.json';
import westernXiaTerminationAudit from '../../docs/audits/topics/western-xia-termination-1227.json';
import jurchenJinAnnualAudit from '../../docs/audits/topics/jurchen-jin-founding-1115-1125.json';
import westernLiaoAnnualAudit from '../../docs/audits/topics/western-liao-migration-1124-1125.json';
import hedongJinAnnualAudit from '../../docs/audits/out-of-ledger/hedong-jin-907-923.json';
import daliEarlyAnnualAudit from '../../docs/audits/topics/dali-early-polity-937-946.json';
import yuanAnnualAudit from '../../docs/audits/topics/yuan-state-transition-1271-1293.json';
import mingNorthernYuanAnnualAudit from '../../docs/audits/topics/ming-northern-yuan-formation-1368-1374.json';
import northernYuanYesenAnnualAudit from '../../docs/audits/topics/northern-yuan-yesen-1440-1467.json';
import hanWarringTerminationAudit from '../../docs/audits/topics/han-warring-termination-230.json';
import chuWarringTerminationAudit from '../../docs/audits/topics/chu-warring-termination-223.json';
import yanWarringTerminationAudit from '../../docs/audits/topics/yan-warring-termination-222.json';
import qinUnificationAnnualAudit from '../../docs/audits/topics/qin-unification-221-219.json';
import qinCollapseAnnualAudit from '../../docs/audits/topics/qin-collapse-208-206.json';
import hanKingChuhanAnnualAudit from '../../docs/audits/topics/han-king-chuhan-206-203.json';
import hanXinTransitionAnnualAudit from '../../docs/audits/topics/han-xin-transition-6-9.json';
import easternHanFoundingAnnualAudit from '../../docs/audits/topics/eastern-han-founding-25-29.json';
import threeKingdomsFormationAnnualAudit from '../../docs/audits/topics/three-kingdoms-formation-220-223.json';
import threeKingdomsTerminationAnnualAudit from '../../docs/audits/topics/three-kingdoms-terminations-263-265.json';
import weiShuTransition263Audit from '../../docs/audits/out-of-ledger/wei-shu-transition-263.json';
import chengHanFoundingAnnualAudit from '../../docs/audits/topics/cheng-han-founding-304-305.json';
import chengHanFallAnnualAudit from '../../docs/audits/topics/cheng-han-fall-347.json';
import formerZhaoFoundingAnnualAudit from '../../docs/audits/topics/former-zhao-founding-304-305.json';
import laterZhaoAnnualAudit from '../../docs/audits/topics/later-zhao-319-336.json';
import formerQinFoundingAnnualAudit from '../../docs/audits/topics/former-qin-founding-351-352.json';
import formerQinTerminationAnnualAudit from '../../docs/audits/topics/former-qin-termination-394.json';
import coevalBoundaryOverlap394Audit from '../../docs/audits/topics/coeval-boundary-overlaps-394.json';
import laterYanQinAnnualAudit from '../../docs/audits/topics/later-yan-qin-founding-384-386.json';

test('Xia is represented by a D cultural-core point, not a national border', () => {
  const state = getHistoricalState(-1700);
  const xia = state.boundaries.find(boundary => boundary.polityId === 'xia_early');

  expect(xia).toMatchObject({
    geometry: {type:'Point'},
    evidence: {evidenceLevel:'D', derivation:'cultural-core'},
  });
  expect(state.boundaries.filter(isDefiniteBoundary)).toHaveLength(0);
});

test('Xia annual display limits the Erlitou core to its archaeological chronology', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-xia_early--2070--1600');
  expect(decision?.citationIds).toContain('erlitou-chronology-cass-2022');
  expect(sourceNotes.map(source => source.id)).toContain('erlitou-chronology-cass-2022');
  expect(xiaAnnualAudit.yearCount).toBe(471);
  expect(xiaAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 471}, (_, index) => -2070 + index),
  );
  expect(xiaAnnualAudit.years.some(row => row.year === 0)).toBe(false);

  for (let year = -2070; year <= -1600; year++) {
    const xia = getHistoricalState(year).boundaries.find(boundary => boundary.polityId === 'xia_early');
    const row = xiaAnnualAudit.years[year + 2070];
    expect(row.evidenceGap, `missing annual evidence gap in ${year}`).toBeTruthy();
    if (year < -1750) {
      expect(row).toMatchObject({mapExpression: 'leave-unfilled', directBoundary: null});
      expect(xia, `Erlitou point should not predate its archaeological range in ${year}`).toBeUndefined();
    } else {
      expect(row).toMatchObject({mapExpression: 'cultural-core-point', directBoundary: null});
      expect(isDefiniteBoundary(xia!), `unexpected definite Xia border in ${year}`).toBe(false);
      expect(xia, `missing cultural-core point in ${year}`).toMatchObject({
        geometry: {type: 'Point', coordinates: [112.70, 34.70]},
        evidence: {evidenceLevel: 'D', derivation: 'cultural-core', reviewStatus: 'source-checked'},
      });
    }
  }
});

test('coverage audit distinguishes visual D records from definite boundaries', () => {
  for (const polityId of ['xia_early', 'gengshi']) {
    expect(audit.find(item => item.id === polityId)).toMatchObject({
      visualRecords: expect.any(Number),
      definiteBoundaryRecords: 0,
      nonBoundaryRepresentations: expect.arrayContaining([expect.any(String)]),
    });
    expect(audit.find(item => item.id === polityId)!.visualRecords).toBeGreaterThan(0);
  }
});

test('Gengshi uses dated control centers without a closed polygon', () => {
  const year23 = getHistoricalState(23).boundaries.find(boundary => boundary.polityId === 'gengshi');
  const year24 = getHistoricalState(24).boundaries.find(boundary => boundary.polityId === 'gengshi');

  expect(year23).toMatchObject({geometry:{type:'MultiPoint'}, evidence:{evidenceLevel:'D', derivation:'control-centers'}});
  expect(year24).toMatchObject({geometry:{type:'MultiPoint'}, evidence:{evidenceLevel:'D', derivation:'control-centers'}});
  expect((year23?.geometry as GeoJSON.MultiPoint).coordinates).not.toEqual((year24?.geometry as GeoJSON.MultiPoint).coordinates);
  expect([year23, year24].filter((boundary): boundary is NonNullable<typeof boundary> => !!boundary).every(boundary => !isDefiniteBoundary(boundary))).toBe(true);
});

test('Southern Yan shows source-supported centers and marks the 399 Guanggu destination without a yearly center', () => {
  const expected = new Map<number, GeoJSON.Point | GeoJSON.MultiPoint>([
    [398, {type: 'Point', coordinates: [114.46, 35.58]}],
    [400, {type: 'Point', coordinates: [118.48, 36.70]}],
    [401, {type: 'Point', coordinates: [118.48, 36.70]}],
  ]);
  expect(southernYanAnnualAudit.yearCount).toBe(4);
  expect(southernYanAnnualAudit.years.map(row => row.year)).toEqual([398, 399, 400, 401]);
  expect(southernYanAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(southernYanAnnualAudit.years[1]).toMatchObject({
    mapExpression: 'guanggu-destination-event-point-no-annual-center', capitalPlaceId: null, territoryBoundary: null,
  });
  const transitionState = getHistoricalState(399);
  expect(transitionState.boundaries.some(boundary => boundary.polityId === 'southern_yan')).toBe(false);
  expect(buildLocalMapData(transitionState).boundaries.features.some(feature => feature.properties?.polityId === 'southern_yan')).toBe(false);
  expect(buildLocalMapData(transitionState).events.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [118.48, 36.70]},
    properties: expect.objectContaining({entityId: 'southern-yan-moved-to-guanggu-399'}),
  }));
  for (const [year, coordinates] of expected) {
    const state = getHistoricalState(year);
    const yan = state.boundaries.find(boundary => boundary.polityId === 'southern_yan');
    expect(yan, `南燕${year}年的政治中心参照`).toMatchObject({
      geometry: coordinates,
      evidence: {evidenceLevel: 'D', derivation: 'control-centers', reviewStatus: 'source-checked'},
    });
    expect(isDefiniteBoundary(yan!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry: coordinates,
      properties: expect.objectContaining({polityId: 'southern_yan', evidenceLevel: 'D', derivation: 'control-centers'}),
    }));
  }
  expect(coverageDecisions.find(item => item.id === 'gap-southern_yan-398-401'))
    .toMatchObject({verdict: 'control-centers', sourceBoundaryIds: []});
  expect(coverageDecisions.find(item => item.id === 'gap-southern_yan-398-401')?.rationale)
    .toContain('clio-1627-southern_yan-402');
  expect(capitalHistory.filter(item => item.polityId === 'southern_yan'))
    .toEqual(expect.arrayContaining([
      expect.objectContaining({placeId: 'huatai', validFrom: 398, validTo: 398}),
      expect.objectContaining({placeId: 'guanggu', validFrom: 400, validTo: 410}),
    ]));
});

test('Western Liang annual audit shows only dated political centers and no inferred border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-western_liang-400-406');
  expect(decision).toMatchObject({annualAudit:'docs/audits/topics/western-liang-founding-400-406.json'});
  expect(decision?.rationale).toContain('clio-1651-western_liang-407');
  expect(westernLiangAnnualAudit.yearCount).toBe(7);
  expect(westernLiangAnnualAudit.years.map(row => row.year)).toEqual([400, 401, 402, 403, 404, 405, 406]);
  expect(westernLiangAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(westernLiangAnnualAudit.years.slice(0, 5).every(row => row.capitalPlaceId === 'dunhuang')).toBe(true);
  expect(westernLiangAnnualAudit.years.slice(5).every(row => row.capitalPlaceId === 'jiuquan')).toBe(true);
  expect(westernLiangAnnualAudit.years.every(row => row.sourceIds.every(sourceId => decision?.citationIds.includes(sourceId)))).toBe(true);

  for (let year = 400; year <= 406; year++) {
    const state = getHistoricalState(year);
    const westernLiang = state.boundaries.find(boundary => boundary.polityId === 'western_liang');
    const expectedCapital = year < 405 ? 'dunhuang' : 'jiuquan';
    expect(westernLiang, `西凉${year}年中心表达`).toMatchObject({
      geometry: {type: 'Point'},
      evidence: {evidenceLevel: 'D', derivation: 'control-centers'},
    });
    expect(isDefiniteBoundary(westernLiang!)).toBe(false);
    expect((westernLiang!.geometry as GeoJSON.Point).coordinates).toEqual(
      [places.find(place => place.id === expectedCapital)?.longitude,
        places.find(place => place.id === expectedCapital)?.latitude],
    );
    expect(buildLocalMapData(state).boundaries.features.some(feature =>
      feature.properties?.polityId === 'western_liang' && feature.geometry.type !== 'Point'))
      .toBe(false);
  }
});

test('Western Liang termination audit suppresses the unstable 420 transition and marks the 421 terminal center', () => {
  expect(westernLiangTerminationAudit.yearCount).toBe(12);
  expect(westernLiangTerminationAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 12}, (_, index) => 410 + index),
  );
  expect(westernLiangTerminationAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(westernLiangTerminationAudit.years.find(row => row.year === 420)).toMatchObject({
    mapExpression: 'leave-unfilled', capitalPlaceId: null,
  });
  expect(westernLiangTerminationAudit.years.find(row => row.year === 421)).toMatchObject({
    mapExpression: 'terminal-control-center-point', capitalPlaceId: 'dunhuang',
  });

  for (let year = 410; year <= 421; year++) {
    const state = getHistoricalState(year);
    const westernLiang = state.boundaries.find(boundary => boundary.polityId === 'western_liang');
    if (year === 420) {
      expect(westernLiang, '420年酒泉失守至李恂据敦煌的年内转换不可压成单点').toBeUndefined();
      expect(buildLocalMapData(state).boundaries.features.some(feature =>
        feature.properties?.polityId === 'western_liang')).toBe(false);
      continue;
    }
    const expectedPlace = year === 421 ? 'dunhuang' : 'jiuquan';
    const place = places.find(item => item.id === expectedPlace)!;
    expect(westernLiang, `西凉${year}年中心表达`).toMatchObject({
      geometry: {type: 'Point'}, evidence: {evidenceLevel: 'D', derivation: 'control-centers'},
    });
    expect(isDefiniteBoundary(westernLiang!)).toBe(false);
    expect((westernLiang!.geometry as GeoJSON.Point).coordinates).toEqual([place.longitude, place.latitude]);
    expect(buildLocalMapData(state).boundaries.features.some(feature =>
      feature.properties?.polityId === 'western_liang' && feature.geometry.type !== 'Point')).toBe(false);
  }
});

test('Northern Yan formation shows Longcheng as a regional center through the 409 succession without inferring borders', () => {
  expect(northernYanAnnualAudit.yearCount).toBe(3);
  expect(northernYanAnnualAudit.years.map(row => row.year)).toEqual([407, 408, 409]);
  expect(northernYanAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(northernYanAnnualAudit.years.every(row => row.sourceIds.includes('zizhi-tongjian-vol114-115-northern-yan'))).toBe(true);
  expect(coverageDecisions.find(item => item.id === 'gap-northern_yan-407-409')?.rationale)
    .toContain('clio-1657-northern_yan-410');
  expect(sourceNotes.find(source => source.id === 'zizhi-tongjian-vol114-115-northern-yan')?.urlOrCitation)
    .toContain('卷114');
  for (let year = 407; year <= 409; year++) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    const northernYan = state.boundaries.find(boundary => boundary.polityId === 'northern_yan');
    expect(northernYan, `北燕${year}年龙城区域中心`).toMatchObject({
      geometry: {type: 'Point'}, evidence: {evidenceLevel: 'D', derivation: 'control-centers'},
    });
    expect(isDefiniteBoundary(northernYan!)).toBe(false);
    expect(northernYan?.sourceUrl).toContain(year === 409 ? '卷115' : '卷114');
    expect((northernYan!.geometry as GeoJSON.Point).coordinates).toEqual([
      places.find(place => place.id === 'longcheng')?.longitude,
      places.find(place => place.id === 'longcheng')?.latitude,
    ]);
    expect(map.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:(northernYan!.geometry as GeoJSON.Point).coordinates},
      properties:expect.objectContaining({polityId:'northern_yan',placeId:'longcheng'}),
    }));
    expect(buildLocalMapData(state).boundaries.features.some(feature =>
      feature.properties?.polityId === 'northern_yan' && feature.geometry.type !== 'Point'))
      .toBe(false);
  }
});

test('Southern Yan termination year shows Guanggu as an event center without a border', () => {
  const state = getHistoricalState(410);
  const yan = state.boundaries.find(boundary => boundary.id === 'special-southern-yan-410-termination-center');
  expect(southernYanTerminationAudit.yearCount).toBe(1);
  expect(southernYanTerminationAudit.years[0]).toMatchObject({year: 410, mapExpression: 'control-center-point', capitalPlaceId: 'guanggu', territoryBoundary: null});
  expect(coverageDecisions.find(item => item.id === 'gap-southern_yan-410-410'))
    .toMatchObject({verdict: 'control-centers', sourceBoundaryIds: []});
  expect(yan).toMatchObject({
    geometry: {type: 'Point', coordinates: [118.48, 36.70]},
    evidence: {evidenceLevel: 'D', derivation: 'control-centers', reviewStatus: 'source-checked'},
  });
  expect(isDefiniteBoundary(yan!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [118.48, 36.70]},
    properties: expect.objectContaining({polityId: 'southern_yan', evidenceLevel: 'D', derivation: 'control-centers'}),
  }));
});

test('Qin unification years show Xianyang as a control center without inventing a border', () => {
  expect(qinUnificationAnnualAudit.decisionId).toBe('gap-qin--221--219');
  expect(qinUnificationAnnualAudit.years.map(row => row.year)).toEqual([-221, -220, -219]);
  expect(qinUnificationAnnualAudit.years.every(row => row.mapExpression === 'control-center-point'
    && row.centerPlaceId === 'xianyang'
    && row.territoryBoundary === null
    && row.sourceIds.includes('qin-dynasty-territory-map-221-206-cc0')
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(qinUnificationAnnualAudit.sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    [...new Set(qinUnificationAnnualAudit.years.flatMap(row => row.sourceIds))],
  ));
  expect(qinUnificationAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'qin-dynasty-territory-map-221-206-cc0',
    use:expect.stringContaining('不作为前221—前219年逐年疆界'),
  }));
  expect(qinUnificationAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'jiangshan-qin-map-phase-221-216',
    use:expect.stringContaining('代表快照为前218年'),
  }));
  expect(new Set(qinUnificationAnnualAudit.years.map(row => row.conclusion)).size).toBe(3);
  const qinDecision = coverageDecisions.find(item => item.id === qinUnificationAnnualAudit.decisionId);
  expect(qinDecision)
    .toMatchObject({verdict: 'leave-unfilled', sourceBoundaryIds: []});
  expect(qinDecision?.citationIds).toContain('jiangshan-qin-map-phase-221-216');
  for (const year of [-221, -220, -219]) {
    const state = getHistoricalState(year);
    const qinRecords = state.boundaries.filter(boundary => boundary.polityId === 'qin');
    const qin = qinRecords.find(boundary => boundary.geometry.type === 'Point');
    expect(qinRecords.every(boundary => boundary.geometry.type === 'Point')).toBe(true);
    expect(qinRecords.every(boundary => !isDefiniteBoundary(boundary))).toBe(true);
    expect(qin, `秦在${year}年的控制中心`).toMatchObject({
      geometry: {type:'Point', coordinates:[108.70, 34.33]},
      evidence: {evidenceLevel:'D', derivation:'control-centers', reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(qin!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry: {type:'Point', coordinates:[108.70, 34.33]},
      properties: expect.objectContaining({polityId:'qin', evidenceLevel:'D', derivation:'control-centers'}),
    }));
  }
});

test('Qin collapse records the weakly held new territories without drawing them as borders', () => {
  expect(qinCollapseAnnualAudit.years.map(row => row.year)).toEqual([-208, -207, -206]);
  expect(qinCollapseAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  for (const year of [-208, -207]) {
    const row = qinCollapseAnnualAudit.years.find(item => item.year === year)!;
    expect(row.sourceIds).toContain('qin-regional-control-lander');
    expect(row.conclusion).toContain('新征区域');
    const state = getHistoricalState(year);
    const qinGeometry = state.boundaries.filter(item => item.polityId === 'qin');
    expect(qinGeometry.some(item => item.geometry.type === 'Point')).toBe(true);
    expect(qinGeometry.every(item => item.geometry.type === 'Point')).toBe(true);
    expect(buildLocalMapData(state).boundaries.features.some(feature =>
      feature.properties?.polityId === 'qin' && feature.geometry.type !== 'Point')).toBe(false);
  }
  const finalYear = getHistoricalState(-206);
  expect(finalYear.boundaries.some(item => item.polityId === 'qin' && item.geometry.type === 'Point')).toBe(false);
  expect(qinCollapseAnnualAudit.sourceNotes.find(item => item.id === 'qin-regional-control-lander')?.use)
    .toContain('约前230—前206年');
});

test('Qin unification transition holds the coarse Qi interval outline in 221 BCE', () => {
  const state = getHistoricalState(-221);
  expect(state.boundaries.some(boundary => boundary.id === 'clio-721-qi_warring--222')).toBe(false);
  expect(getHistoricalState(-222).boundaries.some(boundary => boundary.id === 'clio-721-qi_warring--222')).toBe(true);
});

test('Chu-Han contention shows year-specific Han centers without inventing a kingdom border', () => {
  expect(hanKingChuhanAnnualAudit.decisionId).toBe('gap-han_western--206--203');
  expect(hanKingChuhanAnnualAudit.years.map(row => row.year)).toEqual([-206,-205,-204,-203]);
  expect(hanKingChuhanAnnualAudit.years.map(row => [row.mapExpression,row.centerPlaceId])).toEqual([
    ['control-center-point','nanzheng'],
    ['control-center-point-and-battle-event-point','liyang'],
    ['frontline-reference-point','xingyang'],
    ['frontline-reference-point','xingyang'],
  ]);
  expect(hanKingChuhanAnnualAudit.years.find(row => row.year === -206)?.sourceIds)
    .toContain('han-shu-gaodi-kingdom-41-counties');
  expect(hanKingChuhanAnnualAudit.years.every(row => row.territoryBoundary === null
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(hanKingChuhanAnnualAudit.years.find(row => row.year === -204)?.sourceIds)
    .toContain('zhengzhou-xingyang-old-city-site');
  expect(hanKingChuhanAnnualAudit.years.find(row => row.year === -203)?.sourceIds)
    .toEqual(expect.arrayContaining(['zhengzhou-xingyang-old-city-site','honggou-canal-course-study-2017']));
  const han203Conclusion = hanKingChuhanAnnualAudit.years.find(row => row.year === -203)!.conclusion;
  expect(han203Conclusion).toContain('年末');
  expect(han203Conclusion).toContain('追击');
  expect(han203Conclusion).not.toContain('约和破裂、战争继续');
  expect(coverageDecisions.find(item => item.id === hanKingChuhanAnnualAudit.decisionId))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  const expectedCenters = new Map([
    [-206, [107.03, 33.07]],
    [-205, [109.3133, 34.6425]],
    [-204, [113.5308, 34.8745]],
    [-203, [113.5308, 34.8745]],
  ]);
  for (const [year, coordinates] of expectedCenters) {
    const state = getHistoricalState(year);
    const han = state.boundaries.find(boundary => boundary.polityId === 'han_western');
    expect(han, `汉王在${year}年的中心参照`).toMatchObject({
      geometry:{type:'Point',coordinates},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(han!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates},
      properties:expect.objectContaining({polityId:'han_western',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }

  const transitionState = getHistoricalState(-206);
  const transitionFeatures = buildLocalMapData(transitionState).boundaries.features;
  const transitionCenters = transitionFeatures.filter(feature => (
    ['qin', 'han_western'].includes(String(feature.properties?.polityId))
    && feature.geometry.type === 'Point'
  ));
  expect(transitionCenters).toEqual(expect.arrayContaining([
    expect.objectContaining({
      geometry: { type:'Point', coordinates:[107.03,33.07] },
      properties: expect.objectContaining({ polityId:'han_western', evidenceLevel:'D', derivation:'control-centers' }),
    }),
  ]));
  expect(transitionCenters.some(feature => feature.properties?.polityId === 'qin')).toBe(false);
  expect(transitionFeatures.some(feature => (
    ['qin', 'han_western'].includes(String(feature.properties?.polityId))
    && feature.geometry.type !== 'Point'
  ))).toBe(false);
});

test('late Western Han and Xin transition keeps 6-8 Han centers without duplicating Xin source geometry in 9', () => {
  expect(hanXinTransitionAnnualAudit.decisionId).toBe('gap-han_western-6-9');
  expect(hanXinTransitionAnnualAudit.years.map(row => row.year)).toEqual([6,7,8,9]);
  expect(hanXinTransitionAnnualAudit.years.map(row => row.mapExpression)).toEqual([
    'capital-and-event-points','capital-and-event-points','capital-and-event-points','existing-xin-reference-held-for-review',
  ]);
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 6)?.mapEventIds)
    .toEqual(['liu-chong-attacks-wan-6']);
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 7)?.mapEventIds)
    .toEqual(['huaili-rebellion-7']);
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 8)?.mapEventIds)
    .toEqual(['huaili-rebellion-suppressed-8']);
  expect(hanXinTransitionAnnualAudit.years.every(row => row.territoryBoundary === null
    && row.sourceIds.includes('wang-mang-spatial-reforms-xiong-2019')
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 8)?.conclusion)
    .toContain('即真天子位');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 6)?.conclusion)
    .toContain('西海郡');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 7)?.conclusion)
    .toContain('郡国皆震');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 7)?.conclusion)
    .toContain('至山阳时众十余万');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 7)?.conclusion)
    .toContain('赵明、霍鸿亦于同年起兵');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 8)?.conclusion)
    .toContain('二月平定前一年起兵的赵明、霍鸿');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 8)?.conclusion)
    .not.toContain('槐里赵明、霍鸿亦于同年起兵');
  for (const [year,eventId] of [[7,'huaili-rebellion-7'],[8,'huaili-rebellion-suppressed-8']] as const) {
    const event = events.find(item => item.id === eventId);
    const state = getHistoricalState(year);
    expect(event).toMatchObject({
      year,
      coordinates:[108.50215,34.26251],
      locationPrecision:'approximate',
      sourceIds:expect.arrayContaining(['han-xin-transition-primary-sources','huaili-han-chgis-hvd-70705']),
    });
    expect(state.events.some(item => item.id === eventId)).toBe(true);
    expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.50215,34.26251]},
      properties:expect.objectContaining({entityId:eventId}),
    }));
    expect(state.boundaries.some(boundary => boundary.polityId === 'han_western'
      && boundary.geometry.type !== 'Point')).toBe(false);
  }
  expect(getHistoricalState(7).boundaries.find(boundary => boundary.id === 'special-han-7-changan-center')?.notes)
    .toContain('槐里');
  expect(getHistoricalState(8).boundaries.find(boundary => boundary.id === 'special-han-8-changan-center')?.notes)
    .toContain('二月平定前一年起兵的槐里赵明、霍鸿');
  expect(hanXinTransitionAnnualAudit.years.find(row => row.year === 9)?.evidenceGap)
    .toContain('前一年年末');
  expect(hanXinTransitionAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'wang-mang-spatial-reforms-xiong-2019',
    use:expect.stringContaining('不将军事事件图或行政改革复原为逐年疆界'),
  }));
  expect(coverageDecisions.find(item => item.id === hanXinTransitionAnnualAudit.decisionId))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  for (const year of [6, 7, 8]) {
    const state = getHistoricalState(year);
    const hanBoundaries = state.boundaries.filter(boundary => boundary.polityId === 'han_western');
    expect(hanBoundaries, `西汉在${year}年不叠加其他政权或相邻期疆域面`).toHaveLength(1);
    const han = hanBoundaries[0];
    expect(han, `西汉在${year}年的长安政治中心参照`).toMatchObject({
      validFrom:year,
      validTo:year,
      snapshotYear:year,
      geometry:{type:'Point',coordinates:[108.94,34.34]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(state.boundaries.some(boundary => boundary.polityId === 'xin')).toBe(false);
    expect(isDefiniteBoundary(han!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.94,34.34]},
      properties:expect.objectContaining({polityId:'han_western',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }

  const year9 = getHistoricalState(9);
  const xin = year9.boundaries.find(boundary => boundary.polityId === 'xin');
  expect(xin, '9年处于汉新交替冲突审核期，不发布来源疆域面').toBeUndefined();
  expect(year9.boundaries.some(boundary => boundary.polityId === 'han_western')).toBe(false);
  expect(buildLocalMapData(year9).boundaries.features.some(feature => feature.properties?.polityId === 'xin')).toBe(false);
  expect(getHistoricalState(10).boundaries.some(boundary => boundary.polityId === 'xin'
    && boundary.geometry.type === 'MultiPolygon')).toBe(true);

  const hanGap = coverageDecisions.find(decision => decision.id === 'gap-han_western-6-9');
  expect(hanGap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(hanGap?.historicalTransitionCheck).toContain('9年');
  expect(hanGap?.rationale).toContain('不以邻年或最大轮廓回填');
});

test('Eastern Han founding years record each annual capital center and keep the 25 transition unfilled', () => {
  expect(easternHanFoundingAnnualAudit.decisionId).toBe('gap-han_eastern-25-29');
  expect(easternHanFoundingAnnualAudit.years.map(row => row.year)).toEqual([25,26,27,28,29]);
  expect(easternHanFoundingAnnualAudit.years[0].conclusion).toContain('日期异文');
  expect(easternHanFoundingAnnualAudit.years[0].evidenceGap).toContain('约500米×300米');
  expect(easternHanFoundingAnnualAudit.sourceNotes.find(source => source.id === 'han-hao-enthronement-site-study')?.use)
    .toContain('龙华乡十五里铺');
  expect(easternHanFoundingAnnualAudit.sourceNotes.find(source => source.id === 'han-hao-enthronement-site-study')?.use)
    .toContain('可直接录入的经纬度');
  expect(easternHanFoundingAnnualAudit.sourceNotes.find(source => source.id === 'han-hao-enthronement-site-study')?.use)
    .toContain('1987年遗址碑所载1985年县文物调查');
  expect(easternHanFoundingAnnualAudit.years.every(row => row.mapExpression === 'control-center-point'
    && row.centerPlaceId === 'luoyang'
    && row.territoryBoundary === null
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(coverageDecisions.find(item => item.id === easternHanFoundingAnnualAudit.decisionId))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  for (const year of [25, 26, 27, 28, 29]) {
    const state = getHistoricalState(year);
    const hanRecords = state.boundaries.filter(boundary => boundary.polityId === 'han_eastern');
    expect(hanRecords.length, `东汉在${year}年应有年度中心记录`).toBeGreaterThan(0);
    expect(hanRecords.every(boundary => boundary.geometry.type === 'Point'),
      `东汉在${year}年不应出现无审核疆域面`).toBe(true);
    const han = hanRecords[0];
    expect(han, `东汉在${year}年的洛阳中央政治中心参照`).toMatchObject({
      validFrom:year,
      validTo:year,
      snapshotYear:year,
      geometry:{type:'Point',coordinates:[112.45,34.62]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(han!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[112.45,34.62]},
      properties:expect.objectContaining({polityId:'han_eastern',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }

  const foundingYear = getHistoricalState(25);
  const gengshiRecords = foundingYear.boundaries.filter(boundary => boundary.polityId === 'gengshi');
  expect(gengshiRecords.length).toBeGreaterThan(0);
  expect(gengshiRecords.every(boundary => boundary.geometry.type === 'Point')).toBe(true);
  const gengshi = gengshiRecords[0];
  const easternHan = foundingYear.boundaries.find(boundary => boundary.polityId === 'han_eastern');
  expect(gengshi).toMatchObject({
    geometry:{type:'Point',coordinates:[108.94,34.34]},
    evidence:{evidenceLevel:'D',derivation:'control-centers'},
  });
  expect(isDefiniteBoundary(gengshi!)).toBe(false);
  expect(isDefiniteBoundary(easternHan!)).toBe(false);
  expect(buildLocalMapData(foundingYear).boundaries.features).toEqual(expect.arrayContaining([
    expect.objectContaining({properties:expect.objectContaining({polityId:'gengshi',derivation:'control-centers'})}),
    expect.objectContaining({properties:expect.objectContaining({polityId:'han_eastern',derivation:'control-centers'})}),
  ]));

  const hanGap = coverageDecisions.find(decision => decision.id === 'gap-han_eastern-25-29');
  expect(hanGap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(hanGap?.historicalTransitionCheck).toContain('25年');
  expect(hanGap?.rationale).toContain('不把邻年或最大轮廓回填');
});

test('Three Kingdoms formation shows the 221 Wu King center before sourced Wu geometry starts in 222', () => {
  expect(threeKingdomsFormationAnnualAudit.decisionIds).toEqual([
    'gap-wei_three-220-223','gap-shu_three-221-223',
  ]);
  expect(threeKingdomsFormationAnnualAudit.yearCount).toBe(8);
  expect(threeKingdomsFormationAnnualAudit.years.map(row => [row.polityId,row.year])).toEqual([
    ...[220,221,222,223].map(year => ['wei_three',year]),
    ['wu_three',221],
    ...[221,222,223].map(year => ['shu_three',year]),
  ]);
  expect(threeKingdomsFormationAnnualAudit.years.every(row =>
    (row.polityId === 'shu_three' && row.year === 223
      ? row.mapExpression === 'capital-and-event-points'
        && row.mapEventIds?.includes('liu-bei-dies-at-yongan-223')
      : row.mapExpression === 'control-center-point')
    && row.territoryBoundary === null
    && row.sourceIds.includes('three-kingdoms-overview-map-1935-pd')
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(threeKingdomsFormationAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'three-kingdoms-overview-map-1935-pd',
    use:expect.stringContaining('不作为220—223年逐年疆界'),
  }));
  for (const id of threeKingdomsFormationAnnualAudit.decisionIds) {
    const decision = coverageDecisions.find(item => item.id === id);
    expect(decision).toMatchObject({
      verdict:'leave-unfilled',sourceBoundaryIds:[],
      annualAudit:'docs/audits/topics/three-kingdoms-formation-220-223.json',
    });
    const auditedSources = new Set(threeKingdomsFormationAnnualAudit.years
      .filter(row => row.polityId === decision?.polityId)
      .flatMap(row => row.sourceIds));
    expect([...auditedSources].every(sourceId =>
      sourceId === 'modern-geography-reference' || decision?.citationIds.includes(sourceId))).toBe(true);
  }
  const expectedCenters = [
    ...[220, 221, 222, 223].map(year => [year, 'wei_three', [112.45, 34.62]] as const),
    ...[221, 222, 223].map(year => [year, 'shu_three', [104.07, 30.67]] as const),
  ];
  for (const [year, polityId, coordinates] of expectedCenters) {
    const state = getHistoricalState(year);
    const polityRecords = state.boundaries.filter(boundary => boundary.polityId === polityId);
    expect(polityRecords.length, `${polityId} ${year} annual map records`).toBeGreaterThan(0);
    expect(polityRecords.every(boundary => boundary.geometry.type === 'Point'),
      `${polityId} ${year} must not inherit an unreviewed polygon`).toBe(true);
    const center = polityRecords[0];
    expect(center, `${polityId} ${year}`).toMatchObject({
      geometry:{type:'Point',coordinates},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates},
      properties:expect.objectContaining({polityId,evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  const transitionYear = getHistoricalState(220);
  const hanTransitionReference = transitionYear.boundaries.find(boundary =>
    boundary.id === 'clio-1325-han_eastern-215');
  const hanTransitionSource = boundaryCatalog.find(boundary =>
    boundary.id === 'clio-1325-han_eastern-215');
  expect(hanTransitionSource).toBeDefined();
  expect(hanTransitionReference, '220年汉魏交替冲突期暂扣东汉来源轮廓').toBeUndefined();
  expect(getHistoricalState(219).boundaries.some(boundary => boundary.id === 'clio-1325-han_eastern-215')).toBe(true);
  expect(hanTransitionSource).toMatchObject({
    polityId:'han_eastern',
    validFrom:215,
    validTo:220,
    geometry:{type:'MultiPolygon'},
  });
  expect(hanTransitionSource?.geometry).toBeDefined();
  expect(transitionYear.boundaries.filter(boundary => boundary.polityId === 'wei_three')
    .every(boundary => boundary.geometry.type === 'Point')).toBe(true);
  expect(threeKingdomsFormationAnnualAudit.coexistenceNotes.join(' '))
    .toContain('220年东汉Cliopatria来源轮廓（来源区间215—220年）因汉魏年内交替，不能证明东汉全年直接控制或转作曹魏疆域');
  expect(getHistoricalState(220).boundaries.some(boundary => boundary.polityId === 'wu_three')).toBe(false);
  const wuKingYear = getHistoricalState(221);
  const wuKingCenter = wuKingYear.boundaries.find(boundary => boundary.id === 'special-wu-221-wuchang-center');
  expect(wuKingYear.activePolities.some(polity => polity.id === 'wu_three')).toBe(true);
  expect(wuKingCenter).toMatchObject({
    validFrom:221,
    validTo:221,
    snapshotYear:221,
    geometry:{type:'Point',coordinates:[114.88,30.40]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(wuKingCenter?.evidence.uncertaintyNote).toContain('吴的独立称帝及疆域边界不能由此点推出');
  expect(buildLocalMapData(wuKingYear).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[114.88,30.40]},
    properties:expect.objectContaining({polityId:'wu_three',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(wuKingYear.boundaries.some(boundary => boundary.polityId === 'wu_three' && boundary.geometry.type !== 'Point')).toBe(false);
  expect(threeKingdomsFormationAnnualAudit.years.find(row => row.polityId === 'wu_three' && row.year === 221))
    .toMatchObject({mapExpression:'control-center-point',centerPlaceId:'wuchang',territoryBoundary:null});
  for (const year of [222, 223]) {
    const state = getHistoricalState(year);
    const wu = state.boundaries.find(boundary => boundary.id === 'clio-1312-wu_three-222');
    const source = boundaryCatalog.find(boundary => boundary.id === 'clio-1312-wu_three-222');
    expect(wu).toBeDefined();
    expect(source).toBeDefined();
    expect(wu?.geometry).toEqual(source?.geometry);
    expect(wu?.validFrom).toBe(222);
    expect(wu?.validTo).toBe(237);
    expect(wu?.evidence.citations[0]).toMatchObject({version:'v0.2.1', pageOrRecord:'record 1312', license:'CC BY 4.0'});

    const pointInRing = ([x,y]:number[], ring:number[][]) => {
      let inside = false;
      for (let i=0,j=ring.length-1;i<ring.length;j=i++) {
        const [xi,yi] = ring[i];
        const [xj,yj] = ring[j];
        if ((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
      }
      return inside;
    };
    expect(wu?.geometry.type).toBe('MultiPolygon');
    if (wu?.geometry.type !== 'MultiPolygon') throw new Error('Wu 222 source boundary must remain a multipolygon');
    const outerRings = wu.geometry.coordinates.map(polygon => polygon[0]);
    const pointInsideWu = (point:number[]) => outerRings.some(ring => pointInRing(point,ring));
    expect(pointInsideWu([112.45,34.62])).toBe(false);
    expect(pointInsideWu([104.07,30.67])).toBe(false);
    expect(boundaryGeometryConflicts.some(conflict => (conflict.years as readonly number[]).includes(year)
      && (conflict.polityIds as readonly string[]).includes('wu_three'))).toBe(false);
  }
});

test('Wei-Jin transition year shows the Wei handover and Wu’s year-end Wuchang center without inventing territory', () => {
  expect(threeKingdomsTerminationAnnualAudit.decisionIds).toContain('gap-wei_three-265-265');
  expect(threeKingdomsTerminationAnnualAudit.years.map(row => [row.polityId,row.year])).toEqual([
    ['shu_three',263],['wei_three',265],['wu_three',265],
  ]);
  expect(threeKingdomsTerminationAnnualAudit.years.every(row => row.territoryBoundary === null
    && row.sourceIds.includes('three-kingdoms-overview-map-1935-pd')
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(threeKingdomsTerminationAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'three-kingdoms-overview-map-1935-pd',
    use:expect.stringContaining('不作为263年或265年逐年疆界'),
  }));
  expect(threeKingdomsTerminationAnnualAudit.years.find(row => row.year === 265 && row.polityId === 'wei_three'))
    .toMatchObject({mapExpression:'control-center-point',centerPlaceId:'luoyang',territoryBoundary:null});
  expect(threeKingdomsTerminationAnnualAudit.years.find(row => row.year === 265 && row.polityId === 'wu_three'))
    .toMatchObject({mapExpression:'control-center-point',centerPlaceId:'wuchang',territoryBoundary:null});
  const state = getHistoricalState(265);
  const wei = state.boundaries.find(boundary => boundary.polityId === 'wei_three');
  const weiRecords = state.boundaries.filter(boundary => boundary.polityId === 'wei_three');
  expect(weiRecords.every(boundary => boundary.geometry.type === 'Point')).toBe(true);
  expect(wei, '曹魏终止年的洛阳政治中心参照').toMatchObject({
    validFrom:265,
    validTo:265,
    snapshotYear:265,
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(wei!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    properties:expect.objectContaining({polityId:'wei_three',evidenceLevel:'D',derivation:'control-centers'}),
  }));

  const jinSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1376-jin_western-265');
  expect(jinSource).toMatchObject({validFrom:265,validTo:282,sourceIds:['cliopatria']});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:wei-jin-transition:265',
    boundaryId:'clio-1376-jin_western-265',
    years:[265],
    status:'requires-review',
  }));
  expect(state.boundaries.some(boundary => boundary.id === 'clio-1376-jin_western-265')).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature =>
    feature.id === 'clio-1376-jin_western-265')).toBe(false);
  const jinState266 = getHistoricalState(266);
  const jin = jinState266.boundaries.find(boundary => boundary.id === 'clio-1376-jin_western-265');
  expect(jin).toMatchObject({
    validFrom:265,
    validTo:282,
    sourceIds:['cliopatria'],
    evidence:{evidenceLevel:'A',derivation:'direct-source',reviewStatus:'source-checked'},
  });
  expect(jin?.evidence.uncertaintyNote).toContain('不代表逐年测绘');
  expect(buildLocalMapData(jinState266).boundaries.features.some(feature =>
    feature.id === 'clio-1376-jin_western-265' && feature.properties?.polityId === 'jin_western')).toBe(true);
  expect(state.activePolities.some(polity => polity.id === 'wu_three')).toBe(true);
  const wu265 = state.boundaries.find(boundary => boundary.id === 'special-wu-265-wuchang-center');
  expect(wu265, '魏晋禅代年吴迁都后的武昌中心参照').toMatchObject({
    validFrom:265,
    validTo:265,
    snapshotYear:265,
    geometry:{type:'Point',coordinates:[114.88,30.40]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(wu265!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[114.88,30.40]},
    properties:expect.objectContaining({polityId:'wu_three',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(state.boundaries.some(boundary => boundary.polityId === 'wu_three' && boundary.geometry.type !== 'Point')).toBe(false);
  const wuPeriodSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1373-wu_three-263');
  expect(wuPeriodSource).toMatchObject({
    validFrom:263,
    validTo:269,
    geometryReviewHolds:[{conflictId:'conflict:wu-interval-model-transition:265',years:[265],status:'requires-review'}],
  });
  expect(state.boundaries.some(boundary => boundary.id === 'clio-1373-wu_three-263')).toBe(false);
  expect(getHistoricalState(266).boundaries.some(boundary => boundary.id === 'clio-1373-wu_three-263')).toBe(true);

  const weiGap = coverageDecisions.find(decision => decision.id === 'gap-wei_three-265-265');
  const shuGap = coverageDecisions.find(decision => decision.id === 'gap-shu_three-263-263');
  expect(weiGap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(weiGap?.citationIds).toContain('three-kingdoms-overview-map-1935-pd');
  expect(shuGap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(shuGap?.citationIds).toContain('three-kingdoms-overview-map-1935-pd');
  expect(weiGap?.historicalTransitionCheck).toContain('魏晋禅代');
  expect(weiGap?.historicalTransitionCheck).toContain('three-kingdoms-terminations-263-265.json');
});

test('Fall of Shu in 263 shows Chengdu as a center without freezing the transition-year boundary', () => {
  expect(threeKingdomsTerminationAnnualAudit.decisionIds).toContain('gap-shu_three-263-263');
  expect(threeKingdomsTerminationAnnualAudit.years.find(row => row.year === 263 && row.polityId === 'shu_three'))
    .toMatchObject({mapExpression:'control-center-point',centerPlaceId:'chengdu',territoryBoundary:null});
  const state = getHistoricalState(263);
  const shuRecords = state.boundaries.filter(boundary => boundary.polityId === 'shu_three');
  expect(shuRecords.every(boundary => boundary.geometry.type === 'Point')).toBe(true);
  const shu = state.boundaries.find(boundary => boundary.polityId === 'shu_three');
  expect(shu, '蜀汉终止年成都政治中心参照').toMatchObject({
    validFrom:263,
    validTo:263,
    snapshotYear:263,
    geometry:{type:'Point',coordinates:[104.07,30.67]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(shu!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[104.07,30.67]},
    properties:expect.objectContaining({polityId:'shu_three',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(state.activePolities.some(polity => polity.id === 'wei_three')).toBe(true);
  expect(weiShuTransition263Audit).toMatchObject({
    decisionId:'out-of-ledger-wei_three-263',polityId:'wei_three',yearCount:1,reviewStatus:'source-checked',
  });
  expect(weiShuTransition263Audit.years[0]).toMatchObject({
    year:263,mapExpression:'control-center-point',centerPlaceId:'luoyang',territoryBoundary:null,
  });
  expect(weiShuTransition263Audit.years[0].sourceIds.every(id => (
    weiShuTransition263Audit.sourceNotes.some(source => source.id === id)
  ))).toBe(true);

  const weiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1371-wei_three-263');
  expect(weiSource).toMatchObject({validFrom:263,validTo:264,sourceIds:['cliopatria']});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:shu-wei-transition:263',
    boundaryId:'clio-1371-wei_three-263',
    years:[263],
    status:'requires-review',
  }));
  expect(state.boundaries.some(boundary => boundary.id === 'clio-1371-wei_three-263')).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature => feature.id === 'clio-1371-wei_three-263')).toBe(false);
  const weiCenter = state.boundaries.find(boundary => boundary.polityId === 'wei_three');
  expect(weiCenter, '魏蜀交接年仅显示魏都洛阳中心参照').toMatchObject({
    validFrom:263,
    validTo:263,
    snapshotYear:263,
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(weiCenter!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    properties:expect.objectContaining({polityId:'wei_three',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(getHistoricalState(264).boundaries.some(boundary => boundary.id === 'clio-1371-wei_three-263')).toBe(true);

  const shuGap = coverageDecisions.find(decision => decision.id === 'gap-shu_three-263-263');
  expect(shuGap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(shuGap?.historicalTransitionCheck).toContain('263年');
  expect(shuGap?.historicalTransitionCheck).toContain('three-kingdoms-terminations-263-265.json');
});

test('Chengdu Han founding records separate 304 establishment from 305 consolidation', () => {
  expect(chengHanFoundingAnnualAudit.decisionId).toBe('gap-cheng_han-304-305');
  expect(chengHanFoundingAnnualAudit.years.map(row => row.year)).toEqual([304,305]);
  expect(chengHanFoundingAnnualAudit.years.map(row => row.mapExpression)).toEqual([
    'late-year-control-center-point','control-center-point',
  ]);
  expect(chengHanFoundingAnnualAudit.years.every(row => row.centerPlaceId === 'chengdu'
    && row.territoryBoundary === null
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(coverageDecisions.find(item => item.id === chengHanFoundingAnnualAudit.decisionId))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  const westernJinInterval = boundaryCatalog.find(boundary => boundary.id === 'clio-1407-jin_western-287');
  expect(westernJinInterval).toMatchObject({validFrom:287,validTo:305});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:western-jin-breakaway-polities:304-305',
    boundaryId:'clio-1407-jin_western-287',
    polityIds:['jin_western','cheng_han'],
    years:[304,305],
    status:'requires-review',
  }));
  for (const year of [304,305]) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.polityId === 'cheng_han');
    expect(state.boundaries.some(boundary => boundary.id === 'clio-1407-jin_western-287')).toBe(false);
    expect(buildLocalMapData(state).boundaries.features.some(feature => feature.id === 'clio-1407-jin_western-287')).toBe(false);
    expect(center, `成汉 ${year} 成都政治中心参照`).toMatchObject({
      validFrom:year,
      validTo:year,
      snapshotYear:year,
      geometry:{type:'Point',coordinates:[104.07,30.67]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
  }
  expect(westernJinInterval?.geometry.type).toBe('MultiPolygon');
  expect(getHistoricalState(303).boundaries.some(boundary => boundary.id === 'clio-1407-jin_western-287')).toBe(true);
  expect(getHistoricalState(304).activePolities.some(polity => polity.id === 'former_zhao')).toBe(true);
  expect(getHistoricalState(305).activePolities.some(polity => polity.id === 'former_zhao')).toBe(true);

  const gap = coverageDecisions.find(decision => decision.id === 'gap-cheng_han-304-305');
  const laterChengHanSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1423-cheng_han-306');
  expect(gap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(gap?.citationIds).toContain('cliopatria');
  expect(chengHanFoundingAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(gap?.rationale).toContain('clio-1423-cheng_han-306');
  expect(gap?.rationale).toContain('clio-1407-jin_western-287');
  expect(gap?.rationale).toContain('304—305年');
  expect(coverageDecisions.find(decision => decision.id === 'gap-former_zhao-304-305')?.rationale)
    .toContain('不据左国城区域级定位宣称其与西晋轮廓存在精确空间重叠');
  expect(laterChengHanSource).toMatchObject({validFrom:306,validTo:310,snapshotYear:306,sourceRecord:1423});
  for (const year of [304,305]) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-1423-cheng_han-306')).toBe(false);
    expect(buildLocalMapData(state).boundaries.features.some(feature => feature.id === 'clio-1423-cheng_han-306')).toBe(false);
  }
  expect(getHistoricalState(306).boundaries.find(boundary => boundary.id === 'clio-1423-cheng_han-306')?.geometry)
    .toEqual(laterChengHanSource?.geometry);
  expect(gap?.historicalTransitionCheck).toContain('304年');
  expect(gap?.historicalTransitionCheck).toContain('305年');
  expect(gap?.historicalTransitionCheck).toContain('cheng-han-founding-304-305.json');
});

test('Former Zhao founding records its annual center changes without inventing contested city coordinates', () => {
  for (const year of [304,305]) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.polityId === 'former_zhao')).toBe(false);
    expect(state.boundaries.some(boundary => boundary.polityId === 'cheng_han')).toBe(true);
    const mapData = buildLocalMapData(state);
    expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'former_zhao')).toBe(false);
    expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'cheng_han' && feature.geometry.type === 'Point')).toBe(true);
  }
  const gap = coverageDecisions.find(decision => decision.id === 'gap-former_zhao-304-305');
  expect(gap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(gap?.citationIds).toContain('state-council-sixth-national-key-cultural-site-nancun');
  const laterFormerZhaoSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1428-former_zhao-306');
  expect(gap?.citationIds).toContain('cliopatria');
  expect(formerZhaoFoundingAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(gap?.rationale).toContain('clio-1428-former_zhao-306');
  expect(laterFormerZhaoSource).toMatchObject({validFrom:306,validTo:310,snapshotYear:306,sourceRecord:1428});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    boundaryId:'clio-1428-former_zhao-306', years:[306,307,308,309,310], status:'requires-review',
  }));
  expect(getHistoricalState(306).boundaries.some(boundary => boundary.id === 'clio-1428-former_zhao-306')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(306)).boundaries.features.some(
    feature => feature.id === 'clio-1428-former_zhao-306')).toBe(false);
  expect(gap?.historicalTransitionCheck).toContain('304年');
  expect(gap?.historicalTransitionCheck).toContain('305年');
  expect(gap?.rationale).toContain('黎亭');
  expect(gap?.rationale).toContain('左国城');
  expect(formerZhaoFoundingAnnualAudit.decisionId).toBe('gap-former_zhao-304-305');
  expect(formerZhaoFoundingAnnualAudit.years.map(item => item.year)).toEqual([304,305]);
  expect(formerZhaoFoundingAnnualAudit.years.map(item => item.mapExpression)).toEqual(['historical-conclusion-only','historical-conclusion-only']);
  expect(formerZhaoFoundingAnnualAudit.years.every(item => item.centerPlaceId === null && item.territoryBoundary === null)).toBe(true);
  expect(formerZhaoFoundingAnnualAudit.years[0].conclusion).toContain('左国城');
  expect(formerZhaoFoundingAnnualAudit.years[0].sourceIds).toContain('zuoguo-city-nancun-location-study');
  expect(formerZhaoFoundingAnnualAudit.years[0].sourceIds).toContain('zuoguo-site-local-overview-2024');
  expect(formerZhaoFoundingAnnualAudit.years[0].sourceIds).toContain('state-council-sixth-national-key-cultural-site-nancun');
  expect(formerZhaoFoundingAnnualAudit.years[0].conclusion).toContain('峪口镇南村');
  expect(sourceNotes.find(source => source.id === 'zuoguo-city-nancun-location-study')?.note)
    .toContain('未提供可直接录入的经纬度');
  expect(sourceNotes.find(source => source.id === 'state-council-sixth-national-key-cultural-site-nancun')?.note)
    .toContain('不提供保护区界址');
  expect(sourceNotes.find(source => source.id === 'zuoguo-site-local-overview-2024')?.note)
    .toContain('无可复核坐标、方向控制点或测绘图');
  expect(formerZhaoFoundingAnnualAudit.years[0].centerPlaceId).toBeNull();
  expect(formerZhaoFoundingAnnualAudit.years[0].territoryBoundary).toBeNull();
  expect(formerZhaoFoundingAnnualAudit.years[1].conclusion).toContain('黎亭');
  expect(formerZhaoFoundingAnnualAudit.years[1].sourceIds).toContain('liting-historical-geography-references');
  expect(formerZhaoFoundingAnnualAudit.years[1].evidenceGap).toContain('上党、壶关');
  expect(formerZhaoFoundingAnnualAudit.years[1].evidenceGap).toContain('迁屯');
  expect(formerZhaoFoundingAnnualAudit.years[1].sourceIds).toContain('liting-huguan-route-study');
  expect(formerZhaoFoundingAnnualAudit.years[1].evidenceGap).toContain('仍有分歧');
  expect(sourceNotes.find(source => source.id === 'liting-huguan-route-study')?.note)
    .toContain('不能确定黎亭唯一遗址或坐标');
  expect(sourceNotes.find(source => source.id === 'liting-historical-geography-references')?.note)
    .toContain('不作为前赵政治中心点');
  expect(formerZhaoFoundingAnnualAudit.years.every(item => item.sourceIds.includes('former-zhao-founding-304-305-primary-sources'))).toBe(true);
  expect(gap?.historicalTransitionCheck).toContain('former-zhao-founding-304-305.json');
});

test('Later Zhao 319-336 has annual capital references and a two-center 335 transition, without territorial polygons', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_zhao-319-336');
  const laterZhaoSource = boundaryCatalog.find(item => item.id === 'clio-1457-later_zhao-337');
  for (let year = 319; year <= 336; year += 1) {
    const state = getHistoricalState(year);
    const centers = state.boundaries.filter(boundary => boundary.polityId === 'later_zhao');
    const expected = year < 335
      ? [[114.50,37.07]]
      : year === 335
        ? [[114.50,37.07],[114.37,36.33]]
        : [[114.37,36.33]];
    expect(centers.map(center => center.geometry).filter(geometry => geometry.type === 'Point'))
      .toEqual(expected.map(coordinates => ({type:'Point',coordinates})));
    expect(centers.every(center => !isDefiniteBoundary(center))).toBe(true);
    expect(buildLocalMapData(state).boundaries.features.filter(feature => feature.properties?.polityId === 'later_zhao'))
      .toHaveLength(expected.length);
  }
  expect(laterZhaoAnnualAudit.decisionId).toBe('gap-later_zhao-319-336');
  expect(laterZhaoAnnualAudit.years.map(item => item.year)).toEqual(Array.from({length:18}, (_, index) => 319 + index));
  expect(laterZhaoAnnualAudit.years.map(item => item.centerPlaceIds)).toEqual([
    ...Array.from({length:16}, () => ['xiangguo']),
    ['xiangguo','ye'],
    ['ye'],
  ]);
  expect(laterZhaoAnnualAudit.years.every(item => item.territoryBoundary === null && item.conclusion.length > 0 && item.evidenceGap.length > 0)).toBe(true);
  expect(laterZhaoAnnualAudit.years.every(item => item.sourceIds.includes('later-zhao-319-336-chronicles'))).toBe(true);
  expect(laterZhaoAnnualAudit.years.find(item => item.year === 328)).toMatchObject({
    mapExpression:'capital-and-event-points',
    conclusion:expect.stringContaining('西阳门'),
  });
  expect(buildLocalMapData(getHistoricalState(328)).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    properties:expect.objectContaining({entityId:'later-zhao-captures-liu-yao-at-luoyang-328'}),
  }));
  expect(laterZhaoSource).toMatchObject({
    polityId:'later_zhao', validFrom:337, validTo:346, snapshotYear:337,
    sourceFrom:337, sourceTo:346, sourceRecord:1457, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.rationale).toContain('clio-1457-later_zhao-337');
  for (let year = 319; year <= 336; year++) {
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === 'clio-1457-later_zhao-337')).toBe(false);
    expect(buildLocalMapData(getHistoricalState(year)).boundaries.features.some(
      feature => feature.id === 'clio-1457-later_zhao-337')).toBe(false);
  }
  expect(getHistoricalState(337).boundaries.find(boundary => boundary.id === 'clio-1457-later_zhao-337')?.geometry)
    .toEqual(laterZhaoSource?.geometry);
  expect(laterZhaoAnnualAudit.years[7].conclusion).toContain('邺宫');
  expect(laterZhaoAnnualAudit.years[4].conclusion).toContain('坞堡归附后赵');
  expect(laterZhaoAnnualAudit.years[4].conclusion).toContain('设置守宰安抚');
  expect(laterZhaoAnnualAudit.years[4].evidenceGap).toContain('坞堡的名称、数量与逐一位置');
  expect(laterZhaoAnnualAudit.years[10].conclusion).toContain('前赵');
  expect(laterZhaoAnnualAudit.years[16].conclusion).toContain('九月迁都');
  expect(laterZhaoAnnualAudit.years[17].conclusion).toContain('邺');
  expect(laterZhaoAnnualAudit.years[15].conclusion).toContain('玄氏令');
  expect(laterZhaoAnnualAudit.years[15].sourceIds).toContain('later-zhao-administrative-epigraphy-2022');
  expect(laterZhaoAnnualAudit.years[15].evidenceGap).toContain('不能确定玄氏县的现代位置或县界');
  expect(laterZhaoAnnualAudit.sourceNotes.some(note => note.id === 'later-zhao-administrative-epigraphy-2022'))
    .toBe(true);
  const gap = coverageDecisions.find(decision => decision.id === 'gap-later_zhao-319-336');
  expect(gap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(gap?.historicalTransitionCheck).toContain('335年');
  expect(gap?.historicalTransitionCheck).toContain('333年');
  expect(gap?.historicalTransitionCheck).toContain('later-zhao-319-336.json');
});

test('Later Yan and Later Qin founding years keep changing centers distinct and borders unfilled', () => {
  const laterYanDecision = coverageDecisions.find(item => item.id === 'gap-later_yan-384-386');
  const laterQinDecision = coverageDecisions.find(item => item.id === 'gap-later_qin-384-386');
  const laterYanSource = boundaryCatalog.find(item => item.id === 'clio-1553-later_yan-387');
  const laterQinSource = boundaryCatalog.find(item => item.id === 'clio-1555-later_qin-387');
  expect(laterYanQinAnnualAudit).toMatchObject({
    decisionIds:['gap-later_yan-384-386','gap-later_qin-384-386'],
    yearCount:6,
    reviewStatus:'source-checked',
  });
  expect(laterYanQinAnnualAudit.years.map(row => [row.polityId,row.year])).toEqual([
    ['later_yan',384],['later_yan',385],['later_yan',386],
    ['later_qin',384],['later_qin',385],['later_qin',386],
  ]);
  expect(laterYanQinAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  for (const row of laterYanQinAnnualAudit.years) {
    expect(row.sourceIds.length, `${row.polityId} ${row.year} source`).toBeGreaterThan(0);
    expect(row.conclusion.length, `${row.polityId} ${row.year} conclusion`).toBeGreaterThan(0);
    expect(row.evidenceGap.length, `${row.polityId} ${row.year} evidence gap`).toBeGreaterThan(0);
    expect(row.territoryBoundary, `${row.polityId} ${row.year} boundary`).toBeNull();
    expect(row.sourceIds.every(id => sourceNotes.some(source => source.id === id)), `${row.polityId} ${row.year} sources`).toBe(true);
  }
  expect(laterYanQinAnnualAudit.years.map(row => [row.polityId,row.year,row.mapExpression,row.centerPlaceId])).toEqual([
    ['later_yan',384,'event-location-point','xingyang'],
    ['later_yan',385,'control-center-point','zhongshan_lunu'],
    ['later_yan',386,'control-center-point','zhongshan_lunu'],
    ['later_qin',384,'historical-conclusion-only',null],
    ['later_qin',385,'historical-conclusion-only',null],
    ['later_qin',386,'control-center-point','changan'],
  ]);
  expect(laterYanSource).toMatchObject({validFrom:387,validTo:389,snapshotYear:387,sourceRecord:1553,confidence:'low',controlType:'unspecified'});
  expect(laterQinSource).toMatchObject({validFrom:387,validTo:393,snapshotYear:387,sourceRecord:1555,confidence:'low',controlType:'unspecified'});
  expect(laterYanDecision?.rationale).toContain('clio-1553-later_yan-387');
  expect(laterQinDecision?.rationale).toContain('clio-1555-later_qin-387');
  expect(laterYanDecision?.citationIds).toContain('cliopatria');
  expect(laterQinDecision?.citationIds).toContain('cliopatria');
  expect(laterYanQinAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  const laterQin384Audit = laterYanQinAnnualAudit.years.find(row => row.polityId === 'later_qin' && row.year === 384);
  expect(laterQin384Audit?.sourceIds).toContain('shanxi-chronicle-weibei-mamu');
  expect(laterQin384Audit?.evidenceGap).toContain('渭北牧马之地');
  expect(laterYanQinAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'shanxi-chronicle-weibei-mamu',
    use:expect.stringContaining('未给出马牧的具体地望或坐标'),
  }));
  const laterQin385Audit = laterYanQinAnnualAudit.years.find(row => row.polityId === 'later_qin' && row.year === 385);
  expect(laterQin385Audit?.conclusion).toContain('四月新平守将苟辅');
  expect(laterQin385Audit?.conclusion).toContain('十月西燕军攻新平南');
  expect(laterQin385Audit?.sourceIds).toContain('binxian-gazetteer-qixian-site');
  expect(laterQin385Audit?.evidenceGap).toContain('西南塬上');
  expect(laterYanQinAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'binxian-gazetteer-qixian-site',
    use:expect.stringContaining('毁于姚苌之乱'),
  }));
  const laterYan384 = getHistoricalState(384).boundaries.find(boundary => boundary.polityId === 'later_yan');
  const laterYan385 = getHistoricalState(385).boundaries.find(boundary => boundary.polityId === 'later_yan');
  const laterYan386 = getHistoricalState(386).boundaries.find(boundary => boundary.polityId === 'later_yan');
  const laterQin384 = getHistoricalState(384).boundaries.find(boundary => boundary.polityId === 'later_qin');
  const laterQin385 = getHistoricalState(385).boundaries.find(boundary => boundary.polityId === 'later_qin');
  const laterQin386 = getHistoricalState(386).boundaries.find(boundary => boundary.polityId === 'later_qin');
  const laterQinFoundingDetail = eventDetails.find(detail => detail.eventId === 'later-qin-founded');

  expect(laterYan384).toBeUndefined(); // 荥阳只作为建政事件地点，不伪装成全年政治中心
  expect(laterYanQinAnnualAudit.years.find(row => row.polityId === 'later_yan' && row.year === 384)?.sourceIds)
    .toContain('modern-geography-reference');
  expect(buildLocalMapData(getHistoricalState(384)).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[113.5308,34.8745]},
    properties:expect.objectContaining({entityId:'later-yan-founded'}),
  }));
  expect(laterYan385).toMatchObject({
    geometry:{type:'Point',coordinates:[114.98,38.52]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(laterYan386).toMatchObject({
    geometry:{type:'Point',coordinates:[114.98,38.52]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(laterQin384).toBeUndefined(); // 渭北马牧/北地阶段尚不能落到项目地点坐标
  expect(laterQin385).toBeUndefined(); // 年内征战与据点转移不合并成单点
  expect(laterQinFoundingDetail?.locationIds).toEqual([]); // 384年建政地点未能可靠定位，不得误标为386年取得的长安
  expect(buildLocalMapData(getHistoricalState(384)).events.features.some(feature => (
    feature.properties?.entityId === 'later-qin-founded'
  ))).toBe(false); // 无可靠位置时事件不进入地图标记层
  expect(laterQin386).toMatchObject({
    geometry:{type:'Point',coordinates:[108.94,34.34]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });

  for (const boundary of [laterYan385, laterYan386, laterQin386]) expect(isDefiniteBoundary(boundary!)).toBe(false);
  for (const year of [384,385,386]) {
    const snapshot = getHistoricalState(year);
    for (const polityId of ['later_yan','later_qin']) {
      expect(snapshot.boundaries.filter(boundary => boundary.polityId === polityId).filter(isDefiniteBoundary), `${polityId} ${year}`).toHaveLength(0);
    }
  }
  expect(buildLocalMapData(getHistoricalState(385)).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[114.98,38.52]},
    properties:expect.objectContaining({polityId:'later_yan',derivation:'control-centers'}),
  }));
  expect(buildLocalMapData(getHistoricalState(386)).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[114.98,38.52]},
    properties:expect.objectContaining({polityId:'later_yan',derivation:'control-centers'}),
  }));

  for (const id of ['gap-later_yan-384-386','gap-later_qin-384-386']) {
    const decision = coverageDecisions.find(item => item.id === id);
    expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed'});
    expect(decision?.citationIds).toContain('later-yan-qin-founding-384-386-primary-sources');
    expect(decision?.historicalTransitionCheck).toContain('later-yan-qin-founding-384-386.json');
  }
  expect(laterYanQinAnnualAudit.years.find(row => row.polityId === 'later_yan' && row.year === 386)?.sourceIds)
    .toContain('later-yan-zhongshan-location-gazetteer');
});

test('Later Qin termination year marks the Changan transfer without restoring its prior territory', () => {
  const state = getHistoricalState(417);
  const laterQin = state.boundaries.find(boundary => boundary.polityId === 'later_qin');
  const jin = state.activePolities.find(polity => polity.id === 'jin_eastern');

  expect(laterQinTermination417AnnualAudit).toMatchObject({decisionId:'gap-later_qin-417-417',yearCount:1,reviewStatus:'source-checked'});
  expect(laterQinTermination417AnnualAudit.years[0]).toMatchObject({
    polityId:'later_qin',year:417,centerPlaceId:'changan',territoryBoundary:null,
  });
  expect(laterQinTermination417AnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'later-qin-termination-417-primary-source','modern-geography-reference',
  ]));

  expect(laterQin).toMatchObject({
    validFrom:417,
    validTo:417,
    geometry:{type:'Point',coordinates:[108.94,34.34]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(laterQin?.notes).toContain('刘裕');
  expect(isDefiniteBoundary(laterQin!)).toBe(false);
  expect(jin).toBeDefined();
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[108.94,34.34]},
    properties:expect.objectContaining({polityId:'later_qin',derivation:'control-centers'}),
  }));
  const decision = coverageDecisions.find(item => item.id === 'gap-later_qin-417-417');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.citationIds).toContain('later-qin-termination-417-primary-source');
  expect(decision?.historicalTransitionCheck).toContain('later-qin-termination-417.json');
});

test('Xia 407–409 records its founding campaigns without backfilling Tongwan or later territory', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-xia-407-409');
  expect(xiaFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-xia-407-409',yearCount:3,reviewStatus:'source-checked',
  });
  expect(xiaFoundingAnnualAudit.years.map(row => row.year)).toEqual([407,408,409]);
  expect(xiaFoundingAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(xiaFoundingAnnualAudit.years.every(row => row.polityId === 'xia'
    && row.mapExpression === 'leave-unfilled'
    && row.centerPlaceId === null
    && row.territoryBoundary === null
    && row.conclusion.length > 0
    && row.evidenceGap.length > 0
    && row.sourceIds.includes('xia-founding-407-409-primary-sources'))).toBe(true);
  expect(xiaFoundingAnnualAudit.years[0].conclusion).toContain('高平川');
  expect(xiaFoundingAnnualAudit.years[1].conclusion).toContain('河曲');
  expect(xiaFoundingAnnualAudit.years[1].conclusion).toContain('木城');
  expect(xiaFoundingAnnualAudit.years[2].conclusion).toContain('依力川');
  expect(xiaFoundingAnnualAudit.coexistenceNotes.join(' ')).toContain('北燕');
  expect(xiaFoundingAnnualAudit.sourceNotes[0].use).toContain('卷114');
  expect(xiaFoundingAnnualAudit.sourceNotes[0].use).toContain('卷115');
  expect(xiaFoundingAnnualAudit.sourceNotes.map(note => note.id)).toContain('gaoping-historical-geography-reference');
  expect(xiaFoundingAnnualAudit.sourceNotes.find(note => note.id === 'gaoping-historical-geography-reference')?.use)
    .toContain('袭击现场定为固原城点');
  expect(xiaFoundingAnnualAudit.sourceNotes.find(note => note.id === 'gaopingchuan-river-identification-study')?.use)
    .toContain('清水河');
  expect(xiaFoundingAnnualAudit.sourceNotes.find(note => note.id === 'gaopingchuan-river-identification-study')?.use)
    .toContain('《镇原县志》');
  expect(xiaFoundingAnnualAudit.years[1].sourceIds).toContain('xia-battle-geography-shinianhai-1992');
  expect(xiaFoundingAnnualAudit.years[1].evidenceGap).toContain('木城地望仅能约定在榆林东南方向');
  expect(xiaFoundingAnnualAudit.sourceNotes.find(note => note.id === 'xia-battle-geography-shinianhai-1992')?.use)
    .toContain('未指出确地');
  expect(decision?.rationale).toContain('clio-1660-xia-410');
  expect(decision?.rationale).toContain('clio-1691-xia-417');

  for (const year of [407,408,409]) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    const xia = state.boundaries.find(boundary => boundary.polityId === 'xia');
    expect(xia, `十六国夏 ${year} 年不以邻年轮廓回填`).toBeUndefined();
    const northernYan = state.boundaries.find(boundary => boundary.polityId === 'northern_yan');
    expect(northernYan, `同断面的北燕${year}年龙城中心保留`).toMatchObject({
      geometry:{type:'Point'},evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(northernYan!)).toBe(false);
    expect(map.boundaries.features.filter(feature => feature.properties?.polityId === 'xia'), `夏${year}年没有回填几何`).toHaveLength(0);
    expect(map.events.features.some(feature => feature.properties?.entityId === 'xia-sixteen-states-founded-eighth-batch' && feature.geometry.type === 'Point'),
      `夏${year}年不以未决高平川地望产生代理点`).toBe(false);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:(northernYan!.geometry as GeoJSON.Point).coordinates},
      properties:expect.objectContaining({polityId:'northern_yan',derivation:'control-centers'}),
    }));
  }
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.historicalTransitionCheck).toContain('408年');
  expect(decision?.historicalTransitionCheck).toContain('409年');
  expect(decision?.historicalTransitionCheck).toContain('xia-founding-407-409.json');
  expect(decision?.citationIds).toContain('xia-founding-407-409-primary-sources');
});

test('Northern Wei 386 shows the later Shengle center, not the 398 Pingcheng capital', () => {
  const state = getHistoricalState(386);
  const decision = coverageDecisions.find(item => item.id === 'gap-wei_northern-386-386');
  const laterNorthernWeiSource = boundaryCatalog.find(item => item.id === 'clio-1543-wei_northern-387');
  const wei = state.boundaries.find(boundary => boundary.polityId === 'wei_northern');
  const pingcheng = places.find(place => place.id === 'pingcheng');
  const pingchengCenter = state.boundaries.find(boundary => boundary.polityId === 'wei_northern'
    && boundary.geometry.type === 'Point'
    && boundary.geometry.coordinates[0] === pingcheng?.longitude
    && boundary.geometry.coordinates[1] === pingcheng?.latitude);

  expect(northernWeiFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-wei_northern-386-386',yearCount:1,reviewStatus:'source-checked',
  });
  expect(northernWeiFoundingAnnualAudit.years).toEqual([expect.objectContaining({
    polityId:'wei_northern',year:386,mapExpression:'control-center-point',centerPlaceId:'shengle',territoryBoundary:null,
  })]);
  expect(northernWeiFoundingAnnualAudit.years[0].conclusion).toContain('牛川');
  expect(northernWeiFoundingAnnualAudit.years[0].conclusion).toContain('贺兰部');
  expect(northernWeiFoundingAnnualAudit.years[0].evidenceGap).toContain('全年');
  expect(northernWeiFoundingAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'northern-wei-founding-386-primary-source','shengle-site-archaeology-reference',
  ]));
  expect(laterNorthernWeiSource).toMatchObject({validFrom:387,validTo:393,snapshotYear:387,sourceRecord:1543,confidence:'low',controlType:'unspecified'});
  expect(decision?.rationale).toContain('clio-1543-wei_northern-387');
  expect(decision?.citationIds).toContain('cliopatria');
  expect(northernWeiFoundingAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));

  expect(wei).toMatchObject({
    validFrom:386,
    validTo:386,
    geometry:{type:'Point',coordinates:[111.8125,40.458333333333336]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(wei?.notes).toContain('牛川');
  expect(wei?.notes).toContain('盛乐');
  expect(isDefiniteBoundary(wei!)).toBe(false);
  expect(pingchengCenter).toBeUndefined();
  expect(getHistoricalState(397).boundaries.some(boundary => boundary.id === 'special-wei-northern-386-shengle-center')).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[111.8125,40.458333333333336]},
    properties:expect.objectContaining({polityId:'wei_northern',derivation:'control-centers'}),
  }));

  const record = capitalHistory.find(item => item.polityId === 'wei_northern' && item.validFrom === 386);
  expect(record).toMatchObject({placeId:'shengle',validTo:397});
  expect(coverageDecisions.find(item => item.id === 'gap-wei_northern-386-386')?.historicalTransitionCheck)
    .toContain('northern-wei-founding-386.json');
});

test('Northern Wei 534 termination does not carry a single successor border backward', () => {
  const state = getHistoricalState(534);
  const map = buildLocalMapData(state);
  const northernWei = state.boundaries.filter(boundary => boundary.polityId === 'wei_northern');
  const easternWeiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1982-wei_eastern-534');
  const decision = coverageDecisions.find(item => item.id === 'gap-wei_northern-534-534');

  expect(northernWei).toEqual([]);
  expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'wei_northern')).toBe(false);
  expect(map.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    properties:expect.objectContaining({entityId:'northern-wei-xiaowu-departs-luoyang-534'}),
  }));
  expect(map.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[114.37,36.33]},
    properties:expect.objectContaining({entityId:'eastern-wei-founded'}),
  }));
  expect(map.events.features.some(feature => feature.properties?.entityId === 'northern-wei-ended-534')).toBe(false);
  expect(state.activePolities.some(polity => polity.id === 'wei_eastern')).toBe(true);
  expect(easternWeiSource).toMatchObject({validFrom:534,validTo:545,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:eastern-wei-founding-transition-534',
    boundaryId:'clio-1982-wei_eastern-534',
    polityIds:['wei_eastern'],
    years:[534],
    status:'requires-review',
  }));
  expect(state.boundaries.some(boundary => boundary.id === easternWeiSource?.id)).toBe(false);
  expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'wei_eastern'
    && feature.geometry.type !== 'Point')).toBe(false);
  expect(map.capitalPlaces.features.some(feature => feature.properties?.polityId === 'wei_eastern'
    && feature.properties?.placeId === 'ye')).toBe(true);
  expect(getHistoricalState(535).boundaries.find(boundary => boundary.id === easternWeiSource?.id)?.geometry)
    .toEqual(easternWeiSource?.geometry);
  expect(buildLocalMapData(getHistoricalState(535)).events.features.some(feature =>
    ['northern-wei-xiaowu-departs-luoyang-534','eastern-wei-founded'].includes(String(feature.properties?.entityId)))).toBe(false);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.historicalTransitionCheck).toContain('535年');
  expect(decision?.citationIds).toContain('northern-wei-termination-534-primary-sources');
  expect(northernWeiTerminationAnnualAudit).toMatchObject({
    decisionId:'gap-wei_northern-534-534',yearCount:1,reviewStatus:'source-checked',
  });
  expect(northernWeiTerminationAnnualAudit.years).toEqual([expect.objectContaining({
    polityId:'wei_northern',year:534,mapExpression:'event-location-points',centerPlaceId:null,territoryBoundary:null,
  })]);
  expect(northernWeiTerminationAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(northernWeiTerminationAnnualAudit.years[0].conclusion).toContain('邺');
  expect(northernWeiTerminationAnnualAudit.years[0].conclusion).toContain('公历535年');
  expect(northernWeiTerminationAnnualAudit.years[0].evidenceGap).toContain('边界');
  expect(northernWeiTerminationAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'northern-wei-termination-534-primary-sources','northern-wei-termination-calendar-conversion',
  ]));
  expect(sourceNotes.map(source => source.id)).toContain('northern-wei-termination-534-primary-sources');
  expect(decision?.historicalTransitionCheck).toContain('northern-wei-termination-534.json');
});

test('Liu Song 420–425 shows Jiankang as a center without inferring annual borders', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-song_southern-420-425');
  expect(liuSongFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-song_southern-420-425',yearCount:6,reviewStatus:'source-checked',
  });
  expect(liuSongFoundingAnnualAudit.years.map(row => row.year)).toEqual([420,421,422,423,424,425]);
  expect(liuSongFoundingAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(liuSongFoundingAnnualAudit.years.every(row => row.polityId === 'song_southern' && row.territoryBoundary === null)).toBe(true);
  expect(liuSongFoundingAnnualAudit.years.every(row =>
    row.sourceIds.includes('liu-song-founding-420-425-primary-sources') && row.sourceIds.includes('modern-geography-reference'),
  )).toBe(true);
  expect(sourceNotes.map(source => source.id)).toContain('liu-song-founding-420-425-primary-sources');
  expect(decision?.rationale).toContain('clio-1709-song_southern-426');
  expect(decision?.citationIds).toContain('liu-song-founding-420-425-primary-sources');
  expect(decision?.historicalTransitionCheck).toContain('liu-song-founding-420-425.json');

  for (const year of [420,421,422,423,424,425]) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.id === 'special-liu-song-420-425-jiankang-center');
    expect(center, `刘宋 ${year} 年应显示建康中心参照`).toMatchObject({
      validFrom:420,
      validTo:425,
      geometry:{type:'Point',coordinates:[118.80,32.06]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[118.80,32.06]},
      properties:expect.objectContaining({polityId:'song_southern',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  expect(getHistoricalState(426).boundaries.some(boundary => boundary.id === 'special-liu-song-420-425-jiankang-center')).toBe(false);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.historicalTransitionCheck).toContain('422年');
  expect(decision?.historicalTransitionCheck).toContain('424年');
});

test('Southern Qi 479 shows the abdication center without backfilling a full territorial boundary', () => {
  const state = getHistoricalState(479);
  const center = state.boundaries.find(boundary => boundary.id === 'special-qi-southern-479-jiankang-center');
  const songSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1860-song_southern-476');
  const qiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1897-qi_southern-480');
  const decision = coverageDecisions.find(item => item.id === 'gap-qi_southern-479-479');

  expect(southernQiFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-qi_southern-479-479',yearCount:1,reviewStatus:'source-checked',
  });
  expect(southernQiFoundingAnnualAudit.years).toEqual([expect.objectContaining({
    polityId:'qi_southern',year:479,mapExpression:'control-center-point',centerPlaceId:'jiankang',territoryBoundary:null,
  })]);
  expect(southernQiFoundingAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'southern-qi-founding-479-primary-source','modern-geography-reference',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('southern-qi-founding-479.json');

  expect(center).toMatchObject({
    validFrom:479,
    validTo:479,
    geometry:{type:'Point',coordinates:[118.80,32.06]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(center!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[118.80,32.06]},
    properties:expect.objectContaining({polityId:'qi_southern',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(state.activePolities.some(polity => polity.id === 'song_southern')).toBe(true);
  expect(state.activePolities.some(polity => polity.id === 'qi_southern')).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(songSource).toMatchObject({validFrom:476,validTo:479,confidence:'low',controlType:'unspecified'});
  expect(qiSource).toMatchObject({validFrom:480,validTo:499,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:song-southern-transition-479',
    boundaryId:'clio-1860-song_southern-476',
    polityIds:['song_southern','qi_southern'],
    years:[479],
    status:'requires-review',
  }));
  expect(songSource?.geometry).toBeDefined();
  expect(getHistoricalState(478).boundaries.find(boundary => boundary.id === songSource?.id)?.geometry)
    .toEqual(songSource?.geometry);
  expect(state.boundaries.some(boundary => boundary.id === songSource?.id)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature =>
    feature.properties?.polityId === 'song_southern' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(480).boundaries.find(boundary => boundary.id === qiSource?.id)?.geometry)
    .toEqual(qiSource?.geometry);
});

test('Southern Liang 502–509 keeps Jiankang as a center while leaving changing borders unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-liang_southern-502-509');
  const qiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1928-qi_southern-500');
  const liangSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1937-liang_southern-510');
  expect(southernLiangFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-liang_southern-502-509',yearCount:8,reviewStatus:'source-checked',
  });
  expect(southernLiangFoundingAnnualAudit.years.map(row => row.year)).toEqual([502,503,504,505,506,507,508,509]);
  expect(southernLiangFoundingAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(southernLiangFoundingAnnualAudit.years.every(row => row.polityId === 'liang_southern' && row.territoryBoundary === null)).toBe(true);
  expect(southernLiangFoundingAnnualAudit.years.every(row =>
    row.sourceIds.includes('liang-founding-502-509-primary-sources') && row.sourceIds.includes('modern-geography-reference'),
  )).toBe(true);
  expect(southernLiangFoundingAnnualAudit.years.find(row => row.year === 507)).toMatchObject({
    mapExpression:'capital-and-event-points',
    mapEventIds:['battle-zhongli-507'],
    centerPlaceId:'jiankang',
  });
  expect(decision?.historicalTransitionCheck).toContain('southern-liang-founding-502-509.json');
  for (const year of [502,503,504,505,506,507,508,509]) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.id === 'special-liang-southern-502-509-jiankang-center');
    expect(center, `南梁 ${year} 年应显示建康中心参照`).toMatchObject({
      validFrom:502,
      validTo:509,
      geometry:{type:'Point',coordinates:[118.80,32.06]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[118.80,32.06]},
      properties:expect.objectContaining({polityId:'liang_southern',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  expect(qiSource).toMatchObject({validFrom:500,validTo:502,confidence:'low',controlType:'unspecified'});
  expect(liangSource).toMatchObject({validFrom:510,validTo:533,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:qi-southern-liang-transition-502',
    boundaryId:'clio-1928-qi_southern-500',
    polityIds:['qi_southern','liang_southern'],
    years:[502],
    status:'requires-review',
  }));
  expect(getHistoricalState(501).boundaries.find(boundary => boundary.id === qiSource?.id)?.geometry)
    .toEqual(qiSource?.geometry);
  expect(getHistoricalState(502).boundaries.some(boundary => boundary.id === qiSource?.id)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(502)).boundaries.features.some(feature =>
    feature.properties?.polityId === 'qi_southern' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(510).boundaries.find(boundary => boundary.id === liangSource?.id)?.geometry)
    .toEqual(liangSource?.geometry);
  expect(getHistoricalState(510).boundaries.some(boundary => boundary.id === 'special-liang-southern-502-509-jiankang-center')).toBe(false);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.historicalTransitionCheck).toContain('天监');
});

test('Southern Chen and Northern Zhou coexisting in 557–560 show separate centers without clipped borders', () => {
  const chenDecision = coverageDecisions.find(item => item.id === 'gap-chen_southern-557-560');
  const zhouDecision = coverageDecisions.find(item => item.id === 'gap-zhou_northern-557-560');
  const northernQiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2068-qi_northern-555');
  expect(southernChenFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-chen_southern-557-560',yearCount:4,reviewStatus:'source-checked',
  });
  expect(northernZhouFoundingAnnualAudit).toMatchObject({
    decisionId:'gap-zhou_northern-557-560',yearCount:4,reviewStatus:'source-checked',
  });
  expect(northernQiSource).toMatchObject({validFrom:555,validTo:560,confidence:'low',controlType:'unspecified'});
  for (const audit of [southernChenFoundingAnnualAudit,northernZhouFoundingAnnualAudit]) {
    expect(audit.coexistenceNotes.join(' ')).toContain('record 2068');
    expect(audit.sourceNotes).toContainEqual(expect.objectContaining({
      id:'cliopatria',use:expect.stringContaining('controlType 为 unspecified'),
    }));
  }
  expect(chenDecision?.citationIds).toContain('cliopatria');
  expect(zhouDecision?.citationIds).toContain('cliopatria');
  for (const audit of [southernChenFoundingAnnualAudit,northernZhouFoundingAnnualAudit]) {
    expect(audit.years.map(row => row.year)).toEqual([557,558,559,560]);
    expect(audit.years.some(row => row.year === 0)).toBe(false);
    expect(audit.years.every(row => row.territoryBoundary === null)).toBe(true);
  }
  expect(southernChenFoundingAnnualAudit.years.every(row => row.polityId === 'chen_southern'
    && row.sourceIds.includes('southern-chen-founding-557-primary-sources')
    && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  expect(northernZhouFoundingAnnualAudit.years.every(row => row.polityId === 'zhou_northern'
    && row.sourceIds.includes('northern-zhou-founding-557-primary-sources')
    && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  expect(chenDecision?.historicalTransitionCheck).toContain('southern-chen-founding-557-560.json');
  expect(zhouDecision?.historicalTransitionCheck).toContain('northern-zhou-founding-557-560.json');
  expect(chenDecision?.rationale).toContain('record 2080');
  expect(chenDecision?.rationale).toContain('仅在557年');
  expect(zhouDecision?.rationale).toContain('record 2099');
  expect(zhouDecision?.rationale).toContain('仅在557年');
  for (const year of [557,558,559,560]) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    const chen = state.boundaries.find(boundary => boundary.id === 'special-chen-southern-557-560-jiankang-center');
    const zhou = state.boundaries.find(boundary => boundary.id === 'special-zhou-northern-557-560-changan-center');
    const qi = state.boundaries.find(boundary => boundary.id === northernQiSource?.id);
    expect(chen).toMatchObject({validFrom:557,validTo:560,geometry:{type:'Point',coordinates:[118.80,32.06]}});
    expect(zhou).toMatchObject({validFrom:557,validTo:560,geometry:{type:'Point',coordinates:[108.94,34.34]}});
    expect(qi?.geometry, `北齐${year}年的来源几何保持原样`).toEqual(northernQiSource?.geometry);
    expect(isDefiniteBoundary(chen!)).toBe(false);
    expect(isDefiniteBoundary(zhou!)).toBe(false);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[118.80,32.06]},
      properties:expect.objectContaining({polityId:'chen_southern',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.94,34.34]},
      properties:expect.objectContaining({polityId:'zhou_northern',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    expect(map.boundaries.features.some(feature => String(feature.id) === northernQiSource?.id)).toBe(true);
    expect(map.boundaries.features.filter(feature => ['chen_southern','zhou_northern'].includes(String(feature.properties?.polityId))
      && feature.geometry.type !== 'Point')).toHaveLength(0);
    expect(state.activePolities.some(polity => polity.id === 'chen_southern')).toBe(true);
    expect(state.activePolities.some(polity => polity.id === 'zhou_northern')).toBe(true);
    expect(state.activePolities.some(polity => polity.id === 'qi_northern')).toBe(true);
  }
  expect(chenDecision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(zhouDecision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(getHistoricalState(561).boundaries.some(boundary => boundary.id === 'special-chen-southern-557-560-jiankang-center')).toBe(false);
  expect(getHistoricalState(561).boundaries.some(boundary => boundary.id === 'special-zhou-northern-557-560-changan-center')).toBe(false);
});

test('holds the ending Southern Liang and Western Wei interval outlines only in the 557 transition year', () => {
  const southernLiangSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2080-liang_southern-555');
  const westernWeiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2099-wei_western-555');
  expect(southernLiangSource).toMatchObject({validFrom:555,validTo:557,confidence:'low',controlType:'unspecified'});
  expect(westernWeiSource).toMatchObject({validFrom:555,validTo:557,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:southern-liang-chen-transition-557',
    boundaryId:'clio-2080-liang_southern-555',
    polityIds:['liang_southern','chen_southern'],
    years:[557],
    status:'requires-review',
  }));
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:western-wei-zhou-transition-557',
    boundaryId:'clio-2099-wei_western-555',
    polityIds:['wei_western','zhou_northern'],
    years:[557],
    status:'requires-review',
  }));
  expect(southernLiangSource?.geometryReviewHolds).toEqual(expect.arrayContaining([
    expect.objectContaining({conflictId:'conflict:southern-liang-chen-transition-557',years:[557],status:'requires-review'}),
  ]));
  expect(westernWeiSource?.geometryReviewHolds).toEqual(expect.arrayContaining([
    expect.objectContaining({conflictId:'conflict:western-wei-zhou-transition-557',years:[557],status:'requires-review'}),
  ]));

  for (const [year, boundaryId, source] of [
    [556,'clio-2080-liang_southern-555',southernLiangSource],
    [556,'clio-2099-wei_western-555',westernWeiSource],
  ] as const) {
    expect(getHistoricalState(year).boundaries.find(boundary => boundary.id === boundaryId)?.geometry).toEqual(source?.geometry);
    expect(buildLocalMapData(getHistoricalState(year)).boundaries.features.some(feature => String(feature.id) === boundaryId)).toBe(true);
  }
  const state = getHistoricalState(557);
  const map = buildLocalMapData(state);
  expect(state.boundaries.some(boundary => [southernLiangSource?.id,westernWeiSource?.id].includes(boundary.id))).toBe(false);
  expect(map.boundaries.features.some(feature => [southernLiangSource?.id,westernWeiSource?.id].includes(String(feature.id)))).toBe(false);
  expect(southernLiangSource?.geometry).toBeDefined();
  expect(westernWeiSource?.geometry).toBeDefined();
});

test('Northern Qi and the first Turkic Khaganate show distinct center references in 550–554', () => {
  const qiDecision = coverageDecisions.find(item => item.id === 'gap-qi_northern-550-554');
  const turkicDecision = coverageDecisions.find(item => item.id === 'gap-turkic-552-554');
  const easternWeiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2059-wei_eastern-546');
  const northernQiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2068-qi_northern-555');
  expect(northernQiFoundingAnnualAudit).toMatchObject({decisionId:'gap-qi_northern-550-554',yearCount:5,reviewStatus:'source-checked'});
  expect(firstTurkicKhaganateFoundingAnnualAudit).toMatchObject({decisionId:'gap-turkic-552-554',yearCount:3,reviewStatus:'source-checked'});
  expect(northernQiFoundingAnnualAudit.years.map(row => row.year)).toEqual([550,551,552,553,554]);
  expect(firstTurkicKhaganateFoundingAnnualAudit.years.map(row => row.year)).toEqual([552,553,554]);
  expect([...northernQiFoundingAnnualAudit.years,...firstTurkicKhaganateFoundingAnnualAudit.years]
    .every(row => row.territoryBoundary === null && row.year !== 0)).toBe(true);
  expect(northernQiFoundingAnnualAudit.years.every(row => row.polityId === 'qi_northern'
    && row.sourceIds.includes('northern-qi-founding-550-554-sources')
    && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  const qi552 = northernQiFoundingAnnualAudit.years.find(row => row.year === 552);
  expect(qi552?.conclusion).toMatch(/黄栌岭.*社平戍|社平戍.*黄栌岭/);
  expect(qi552?.conclusion).toMatch(/四百余里.*三十六戍|三十六戍.*四百余里/);
  expect(qi552?.evidenceGap).toMatch(/不等于.*边界|不能.*边界/);
  expect(qi552?.sourceIds).toContain('northern-qi-great-wall-552-ai-chong-2007');
  expect(northernQiFoundingAnnualAudit.sourceNotes.map(source => source.id))
    .toContain('northern-qi-great-wall-552-ai-chong-2007');
  expect(firstTurkicKhaganateFoundingAnnualAudit.years.every(row => row.polityId === 'turkic'
    && row.sourceIds.includes('turkic-founding-552-554-sources'))).toBe(true);
  const turkic554 = firstTurkicKhaganateFoundingAnnualAudit.years.find(row => row.year === 554);
  expect(turkic554?.conclusion).toContain('十一月突厥再攻柔然');
  expect(turkic554?.conclusion).toContain('柔然举国奔齐');
  expect(turkic554?.conclusion).toContain('突厥请降');
  expect(turkic554?.evidenceGap).toContain('不等同于稳定边界');
  expect(turkic554?.sourceIds).toContain('turkic-founding-552-554-sources');
  expect(qiDecision?.historicalTransitionCheck).toContain('northern-qi-founding-550-554.json');
  expect(turkicDecision?.historicalTransitionCheck).toContain('turkic-founding-552-554.json');
  for (const year of [550,551,552,553,554]) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    const qi = state.boundaries.find(boundary => boundary.id === 'special-qi-northern-550-554-ye-center');
    expect(qi).toMatchObject({validFrom:550,validTo:554,geometry:{type:'Point',coordinates:[114.37,36.33]}});
    expect(isDefiniteBoundary(qi!)).toBe(false);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[114.37,36.33]},
      properties:expect.objectContaining({polityId:'qi_northern',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    if (year >= 552) {
      const turkic = state.boundaries.find(boundary => boundary.id === 'special-turkic-552-554-uhtuken-reference');
      expect(turkic).toMatchObject({
        validFrom:552,
        validTo:554,
        geometry:{type:'Point',coordinates:[102.50,47.50]},
        evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
        controlType:'unspecified',
      });
      expect(isDefiniteBoundary(turkic!)).toBe(false);
      expect(map.boundaries.features).toContainEqual(expect.objectContaining({
        geometry:{type:'Point',coordinates:[102.50,47.50]},
        properties:expect.objectContaining({polityId:'turkic',evidenceLevel:'D',derivation:'control-centers'}),
      }));
    }
    expect(map.boundaries.features.filter(feature => ['qi_northern','turkic'].includes(String(feature.properties?.polityId))
      && feature.geometry.type !== 'Point')).toHaveLength(0);
  }
  expect(qiDecision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(turkicDecision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(easternWeiSource).toMatchObject({validFrom:546,validTo:550,confidence:'low',controlType:'unspecified'});
  expect(northernQiSource).toMatchObject({validFrom:555,validTo:560,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:eastern-wei-qi-transition-550',
    boundaryId:'clio-2059-wei_eastern-546',
    polityIds:['wei_eastern','qi_northern'],
    years:[550],
    status:'requires-review',
  }));
  expect(getHistoricalState(549).boundaries.find(boundary => boundary.id === easternWeiSource?.id)?.geometry)
    .toEqual(easternWeiSource?.geometry);
  expect(getHistoricalState(550).boundaries.some(boundary => boundary.id === easternWeiSource?.id)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(550)).boundaries.features.some(feature =>
    feature.properties?.polityId === 'wei_eastern' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(555).boundaries.find(boundary => boundary.id === northernQiSource?.id)?.geometry)
    .toEqual(northernQiSource?.geometry);
});

test('Later Turkic Khaganate audit accounts for every year without carrying the earlier outline forward', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-turkic-661-744');
  expect(laterTurkicKhaganateAnnualAudit).toMatchObject({
    decisionId:'gap-turkic-661-744',yearCount:84,reviewStatus:'source-checked',
  });
  expect(laterTurkicKhaganateAnnualAudit.years.map(row => row.year))
    .toEqual(Array.from({length:84}, (_, index) => 661 + index));
  expect(laterTurkicKhaganateAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(laterTurkicKhaganateAnnualAudit.years.every(row => row.polityId === 'turkic'
    && (row.year >= 682 && row.year <= 743
      ? row.mapExpression === 'control-center-point' && row.centerPlaceId === 'uhtuken'
      : row.mapExpression === 'leave-unfilled' && row.centerPlaceId === null)
    && row.territoryBoundary === null
    && row.conclusion.length > 20
    && row.evidenceGap.length > 30
    && row.sourceIds.includes('turkic-history-db')
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(laterTurkicKhaganateAnnualAudit.years.filter(row => row.year >= 682 && row.year <= 743)
    .every(row => row.sourceIds.includes('turkic-otuken-second-khaganate-study'))).toBe(true);
  const turkic742 = laterTurkicKhaganateAnnualAudit.years.find(row => row.year === 742);
  expect(turkic742?.conclusion).toContain('拔悉密、回纥、葛逻禄三部');
  expect(turkic742?.conclusion).toContain('乌苏米施可汗');
  expect(turkic742?.sourceIds).toContain('zizhi-tongjian-215-turkic-collapse-742-744');
  const turkic743 = laterTurkicKhaganateAnnualAudit.years.find(row => row.year === 743);
  expect(turkic743?.conclusion).toContain('743年条目未载突厥汗位更迭');
  expect(turkic743?.evidenceGap).toContain('不代表联盟');
  expect(turkic743?.sourceIds).toContain('zizhi-tongjian-215-turkic-collapse-742-744');
  const turkic744 = laterTurkicKhaganateAnnualAudit.years.find(row => row.year === 744);
  expect(turkic744?.conclusion).toContain('突厥余众立白眉可汗');
  expect(turkic744?.conclusion).toContain('骨力裴罗自立');
  expect(turkic744?.conclusion).toContain('乌德犍山');
  expect(turkic744?.evidenceGap).toContain('不是全年统一接管');
  expect(turkic744?.sourceIds).toContain('zizhi-tongjian-215-turkic-collapse-742-744');
  expect(decision?.historicalTransitionCheck).toContain('745年史料才记回纥击杀白眉');
  expect(laterTurkicKhaganateAnnualAudit.years[21].conclusion).toContain('骨咄禄');
  expect(laterTurkicKhaganateAnnualAudit.years[83].conclusion).toContain('回纥');
  expect(decision?.historicalTransitionCheck).toContain('turkic-khaganates-661-744.json');
  for (const year of [661,681,744]) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.polityId === 'turkic')).toBe(false);
    expect(buildLocalMapData(state).capitalPlaces.features.some(feature => feature.properties?.polityId === 'turkic')).toBe(false);
  }
  for (const year of [682,716,732,742,743]) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    expect(map.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[102.50,47.50]},
      properties:expect.objectContaining({polityId:'turkic',placeId:'uhtuken'}),
    }));
    expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'turkic')).toBe(false);
  }
});

test('Early Tibetan formation uses a regional Yarlung core reference without adding annual borders', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-tibetan_empire-618-622');
  expect(earlyTibetanAnnualAudit).toMatchObject({
    decisionId:'gap-tibetan_empire-618-622',yearCount:5,reviewStatus:'source-checked',
  });
  expect(earlyTibetanAnnualAudit.years.map(row => row.year)).toEqual([618,619,620,621,622]);
  expect(earlyTibetanAnnualAudit.years.every(row => row.polityId === 'tibetan_empire'
    && row.mapExpression === 'political-core-reference-point'
    && row.centerPlaceId === 'yalong'
    && row.territoryBoundary === null
    && row.sourceIds.includes('tibetan-empire-early-history-ucpress')
    && row.sourceIds.includes('tibetan-yarlung-polities-uva'))).toBe(true);
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining([
    'tibetan-empire-early-history-ucpress','tibetan-yarlung-polities-uva',
  ]));
  expect(earlyTibetanAnnualAudit.years[0].conclusion).toContain('约年映射');
  expect(earlyTibetanAnnualAudit.years[0].conclusion).toContain('617');
  expect(earlyTibetanAnnualAudit.years.slice(1).every(row => row.evidenceGap.length > 30)).toBe(true);
  expect(decision?.historicalTransitionCheck).toContain('tibetan-empire-early-formation-618-622.json');
  for (const year of [618,619,620,621,622]) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    const center = state.boundaries.find(boundary => boundary.polityId === 'tibetan_empire');
    expect(center, `吐蕃${year}年雅砻核心区域参照`).toMatchObject({
      geometry:{type:'Point',coordinates:[91.77,29.24]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[91.77,29.24]},
      properties:expect.objectContaining({polityId:'tibetan_empire',derivation:'control-centers'}),
    }));
    if (year === 618) {
      expect(map.boundaries.features).toContainEqual(expect.objectContaining({
        geometry:{type:'Point',coordinates:[108.935,34.25]},
        properties:expect.objectContaining({polityId:'tang',evidenceLevel:'D',derivation:'control-centers'}),
      }));
      expect(map.boundaries.features.filter(feature => ['tang','tibetan_empire'].includes(String(feature.properties?.polityId))
        && feature.geometry.type !== 'Point')).toHaveLength(0);
    }
  }
});

test('Nanzhao 738–740 keeps the Taihe site as a political-center point without inferring territory', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-nanzhao-738-740');
  const firstSourceBoundary = boundaryCatalog.find(boundary => boundary.id === 'clio-2753-nanzhao-741');
  expect(nanzhaoAnnualAudit).toMatchObject({
    decisionId:'gap-nanzhao-738-740',yearCount:3,reviewStatus:'source-checked',
  });
  expect(nanzhaoAnnualAudit.years.map(row => row.year)).toEqual([738,739,740]);
  expect(nanzhaoAnnualAudit.years[0]).toMatchObject({
    polityId:'nanzhao',mapExpression:'event-location-point',centerPlaceId:'taihe',territoryBoundary:null,
  });
  expect(nanzhaoAnnualAudit.years.slice(1).every(row => row.polityId === 'nanzhao'
    && row.mapExpression === 'control-center-point' && row.centerPlaceId === 'taihe'
    && row.territoryBoundary === null)).toBe(true);
  expect(nanzhaoAnnualAudit.years.every(row => row.sourceIds.includes('nanzhao-formation-zizhi-214')
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(decision?.historicalTransitionCheck).toContain('nanzhao-early-territorial-gap-738-740.json');

  const state738 = getHistoricalState(738);
  expect(state738.boundaries.filter(boundary => boundary.polityId === 'nanzhao')).toEqual([]);
  expect(buildLocalMapData(state738).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[100.17,25.68]},
    properties:expect.objectContaining({entityId:'nanzhao-founded'}),
  }));
  for (const year of [739,740]) {
    const state = getHistoricalState(year);
    const taihe = state.boundaries.find(boundary => boundary.polityId === 'nanzhao');
    expect(taihe).toMatchObject({
      geometry:{type:'Point',coordinates:[100.17,25.68]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(taihe!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[100.17,25.68]},
      properties:expect.objectContaining({polityId:'nanzhao',derivation:'control-centers'}),
    }));
  }
  expect(firstSourceBoundary).toMatchObject({validFrom:741,validTo:749,confidence:'low',controlType:'unspecified'});
  expect(getHistoricalState(740).boundaries.some(boundary => boundary.id === firstSourceBoundary?.id)).toBe(false);
  expect(getHistoricalState(741).boundaries.find(boundary => boundary.id === firstSourceBoundary?.id)?.geometry)
    .toEqual(firstSourceBoundary?.geometry);
});

test('Western Zhou annual gap shows the Fenghao royal core without inferring territory from feudal or military reach', () => {
  expect(westernZhouAnnualAudit).toMatchObject({decisionId:'gap-zhou_western--1046--1001',yearCount:46});
  expect(coverageDecisions.find(item => item.id === 'gap-zhou_western--1046--1001')?.citationIds)
    .toContain('western-zhou-chronology-zhang-2023');
  expect(westernZhouAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length:46}, (_, index) => -1046 + index),
  );
  expect(westernZhouAnnualAudit.years.every(row => row.mapExpression === 'capital-center-point'
    && row.centerPlaceId === 'fenghao' && row.directBoundary === null)).toBe(true);
  expect(westernZhouAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(westernZhouAnnualAudit.years.every(row => row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  const initialExpedition = westernZhouAnnualAudit.years.find(row => row.year === -1046);
  const interlude = westernZhouAnnualAudit.years.find(row => row.year === -1045);
  const conquest = westernZhouAnnualAudit.years.find(row => row.year === -1044);
  for (const row of [initialExpedition, interlude, conquest]) {
    expect(row?.sourceIds).toContain('western-zhou-chronology-zhang-2023');
  }
  expect(initialExpedition?.evidenceGap).toContain('克商年份不同');
  expect(interlude?.evidenceGap).toContain('初次伐商与克商之间');
  expect(conquest?.evidenceGap).toContain('克商年');
  expect(initialExpedition?.conclusion).toContain('前1046年为初次伐商');
  expect(interlude?.conclusion).toContain('两次征商行动之间');
  expect(conquest?.conclusion).toContain('前1044年定为克商年');

  const shangTransitionConflict = boundaryGeometryConflicts.find(conflict =>
    conflict.conflictId === 'conflict:shang-western-zhou-transition:1046-bce');
  expect(shangTransitionConflict).toMatchObject({
    boundaryId:'clio-110-shang--1100', polityIds:['shang','zhou_western'], years:[-1046],
    status:'requires-review',
  });
  const shangSourceBoundary = boundaryCatalog.find(boundary => boundary.id === 'clio-110-shang--1100');
  expect(shangSourceBoundary?.geometry.type).not.toBe('Point');
  expect(shangSourceBoundary?.geometryReviewHolds).toContainEqual(expect.objectContaining({
    conflictId:'conflict:shang-western-zhou-transition:1046-bce', years:[-1046], status:'requires-review',
  }));
  expect(getHistoricalState(-1047).boundaries).toContainEqual(expect.objectContaining({id:'clio-110-shang--1100'}));
  expect(getHistoricalState(-1046).boundaries.some(boundary => boundary.id === 'clio-110-shang--1100')).toBe(false);

  for (let year = -1046; year <= -1001; year++) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    expect(state.boundaries.some(boundary => boundary.polityId === 'zhou_western'
      && boundary.geometry.type !== 'Point'), `unexpected Western Zhou territory in ${year}`).toBe(false);
    expect(map.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.76,34.23]},
      properties:expect.objectContaining({polityId:'zhou_western',placeId:'fenghao'}),
    }));
  }
});

test('Southern Ming 1644 records the Hongguang center without implying a single-year territory', () => {
  expect(southernMing1644AnnualAudit).toMatchObject({decisionId:'gap-ming_southern-1644-1644',yearCount:1});
  expect(southernMing1644AnnualAudit.years).toHaveLength(1);
  expect(southernMing1644AnnualAudit.years[0]).toMatchObject({
    polityId:'ming_southern', year:1644, mapExpression:'phase-center-point',
    centerPlaceId:'yingtian', territoryBoundary:null,
  });
  expect(southernMing1644AnnualAudit.years[0].sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);

  const state = getHistoricalState(1644);
  const mapData = buildLocalMapData(state);
  expect(state.boundaries.filter(boundary => boundary.polityId === 'ming_southern')).toEqual([]);
  expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[118.80,32.06]},
    properties:expect.objectContaining({polityId:'ming_southern',placeId:'yingtian'}),
  }));
  const hongguangEvent = events.find(event => event.id === 'hongguang-nanjing-founded');
  expect(hongguangEvent).toMatchObject({
    year:1644,
    placeId:'yingtian',
    coordinates:[118.80,32.06],
    locationPrecision:'approximate',
  });
  expect(hongguangEvent?.sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[118.80,32.06]},
    properties:expect.objectContaining({entityId:'hongguang-nanjing-founded'}),
  }));
  expect(mapData.events.features.some(feature => feature.properties?.entityId === 'southern-ming-founded')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(1643)).events.features.some(feature =>
    feature.properties?.entityId === 'hongguang-nanjing-founded')).toBe(false);
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'ming_southern'
    && feature.geometry.type.endsWith('Polygon'))).toBe(false);
});

test('Southern Ming 1659–1662 records exile and termination without inherited territory', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-ming_southern-1659-1662');
  expect(southernMingEndAnnualAudit).toMatchObject({decisionId:'gap-ming_southern-1659-1662',yearCount:4});
  expect(southernMingEndAnnualAudit.years.map(row => row.year)).toEqual([1659,1660,1661,1662]);
  expect(southernMingEndAnnualAudit.years.every(row => row.mapExpression === 'leave-unfilled'
    && row.centerPlaceId === null && row.territoryBoundary === null)).toBe(true);
  expect(southernMingEndAnnualAudit.years.every(row => row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',reviewedAt:'2026-11-03'});
  expect(decision?.citationIds).toContain('dpm-zhu-youlang-biography');
  expect(decision?.historicalTransitionCheck).toContain('southern-ming-termination-1659-1662.json');
  for (const year of [1659,1660,1661,1662]) {
    expect(getHistoricalState(year).boundaries.filter(boundary => boundary.polityId === 'ming_southern')).toEqual([]);
  }
  const state1662 = getHistoricalState(1662);
  expect(state1662.events).toContainEqual(expect.objectContaining({id:'yongli-regime-ended-1662', placeId:'kunming'}));
  expect(buildLocalMapData(state1662).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[102.71,25.04]},
    properties:expect.objectContaining({entityId:'yongli-regime-ended-1662'}),
  }));
});

test('Later Jin 1616–1618 shows the sourced Hetu Ala capital point without an inferred border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_jin-1616-1618');
  expect(laterJinFoundingAnnualAudit).toMatchObject({decisionId:'gap-later_jin-1616-1618',yearCount:3});
  expect(laterJinFoundingAnnualAudit.years.map(row => row.year)).toEqual([1616,1617,1618]);
  expect(laterJinFoundingAnnualAudit.years.every(row => row.mapExpression === 'capital-point'
    && row.centerPlaceId === 'heturnala' && row.territoryBoundary === null
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',reviewedAt:'2026-11-03'});
  expect(decision?.historicalTransitionCheck).toContain('later-jin-founding-1616-1618.json');
  const foundingEvent = events.find(event => event.id === 'later-jin-founded');
  expect(foundingEvent).toMatchObject({
    placeId:'heturnala',
    coordinates:[124.26,41.72],
    locationPrecision:'approximate',
  });
  expect(foundingEvent?.sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);
  expect(buildLocalMapData(getHistoricalState(1616)).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[124.26,41.72]},
    properties:expect.objectContaining({entityId:'later-jin-founded'}),
  }));
  expect(buildLocalMapData(getHistoricalState(1615)).events.features.some(feature =>
    feature.properties?.entityId === 'later-jin-founded')).toBe(false);

  for (const year of [1616,1617,1618]) {
    const state = getHistoricalState(year);
    const mapData = buildLocalMapData(state);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'later_jin')).toEqual([]);
    expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[124.26,41.72]},
      properties:expect.objectContaining({polityId:'later_jin',placeId:'heturnala'}),
    }));
    expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'later_jin'
      && feature.geometry.type.endsWith('Polygon'))).toBe(false);
  }
});

test('Later Jin 1636 records the change to Qing without carrying a Later Jin border forward', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_jin-1636-1636');
  const state = getHistoricalState(1636);
  const mapData = buildLocalMapData(state);
  expect(laterJin1636AnnualAudit).toMatchObject({decisionId:'gap-later_jin-1636-1636',yearCount:1,reviewStatus:'source-checked'});
  expect(laterJin1636AnnualAudit.years[0]).toMatchObject({
    year:1636, mapExpression:'leave-unfilled', centerPlaceId:null, territoryBoundary:null,
  });
  expect(laterJin1636AnnualAudit.years[0].sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',reviewedAt:'2026-11-03'});
  expect(decision?.citationIds).toContain('dpm-hongtaiji-biography');
  expect(decision?.historicalTransitionCheck).toContain('later-jin-termination-1636.json');
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['later_jin','qing']));
  expect(state.events).toContainEqual(expect.objectContaining({id:'qing-founded',placeId:'shengjing'}));
  expect(eventDetails.find(detail => detail.eventId === 'qing-founded')).toMatchObject({
    polityIds:['later_jin','qing'],
    relatedEventIds:expect.arrayContaining(['later-jin-founded']),
  });
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[123.43,41.80]},
    properties:expect.objectContaining({entityId:'qing-founded'}),
  }));
  expect(state.boundaries.filter(boundary => boundary.polityId === 'later_jin')).toEqual([]);
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'later_jin'
    && feature.geometry.type.endsWith('Polygon'))).toBe(false);
});

test('Qing 1912 shows the abdication event without reusing a Qing annual border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-qing-1912-1912');
  const state = getHistoricalState(1912);
  const mapData = buildLocalMapData(state);
  expect(qingTerminationAnnualAudit).toMatchObject({decisionId:'gap-qing-1912-1912',yearCount:1,reviewStatus:'source-checked'});
  expect(qingTerminationAnnualAudit.years[0]).toMatchObject({
    year:1912, mapExpression:'leave-unfilled', centerPlaceId:null, territoryBoundary:null,
  });
  expect(qingTerminationAnnualAudit.years[0].sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',reviewedAt:'2026-11-03'});
  expect(decision?.citationIds).toContain('chnmuseum-xuantong-abdication');
  expect(decision?.historicalTransitionCheck).toContain('qing-termination-1912.json');
  expect(state.events).toContainEqual(expect.objectContaining({id:'qing-ended-1912',placeId:'beijing'}));
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[116.40,39.90]},
    properties:expect.objectContaining({entityId:'qing-ended-1912'}),
  }));
  expect(state.boundaries.filter(boundary => boundary.polityId === 'qing')).toEqual([]);
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'qing'
    && feature.geometry.type.endsWith('Polygon'))).toBe(false);
});

test('Republic 1916–1929 records annual political centers without an inferred nationwide border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-republic-1916-1929');
  expect(republicWarlordEraAnnualAudit).toMatchObject({decisionId:'gap-republic-1916-1929',yearCount:14,reviewStatus:'source-checked'});
  expect(republicWarlordEraAnnualAudit.years.map(row => row.year)).toEqual(Array.from({length:14},(_,index)=>1916+index));
  expect(republicWarlordEraAnnualAudit.years.every(row => row.territoryBoundary === null
    && row.sourceIds.length > 0 && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',reviewedAt:'2026-11-03'});
  expect(decision?.historicalTransitionCheck).toContain('republic-warlord-era-1916-1929.json');
  for (const row of republicWarlordEraAnnualAudit.years) {
    const state = getHistoricalState(row.year);
    const mapData = buildLocalMapData(state);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'republic')).toEqual([]);
    expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:expect.objectContaining({type:'Point'}),
      properties:expect.objectContaining({polityId:'republic',placeId:row.centerPlaceId}),
    }));
    expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'republic'
      && feature.geometry.type.endsWith('Polygon'))).toBe(false);
  }
  for (const [year, eventIds] of [
    [1916, ['yuan-shikai-died-1916']],
    [1917, ['guangzhou-protection-government-1917']],
    [1921, ['sun-extraordinary-president-guangzhou-1921']],
    [1925, ['national-government-formed-guangzhou-1925']],
    [1926, ['northern-expedition-launched-1926']],
    [1927, ['wuhan-national-government-1927', 'nanjing-government-founded-1927']],
    [1928, ['northeast-reflag-1928']],
  ] as const) {
    const mapData = buildLocalMapData(getHistoricalState(year));
    for (const eventId of eventIds) {
      expect(mapData.events.features).toContainEqual(expect.objectContaining({
        geometry:expect.objectContaining({type:'Point'}),
        properties:expect.objectContaining({entityId:eventId}),
      }));
    }
  }
});

test('PRC founding in 1949 maps the Beijing founding event without backfilling a national border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-prc-1949-1949');
  const row = prcFounding1949AnnualAudit.years[0];
  expect(prcFounding1949AnnualAudit).toMatchObject({decisionId:'gap-prc-1949-1949',yearCount:1,reviewStatus:'source-checked'});
  expect(row).toMatchObject({polityId:'prc',year:1949,mapExpression:'event-and-capital-points',centerPlaceId:'beijing',territoryBoundary:null});
  expect(row.sourceIds.length).toBeGreaterThan(0);
  expect(row.sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);
  expect(eventDetails.find(detail => detail.eventId === 'prc-founded')?.uncertaintyNote)
    .toContain('Cliopatria记录13089');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',reviewedAt:'2026-11-03'});
  expect(decision?.historicalTransitionCheck).toContain('prc-founding-1949.json');
  const state = getHistoricalState(1949);
  const mapData = buildLocalMapData(state);
  expect(state.boundaries.filter(boundary => boundary.polityId === 'prc')).toEqual([]);
  expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:expect.objectContaining({type:'Point'}),
    properties:expect.objectContaining({polityId:'prc',placeId:'beijing'}),
  }));
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry:expect.objectContaining({type:'Point'}),
    properties:expect.objectContaining({entityId:'prc-founded'}),
  }));
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'prc'
    && feature.geometry.type.endsWith('Polygon'))).toBe(false);
});

test('Hedong Jin 895–922 renders the Jinyang political center without implying a national frontier', () => {
  expect(hedongJinAnnualAudit).toMatchObject({
    decisionId:'out-of-ledger-hedong-jin-907-923',
    reviewStatus:'source-checked',
    yearCount:29,
    years:[
      ...Array.from({length:28}, (_, index) => index + 895).map(year =>
        expect.objectContaining({year,mapExpression:'control-center-point',centerPlaceId:'taiyuan',territoryBoundary:null})),
      expect.objectContaining({year:923,mapExpression:'transition-year-no-area',centerPlaceId:null,territoryBoundary:null}),
    ],
  });
  expect(hedongJinAnnualAudit.years.find(row => row.year === 895)?.conclusion).toContain('唐廷册封');
  expect(hedongJinAnnualAudit.years.find(row => row.year === 900)?.conclusion).toContain('晋阳城堑');
  expect(hedongJinAnnualAudit.years.find(row => row.year === 906)?.conclusion).toContain('唐末');
  expect(hedongJinAnnualAudit.years.at(-1)).toMatchObject({
    year:923,
    mapExpression:'transition-year-no-area',
    centerPlaceId:null,
    territoryBoundary:null,
  });
  expect(hedongJinAnnualAudit.years.every(row => row.year !== 0
    && row.sourceIds.includes('hedong-jin-907-923-primary-sources'))).toBe(true);

  for (let year = 895; year <= 922; year += 1) {
    const yearState = getHistoricalState(year);
    const yearMapData = buildLocalMapData(yearState);
    expect(yearMapData.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:expect.objectContaining({type:'Point',coordinates:[112.55,37.87]}),
      properties:expect.objectContaining({polityId:'jin_hedong',evidenceLevel:'D'}),
    }));
    expect(yearMapData.boundaries.features.some(feature => feature.properties?.polityId === 'jin_hedong'
      && ['Polygon','MultiPolygon'].includes(feature.geometry.type))).toBe(false);
  }

  expect(getHistoricalState(895).activePolities.map(polity => polity.id)).toContain('jin_hedong');
  expect(getHistoricalState(895).capitalTerms).toEqual(expect.arrayContaining([
    expect.objectContaining({polityId:'jin_hedong',placeId:'taiyuan',validFrom:895,validTo:922}),
  ]));
  const state = getHistoricalState(910);
  expect(state.activePolities.map(polity => polity.id)).toContain('jin_hedong');
  const center = state.boundaries.find(boundary => boundary.polityId === 'jin_hedong');
  expect(center).toMatchObject({
    presentation:'reference',
    geometry:{type:'Point',coordinates:[112.55,37.87]},
    controlType:'unspecified',
  });
  expect(state.boundaries.some(boundary => boundary.polityId === 'jin_hedong'
    && ['Polygon','MultiPolygon'].includes(boundary.geometry.type))).toBe(false);

  const endOfPeriod = getHistoricalState(922);
  expect(endOfPeriod.boundaries.some(boundary => boundary.polityId === 'jin_hedong')).toBe(true);
  const transitionYear = getHistoricalState(923);
  expect(transitionYear.boundaries.some(boundary => boundary.polityId === 'jin_hedong')).toBe(false);
  const mapData = buildLocalMapData(state);
  expect(mapData.boundaries.features).toContainEqual(expect.objectContaining({
    geometry:expect.objectContaining({type:'Point',coordinates:[112.55,37.87]}),
    properties:expect.objectContaining({polityId:'jin_hedong',evidenceLevel:'D'}),
  }));
});

test('PRC 2025–2026 renders only the labeled low-confidence nearest-year reference', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-prc-2025-2026');
  expect(prcCurrentReferenceAnnualAudit).toMatchObject({
    decisionId:'gap-prc-2025-2026',yearCount:2,reviewStatus:'source-checked',
  });
  expect(prcCurrentReferenceAnnualAudit.years.map(row => row.year)).toEqual([2025,2026]);
  expect(prcCurrentReferenceAnnualAudit.years.every(row => row.territoryBoundary === 'clio-13616-prc-2024'
    && row.mapExpression === 'nearest-same-polity-reference'
    && row.sourceIds.includes('cliopatria')
    && row.sourceIds.includes('mnr-standard-map-service-2026')
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  expect(prcCurrentReferenceAnnualAudit.years[1].conclusion).toContain('截至2026-11-04');
  expect(decision).toMatchObject({
    verdict:'nearest-same-polity',sourceBoundaryIds:['clio-13616-prc-2024'],
    reviewStatus:'reviewed',reviewedAt:'2026-11-04',
  });
  expect(decision?.historicalTransitionCheck).toContain('prc-current-reference-2025-2026.json');
  for (const year of [2025,2026]) {
    const state = getHistoricalState(year);
    const boundary = state.boundaries.find(item => item.polityId === 'prc');
    expect(boundary).toMatchObject({
      id:'curated-transition-prc-2025-2026',sourceFrom:2024,sourceTo:2024,presentation:'reference',
      confidence:'low',evidence:{evidenceLevel:'C',derivation:'nearest-same-polity'},
    });
    expect(isDefiniteBoundary(boundary!)).toBe(false);
    const mapData = buildLocalMapData(state);
    expect(mapData.boundaries.features).toContainEqual(expect.objectContaining({
      id:'curated-transition-prc-2025-2026',
      properties:expect.objectContaining({polityId:'prc',evidenceLevel:'C',derivation:'nearest-same-polity',confidence:'low'}),
    }));
  }
});

test('Northern Qi 577 termination marks Ye as a transition center, not an annual border', () => {
  const state = getHistoricalState(577);
  const center = state.boundaries.find(boundary => boundary.id === 'special-qi-northern-577-ye-transition-center');
  const northernZhouSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2147-zhou_northern-577');
  const decision = coverageDecisions.find(item => item.id === 'gap-qi_northern-577-577');

  expect(northernQiTerminationAnnualAudit).toMatchObject({decisionId:'gap-qi_northern-577-577',yearCount:1,reviewStatus:'source-checked'});
  expect(northernQiTerminationAnnualAudit.years).toMatchObject([{
    polityId:'qi_northern',year:577,mapExpression:'control-center-point',centerPlaceId:'ye',territoryBoundary:null,
  }]);
  expect(northernQiTerminationAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'northern-qi-termination-577-primary-sources','modern-geography-reference',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('northern-qi-termination-577.json');

  expect(center).toMatchObject({
    validFrom:577,
    validTo:577,
    geometry:{type:'Point',coordinates:[114.37,36.33]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(center!)).toBe(false);
  expect(state.activePolities.some(polity => polity.id === 'qi_northern')).toBe(true);
  expect(state.activePolities.some(polity => polity.id === 'zhou_northern')).toBe(true);
  expect(northernZhouSource).toMatchObject({validFrom:577,validTo:581,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:northern-qi-zhou-transition-577',
    boundaryId:'clio-2147-zhou_northern-577',
    polityIds:['qi_northern','zhou_northern'],
    years:[577],
    status:'requires-review',
  }));
  expect(getHistoricalState(576).boundaries.some(boundary => boundary.id === northernZhouSource?.id)).toBe(false);
  expect(state.boundaries.some(boundary => boundary.id === northernZhouSource?.id)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature =>
    feature.properties?.polityId === 'zhou_northern' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(578).boundaries.find(boundary => boundary.id === northernZhouSource?.id)?.geometry)
    .toEqual(northernZhouSource?.geometry);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.historicalTransitionCheck).toContain('北周');
});

test('Later Tang 923–925 shows its Luoyang center without turning conquests into borders', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-tang_later-923-925');
  expect(laterTangFoundingAnnualAudit).toMatchObject({decisionId:'gap-tang_later-923-925',yearCount:3,reviewStatus:'source-checked'});
  expect(laterTangFoundingAnnualAudit.years.map(row => row.year)).toEqual([923,924,925]);
  expect(laterTangFoundingAnnualAudit.years.every(row => row.polityId === 'tang_later' && row.territoryBoundary === null
    && row.centerPlaceId === 'luoyang'
    && row.sourceIds.includes('later-tang-founding-923-925-sources')
    && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  expect(laterTangFoundingAnnualAudit.years.find(row => row.year === 925)?.mapExpression)
    .toBe('control-center-point-and-chengdu-conquest-event-point');
  const accessionRow = laterTangFoundingAnnualAudit.years.find(row => row.year === 923);
  expect(accessionRow?.mapExpression).toBe('control-center-point-and-accession-event-point');
  expect(accessionRow?.sourceIds).toContain('weizhou-regional-location-chgis');
  expect(decision?.citationIds).toContain('weizhou-regional-location-chgis');
  expect(decision?.historicalTransitionCheck).toContain('later-tang-founding-923-925.json');
  for (const year of [923,924,925]) {
    const state = getHistoricalState(year);
    const map = buildLocalMapData(state);
    const center = state.boundaries.find(boundary => boundary.id === 'special-later-tang-923-925-luoyang-center');
    expect(center).toMatchObject({
      validFrom:923,
      validTo:925,
      geometry:{type:'Point',coordinates:[112.45,34.62]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[112.45,34.62]},
      properties:expect.objectContaining({polityId:'tang_later',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'tang_later'
      && feature.geometry.type !== 'Point')).toBe(false);
    if (year === 923) {
      expect(map.events.features).toContainEqual(expect.objectContaining({
        geometry:{type:'Point',coordinates:[115.11642,36.41840]},
        properties:expect.objectContaining({entityId:'tang-later-founded'}),
      }));
    }
  }
  const chengduCapture = buildLocalMapData(getHistoricalState(925)).events.features.find(feature => (
    feature.properties?.entityId === 'former-shu-ended-925'
  ));
  expect(chengduCapture).toMatchObject({geometry:{type:'Point',coordinates:[104.07,30.67]}});
  expect(buildLocalMapData(getHistoricalState(924)).events.features.some(feature => (
    feature.properties?.entityId === 'former-shu-ended-925'
  ))).toBe(false);
  expect(getHistoricalState(926).boundaries.some(boundary => boundary.id === 'special-later-tang-923-925-luoyang-center')).toBe(false);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.historicalTransitionCheck).toContain('前蜀终止');
});

test('Later Tang 936 keeps the annual extent blank and marks only the Luoyang terminal transition', () => {
  const state = getHistoricalState(936);
  const map = buildLocalMapData(state);
  const center = state.boundaries.find(boundary => boundary.id === 'special-later-tang-936-luoyang-transition-center');
  const jinCenter = state.boundaries.find(boundary => boundary.id === 'special-later-jin-936-taiyuan-origin-center');
  const decision = coverageDecisions.find(item => item.id === 'gap-tang_later-936-936');

  expect(laterTangTerminationAnnualAudit).toMatchObject({decisionId:'gap-tang_later-936-936',yearCount:1,reviewStatus:'source-checked'});
  expect(laterTangTerminationAnnualAudit.years[0]).toMatchObject({
    polityId:'tang_later',year:936,centerPlaceId:'luoyang',territoryBoundary:null,
  });
  expect(laterTangTerminationAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'later-tang-termination-936-primary-source','modern-geography-reference',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('later-tang-termination-936.json');

  expect(state.activePolities.some(polity => polity.id === 'tang_later')).toBe(true);
  expect(state.activePolities.some(polity => polity.id === 'jin_later')).toBe(true);
  expect(center).toMatchObject({
    validFrom:936,
    validTo:936,
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    sourceIds:['later-tang-termination-936-primary-source','modern-geography-reference'],
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(jinCenter).toMatchObject({
    validFrom:936,
    validTo:936,
    geometry:{type:'Point',coordinates:[112.55,37.87]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(center!)).toBe(false);
  expect(isDefiniteBoundary(jinCenter!)).toBe(false);
  expect(map.boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[112.45,34.62]},
    properties:expect.objectContaining({polityId:'tang_later',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(map.boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[112.55,37.87]},
    properties:expect.objectContaining({polityId:'jin_later',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'jin_later'
    && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(937).boundaries.some(boundary => boundary.id === 'clio-3744-jin_later-936'
    && boundary.geometry.type !== 'Point')).toBe(true);
  expect(getHistoricalState(937).boundaries.find(boundary => boundary.id === 'clio-3744-jin_later-936'))
    .toMatchObject({validFrom:936,validTo:946,evidence:{evidenceLevel:'A',reviewStatus:'source-checked'}});
  expect(getHistoricalState(937).boundaries.some(boundary => boundary.id === 'special-later-tang-936-luoyang-transition-center')).toBe(false);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.citationIds).toEqual(expect.arrayContaining(['later-tang-termination-936-primary-source','modern-geography-reference']));
  expect(decision?.historicalTransitionCheck).toContain('十一月');
  expect(decision?.historicalTransitionCheck).toContain('洛阳');
});

test('Later Jin 947 shares the cross-section with Khitan occupation and Later Han formation without annual borders', () => {
  const state = getHistoricalState(947);
  const jinCenter = state.boundaries.find(boundary => boundary.id === 'special-later-jin-947-kaifeng-transition-center');
  const khitanCenter = state.boundaries.find(boundary => boundary.id === 'special-khitan-947-kaifeng-occupation-center');
  const hanTaiyuan = state.boundaries.find(boundary => boundary.id === 'special-later-han-947-taiyuan-center');
  const hanKaifeng = state.boundaries.find(boundary => boundary.id === 'special-later-han-947-kaifeng-center');
  const decision = coverageDecisions.find(item => item.id === 'gap-jin_later-947-947');

  expect(laterJinTerminationAnnualAudit).toMatchObject({decisionId:'gap-jin_later-947-947',yearCount:1,reviewStatus:'source-checked'});
  expect(laterJinTerminationAnnualAudit.years[0]).toMatchObject({
    polityId:'jin_later',year:947,centerPlaceId:'kaifeng',territoryBoundary:null,
  });
  expect(laterJinTerminationAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'later-jin-termination-947-primary-sources','modern-geography-reference',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('later-jin-termination-947.json');

  for (const polityId of ['jin_later', 'khitan', 'han_later']) {
    expect(state.activePolities.some(polity => polity.id === polityId)).toBe(true);
  }
  expect(jinCenter).toMatchObject({geometry:{type:'Point',coordinates:[114.34,34.80]},evidence:{evidenceLevel:'D',derivation:'control-centers'}});
  expect(khitanCenter).toMatchObject({geometry:{type:'Point',coordinates:[114.34,34.80]},evidence:{evidenceLevel:'D',derivation:'control-centers'}});
  expect(hanTaiyuan).toMatchObject({geometry:{type:'Point',coordinates:[112.55,37.87]},evidence:{evidenceLevel:'D',derivation:'control-centers'}});
  expect(hanKaifeng).toMatchObject({geometry:{type:'Point',coordinates:[114.34,34.80]},evidence:{evidenceLevel:'D',derivation:'control-centers'}});
  for (const boundary of [jinCenter,khitanCenter,hanTaiyuan,hanKaifeng]) {
    expect(isDefiniteBoundary(boundary!)).toBe(false);
  }
  const map = buildLocalMapData(state);
  for (const [polityId, coordinates] of [
    ['jin_later',[114.34,34.80]],
    ['khitan',[114.34,34.80]],
    ['han_later',[112.55,37.87]],
    ['han_later',[114.34,34.80]],
  ] as const) {
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates},
      properties:expect.objectContaining({polityId,evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  expect(state.boundaries.filter(boundary => boundary.polityId === 'han_later'
    && boundary.geometry.type !== 'Point').map(({id,polityId,validFrom,validTo,evidence}) => ({
      id,polityId,validFrom,validTo,evidenceLevel:evidence.evidenceLevel,derivation:evidence.derivation,
    }))).toEqual([]);
  expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'han_later'
    && feature.geometry.type !== 'Point')).toBe(false);
  expect(state.boundaries.some(boundary => boundary.id === 'clio-3761-khitan-936'
    && boundary.geometry.type !== 'Point')).toBe(true);
  expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'khitan'
    && feature.geometry.type !== 'Point')).toBe(true);
  expect(buildLocalMapData(getHistoricalState(948)).boundaries.features.some(feature => (
    feature.properties?.polityId === 'han_later' && feature.geometry.type !== 'Point'
  ))).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.citationIds).toEqual(expect.arrayContaining(['later-jin-termination-947-primary-sources','modern-geography-reference']));
  expect(decision?.historicalTransitionCheck).toContain('后汉');
});

test('Later Zhou 951–959 shows Kaifeng as its annual center while its changing frontiers remain unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-zhou_later-951-959');
  expect(laterZhouFoundingAnnualAudit).toMatchObject({decisionId:'gap-zhou_later-951-959',yearCount:9,reviewStatus:'source-checked'});
  expect(laterZhouFoundingAnnualAudit.years.map(row => row.year)).toEqual([951,952,953,954,955,956,957,958,959]);
  expect(laterZhouFoundingAnnualAudit.years.every(row => row.polityId === 'zhou_later'
    && row.centerPlaceId === 'kaifeng' && row.territoryBoundary === null
    && row.sourceIds.includes('later-zhou-formation-951-959-primary-sources')
    && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  const laterZhou959 = laterZhouFoundingAnnualAudit.years.find(row => row.year === 959);
  expect(laterZhou959?.sourceIds).toContain('china-admin-history-five-dynasties-northern-han-map');
  expect(laterZhou959?.evidenceGap).toContain('不能替代951—958年逐年控制证据');
  expect(laterZhouFoundingAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'china-admin-history-five-dynasties-northern-han-map',
  }));
  const year959MapNote = laterZhouFoundingAnnualAudit.sourceNotes.find(note =>
    note.id === 'china-admin-history-five-dynasties-northern-han-map');
  expect(year959MapNote?.use).toContain('IKCEST');
  expect(year959MapNote?.use).toContain('1:1200万');
  expect(year959MapNote?.use).toContain('图层细节尚未核阅');
  expect(decision?.historicalTransitionCheck).toContain('later-zhou-territorial-gap-951-959.json');
  for (const year of [951,952,953,954,955,956,957,958,959]) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.id === 'special-later-zhou-951-959-kaifeng-center');
    expect(center, `后周${year}年开封政治中心参考`).toMatchObject({
      validFrom:951,
      validTo:959,
      geometry:{type:'Point',coordinates:[114.34,34.80]},
      sourceIds:['later-zhou-formation-951-959-primary-sources','modern-geography-reference'],
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    const map = buildLocalMapData(state);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[114.34,34.80]},
      properties:expect.objectContaining({polityId:'zhou_later',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'zhou_later'
      && feature.geometry.type !== 'Point')).toBe(false);
    if (year === 951) {
      expect(map.boundaries.features).toContainEqual(expect.objectContaining({
        geometry:{type:'Point',coordinates:[112.55,37.87]},
        properties:expect.objectContaining({polityId:'northern_han',evidenceLevel:'D',derivation:'control-centers'}),
      }));
    }
  }
  expect(getHistoricalState(960).boundaries.some(boundary => boundary.id === 'special-later-zhou-951-959-kaifeng-center')).toBe(false);
  expect(getHistoricalState(951).activePolities.some(polity => polity.id === 'northern_han')).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'later-zhou-formation-951-959-primary-sources',
    'modern-geography-reference',
    'china-admin-history-five-dynasties-northern-han-map',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('959');
});

test('Northern Han 958 locates the Shihui Pass campaign regionally without creating a frontier', () => {
  const year958 = northernHanAnnualAudit.years.find(row => row.year === 958);
  const year959 = northernHanAnnualAudit.years.find(row => row.year === 959);
  expect(year958?.sourceIds).toContain('shihui-pass-location-reference');
  expect(year958?.regionalExtent).toContain('榆社县西北');
  expect(year958?.territoryBoundary).toBeNull();
  expect(year959?.conclusion).toContain('北井');
  expect(year959?.conclusion).not.toContain('石会关六寨');
  expect(northernHanAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'shihui-pass-location-reference',
  }));
  expect(sourceNotes).toContainEqual(expect.objectContaining({
    id:'shihui-pass-location-reference',
    note:expect.stringContaining('不生成事件点'),
  }));
  for (const row of northernHanAnnualAudit.years) {
    const map = buildLocalMapData(getHistoricalState(row.year));
    expect(map.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[112.55,37.87]},
      properties:expect.objectContaining({polityId:'northern_han',placeId:'taiyuan'}),
    }));
    expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'northern_han'
      && feature.geometry.type !== 'Point')).toBe(false);
  }
});

test('Xiongnu formation in 209 BCE records its source and leaves unsupported spatial extent blank', () => {
  const state = getHistoricalState(-209);
  const mapData = buildLocalMapData(state);
  const decision = coverageDecisions.find(item => item.id === 'gap-xiongnu--209--209');

  expect(state.boundaries.filter(boundary => boundary.polityId === 'xiongnu')).toHaveLength(0);
  expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[103,45]},
    properties:expect.objectContaining({
      placeId:'xiongnu_core',polityId:'xiongnu',role:'mobile_court',status:'uncertain',confidence:'low',
      note:expect.stringContaining('不将其视作固定城市首都'),
    }),
  }));
  expect(decision).toMatchObject({
    verdict:'leave-unfilled',
    sourceBoundaryIds:[],
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'shiji-xiongnu-modu','capital-history-reference','xiongnu-longcheng-central-mongolia-candidate',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('冒顿');
  expect(decision?.rationale).toContain('固定单于庭');
  expect(xiongnuFormationAnnualAudit).toMatchObject({decisionId:'gap-xiongnu--209--209',yearCount:1,reviewStatus:'source-checked'});
  expect(xiongnuFormationAnnualAudit.years[0]).toMatchObject({
    polityId:'xiongnu',year:-209,mapExpression:'uncertain-mobile-court-candidate',centerPlaceId:null,territoryBoundary:null,
    candidatePlaceIds:['xiongnu_core'],
  });
  expect(xiongnuFormationAnnualAudit.years[0].sourceIds).toContain('shiji-xiongnu-modu');
  expect(xiongnuFormationAnnualAudit.years[0].sourceIds).toContain('xiongnu-longcheng-central-mongolia-candidate');
  expect(xiongnuFormationAnnualAudit.sourceNotes.map(source => source.id))
    .toContain('xiongnu-longcheng-central-mongolia-candidate');
  expect(decision?.citationIds).toContain('xiongnu-longcheng-central-mongolia-candidate');
  expect(decision?.historicalTransitionCheck).toContain('xiongnu-formation-209-bce.json');
});

test('Goguryeo traditional founding keeps the debated early center separate from later Guonei', () => {
  const state = getHistoricalState(-37);
  const decision = coverageDecisions.find(item => item.id === 'gap-goguryeo--37--37');
  const detail = eventDetails.find(item => item.eventId === 'goguryeo-founded');

  expect(state.boundaries.filter(boundary => boundary.polityId === 'goguryeo')).toHaveLength(0);
  expect(state.activePolities.some(polity => polity.id === 'han_western')).toBe(true);
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],
    citationIds:expect.arrayContaining(['goguryeo-founding-traditional-source','goguryeo-capital-unesco'])});
  expect(detail?.locationIds).toEqual(['wunvshan']);
  expect(detail?.uncertaintyNote).toContain('传统建国约年');
  expect(detail?.uncertaintyNote).toContain('不等同于已确定的建国仪式地点');
  expect(goguryeoFoundingAnnualAudit).toMatchObject({decisionId:'gap-goguryeo--37--37',yearCount:1,reviewStatus:'source-checked'});
  expect(goguryeoFoundingAnnualAudit.years[0]).toMatchObject({
    polityId:'goguryeo',year:-37,mapExpression:'founding-site-candidate-only',centerPlaceId:'wunvshan',territoryBoundary:null,
  });
  expect(goguryeoFoundingAnnualAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'goguryeo-founding-traditional-source','goguryeo-capital-unesco',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('goguryeo-founding-37-bce.json');
});

test('Silla early period records annual capital-region references without backfilling territory', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-silla--57-377');
  const expectedYears = Array.from({length:434}, (_, index) => index < 57 ? index - 57 : index - 56);
  expect(sillaEarlyGapAnnualAudit).toMatchObject({
    decisionId:'gap-silla--57-377',yearCount:434,reviewStatus:'source-checked',
  });
  expect(sillaEarlyGapAnnualAudit.years.map(row => row.year)).toEqual(expectedYears);
  expect(sillaEarlyGapAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(sillaEarlyGapAnnualAudit.years.every(row => row.polityId === 'silla'
    && row.mapExpression === (row.year < 101 ? 'capital-center-point' : 'capital-region-with-disputed-wolseong-candidate')
    && row.centerPlaceId === 'jincheng_silla'
    && row.territoryBoundary === null
    && row.conclusion.length > 30
    && row.evidenceGap.length > 30
    && row.sourceIds.includes('silla-samguksagi-db')
    && row.sourceIds.includes('silla-periodization') === (row.year >= 300)
    && row.sourceIds.includes('silla-gyeongju-unesco')
    && row.sourceIds.includes('silla-wolseong-archaeological-chronology') === (row.year >= 101)
    && row.sourceIds.every(id => sourceNotes.some(source => source.id === id)))).toBe(true);
  const wolseongTransition = sillaEarlyGapAnnualAudit.years.find(row => row.year === 101);
  expect(wolseongTransition?.candidatePlaceIds).toEqual(['wolseong_silla']);
  expect(wolseongTransition?.conclusion).toContain('传统纪年');
  expect(wolseongTransition?.evidenceGap).toContain('不能确证101年迁都');
  expect(decision?.historicalTransitionCheck).toContain('silla-early-gap-57-bce-377.json');
  for (const year of [-57,-37,-1,1,100,101,200,300,356,377]) {
    expect(getHistoricalState(year).boundaries.filter(boundary => boundary.polityId === 'silla'), `Silla ${year} must remain without a territory polygon`).toEqual([]);
  }
  expect(getHistoricalState(-57).places.map(place => place.id)).toContain('jincheng_silla');
  expect(getHistoricalState(100).places.map(place => place.id)).toContain('jincheng_silla');
  expect(getHistoricalState(101).places.map(place => place.id)).toContain('jincheng_silla');
  const map101 = buildLocalMapData(getHistoricalState(101));
  expect(map101.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[129.21,35.86]},
    properties:expect.objectContaining({placeId:'jincheng_silla',role:'primary',status:'formal'}),
  }));
  expect(map101.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[129.213,35.832]},
    properties:expect.objectContaining({placeId:'wolseong_silla',role:'disputed',status:'uncertain'}),
  }));
  const map377 = buildLocalMapData(getHistoricalState(377));
  expect(map377.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[129.21,35.86]},
    properties:expect.objectContaining({placeId:'jincheng_silla',role:'primary',status:'formal'}),
  }));
  expect(map377.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[129.213,35.832]},
    properties:expect.objectContaining({placeId:'wolseong_silla',role:'disputed',status:'uncertain'}),
  }));
});

test('Cheng Han termination year records Huan Wen return and April rebel occupation without a full-year boundary', () => {
  const state = getHistoricalState(347);
  const previousChengHanSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1459-cheng_han-338');
  const chengHan = state.boundaries.find(boundary => boundary.polityId === 'cheng_han');
  expect(chengHan).toMatchObject({
    validFrom:347,
    validTo:347,
    snapshotYear:347,
    geometry:{type:'Point',coordinates:[104.07,30.67]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(chengHan!)).toBe(false);
  expect(state.activePolities.some(polity => polity.id === 'jin_eastern')).toBe(true);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[104.07,30.67]},
    properties:expect.objectContaining({polityId:'cheng_han',evidenceLevel:'D'}),
  }));

  const gap = coverageDecisions.find(decision => decision.id === 'gap-cheng_han-347-347');
  expect(gap?.citationIds).toContain('cliopatria');
  expect(chengHanFallAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(previousChengHanSource).toMatchObject({validFrom:338,validTo:346,sourceFrom:338,sourceTo:346,sourceRecord:1459});
  expect(gap?.rationale).toContain('clio-1459-cheng_han-338');
  expect(state.boundaries.some(boundary => boundary.id === 'clio-1459-cheng_han-338')).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature => feature.id === 'clio-1459-cheng_han-338')).toBe(false);
  expect(getHistoricalState(346).boundaries.find(boundary => boundary.id === 'clio-1459-cheng_han-338')?.geometry)
    .toEqual(previousChengHanSource?.geometry);
  expect(gap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(gap?.historicalTransitionCheck).toContain('347年');
  expect(chengHanFallAnnualAudit.decisionIds).toEqual(['gap-cheng_han-347-347']);
  expect(chengHanFallAnnualAudit.years).toEqual([expect.objectContaining({
    polityId:'cheng_han',year:347,mapExpression:'control-center-point',centerPlaceId:'chengdu',territoryBoundary:null,
  })]);
  expect(chengHanFallAnnualAudit.years[0].sourceIds).toContain('cheng-han-fall-347-primary-sources');
  expect(chengHanFallAnnualAudit.years[0].evidenceGap).toContain('全年');
  expect(chengHanFallAnnualAudit.years[0].conclusion).toContain('还江陵');
  expect(chengHanFallAnnualAudit.years[0].conclusion).toContain('邓定');
  expect(chengHanFallAnnualAudit.years[0].conclusion).not.toContain('四月晋军入据成都');
  expect(gap?.historicalTransitionCheck).toContain('cheng-han-fall-347.json');
});

test('Former Qin founding records separate 351 enthronement as king from 352 imperial accession', () => {
  const laterFormerQinSource = boundaryCatalog.find(boundary => boundary.id === 'clio-1485-former_qin-353');
  for (const year of [351,352]) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.polityId === 'former_qin');
    expect(center, `前秦 ${year} 长安政治中心参照`).toMatchObject({
      validFrom:year,
      validTo:year,
      snapshotYear:year,
      geometry:{type:'Point',coordinates:[108.94,34.34]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    const renderedBoundaries = buildLocalMapData(state).boundaries.features
      .filter(feature => feature.properties?.polityId === 'former_qin');
    expect(renderedBoundaries.some(feature => feature.geometry.type === 'Point'
      && feature.geometry.coordinates[0] === 108.94 && feature.geometry.coordinates[1] === 34.34)).toBe(true);
    expect(renderedBoundaries.some(feature => feature.geometry.type === 'Polygon'
      || feature.geometry.type === 'MultiPolygon')).toBe(false);
  }
  expect(getHistoricalState(351).activePolities.some(polity => polity.id === 'jin_eastern')).toBe(true);
  expect(getHistoricalState(352).activePolities.some(polity => polity.id === 'former_yan')).toBe(true);

  const gap = coverageDecisions.find(decision => decision.id === 'gap-former_qin-351-352');
  expect(gap?.citationIds).toContain('cliopatria');
  expect(formerQinFoundingAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(laterFormerQinSource).toMatchObject({
    validFrom:353,validTo:370,snapshotYear:353,sourceFrom:353,sourceTo:370,sourceRecord:1485,
    confidence:'low',controlType:'unspecified',
  });
  expect(gap?.rationale).toContain('clio-1485-former_qin-353');
  for (const year of [351,352]) {
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === 'clio-1485-former_qin-353')).toBe(false);
    expect(buildLocalMapData(getHistoricalState(year)).boundaries.features.some(
      feature => feature.id === 'clio-1485-former_qin-353')).toBe(false);
  }
  expect(getHistoricalState(353).boundaries.find(boundary => boundary.id === 'clio-1485-former_qin-353')?.geometry)
    .toEqual(laterFormerQinSource?.geometry);
  expect(gap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(gap?.historicalTransitionCheck).toContain('351年');
  expect(gap?.historicalTransitionCheck).toContain('352年');
  expect(formerQinFoundingAnnualAudit.decisionId).toBe('gap-former_qin-351-352');
  expect(formerQinFoundingAnnualAudit.years.map(item => item.year)).toEqual([351,352]);
  expect(formerQinFoundingAnnualAudit.years.map(item => item.mapExpression)).toEqual(['capital-and-event-points','control-center-point']);
  expect(formerQinFoundingAnnualAudit.years.every(item => item.centerPlaceId === 'changan' && item.territoryBoundary === null)).toBe(true);
  expect(formerQinFoundingAnnualAudit.years[0].conclusion).toContain('称天王');
  expect(formerQinFoundingAnnualAudit.years[0].conclusion).toContain('350年十月进至长安，十一月入城');
  expect(formerQinFoundingAnnualAudit.years[0].conclusion).not.toContain('351年苻健入长安');
  expect(formerQinFoundingAnnualAudit.years[1].conclusion).toContain('即皇帝位');
  expect(formerQinFoundingAnnualAudit.years[1].sourceIds).toContain('changling-chgis-han-only');
  expect(formerQinFoundingAnnualAudit.sourceNotes.find(item => item.id === 'changling-chgis-han-only')?.use)
    .toContain('不能作为352年前秦咸阳郡治');
  expect(formerQinFoundingAnnualAudit.years[1].conclusion).toContain('有志记352年撤销');
  expect(formerQinFoundingAnnualAudit.years[1].conclusion).not.toContain('《咸阳市秦都区志》另记后赵旧渭城所置石安县于本年废除');
  expect(formerQinFoundingAnnualAudit.years[1].sourceIds).toEqual(expect.arrayContaining([
    'xianyang-qindu-gazetteer-shian-352',
    'shaanxi-administrative-establishment-gazetteer-shian-352',
    'xianyang-weicheng-gazetteer-shian-352',
    'xianyang-city-gazetteer-shian-352',
  ]));
  expect(gap?.citationIds).toEqual(expect.arrayContaining([
    'xianyang-qindu-gazetteer-shian-352',
    'shaanxi-administrative-establishment-gazetteer-shian-352',
    'xianyang-weicheng-gazetteer-shian-352',
    'xianyang-city-gazetteer-shian-352',
  ]));
  expect(formerQinFoundingAnnualAudit.sourceNotes.find(item => item.id === 'xianyang-qindu-gazetteer-shian-352')?.use)
    .toContain('（357）');
  expect(formerQinFoundingAnnualAudit.sourceNotes.find(item => item.id === 'shaanxi-administrative-establishment-gazetteer-shian-352')?.use)
    .toContain('前秦352年撤销');
  expect(formerQinFoundingAnnualAudit.sourceNotes.find(item => item.id === 'xianyang-weicheng-gazetteer-shian-352')?.use)
    .toContain('迁置关系');
  expect(formerQinFoundingAnnualAudit.sourceNotes.find(item => item.id === 'xianyang-qindu-gazetteer-shian-352')?.use)
    .toContain('不提供古城精确坐标');
  expect(formerQinFoundingAnnualAudit.years.every(item => item.sourceIds.includes('former-qin-founding-351-352-primary-sources'))).toBe(true);
  const wuzhangyuanEvent = buildLocalMapData(getHistoricalState(351)).events.features.find(feature =>
    feature.properties?.entityId === 'former-qin-defeats-jin-at-wuzhangyuan-351');
  expect(wuzhangyuanEvent?.geometry).toEqual({type:'Point',coordinates:[107.75,34.15]});
  expect(buildLocalMapData(getHistoricalState(350)).events.features.some(feature =>
    feature.properties?.entityId === 'former-qin-defeats-jin-at-wuzhangyuan-351')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(352)).events.features.some(feature =>
    feature.properties?.entityId === 'former-qin-defeats-jin-at-wuzhangyuan-351')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(351)).boundaries.features.some(feature =>
    feature.properties?.polityId === 'former_qin' && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'))).toBe(false);
  expect(formerQinFoundingAnnualAudit.years.every(item => item.sourceIds.includes('former-qin-situation-map-351-394'))).toBe(true);
  expect(formerQinFoundingAnnualAudit.sourceNotes.find(item => item.id === 'former-qin-situation-map-351-394')?.use)
    .toContain('351—394年');
  expect(sourceNotes.find(item => item.id === 'former-qin-situation-map-351-394')?.note)
    .toContain('不能据此转绘两年的疆域几何');
  expect(gap?.historicalTransitionCheck).toContain('former-qin-founding-351-352.json');
});

test('Former Qin 394 termination keeps moving camps unpinned but maps the sourced Mawei battle region', () => {
  const state = getHistoricalState(394);
  expect(state.boundaries.some(boundary => boundary.polityId === 'former_qin')).toBe(false);
  expect(state.activePolities.some(polity => polity.id === 'later_qin')).toBe(true);
  expect(buildLocalMapData(state).boundaries.features.some(feature => feature.properties?.polityId === 'former_qin')).toBe(false);
  expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[108.37019,34.31633]},
    properties:expect.objectContaining({entityId:'former-qin-defeated-at-mawei-394'}),
  }));
  for (const year of [393,395]) {
    expect(buildLocalMapData(getHistoricalState(year)).events.features.some(feature =>
      feature.properties?.entityId === 'former-qin-defeated-at-mawei-394')).toBe(false);
  }

  const gap = coverageDecisions.find(decision => decision.id === 'gap-former_qin-394-394');
  expect(gap).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(gap?.historicalTransitionCheck).toContain('马嵬');
  expect(gap?.historicalTransitionCheck).toContain('山南');
  expect(gap?.rationale).toContain('胡空堡');
  expect(formerQinTerminationAnnualAudit.decisionId).toBe('gap-former_qin-394-394');
  expect(formerQinTerminationAnnualAudit.years).toEqual([expect.objectContaining({
    year:394,mapExpression:'event-location-point',centerPlaceId:null,territoryBoundary:null,
  })]);
  expect(formerQinTerminationAnnualAudit.years[0].conclusion).toContain('四月');
  expect(formerQinTerminationAnnualAudit.years[0].conclusion).toContain('七月');
  expect(formerQinTerminationAnnualAudit.years[0].conclusion).toContain('十月');
  expect(formerQinTerminationAnnualAudit.years[0].sourceIds).toContain('former-qin-termination-394-primary-sources');
  expect(formerQinTerminationAnnualAudit.years[0].sourceIds).toContain('mawei-xingping-historical-location');
  expect(formerQinTerminationAnnualAudit.years[0].sourceIds).toContain('xingping-gazetteer-mawei-regional-location');
  expect(sourceNotes.find(source => source.id === 'xingping-gazetteer-mawei-regional-location')?.note)
    .toContain('未提供394年具体战场坐标');
  expect(places.find(place => place.id === 'mawei-xingping')?.sourceIds)
    .toContain('xingping-gazetteer-mawei-regional-location');
  expect(gap?.historicalTransitionCheck).toContain('former-qin-termination-394.json');
});

test('394 coeval source outlines remain available because corrected screening finds no interior overlap', () => {
  const year = 394;
  const state = getHistoricalState(year);
  const map = buildLocalMapData(state);
  const activeSourceIds = [
    'clio-1574-jin_eastern-394',
    'clio-1581-later_yan-394',
    'clio-1579-later_qin-394',
    'clio-1575-wei_northern-394',
    'clio-1570-goguryeo-392',
    'clio-1529-silla-378',
    'clio-1551-tuyuhun-387',
    'clio-1576-western_qin-394',
    'clio-1552-later_liang-387',
  ];
  expect(coevalBoundaryOverlap394Audit.year).toBe(year);
  expect(coevalBoundaryOverlap394Audit.overlapPairs).toEqual([]);
  expect(coevalBoundaryOverlap394Audit.heldBoundaryIds).toEqual([]);

  for (const id of activeSourceIds) {
    const source = boundaryCatalog.find(boundary => boundary.id === id);
    expect(source, `${id} remains intact in the source catalog`).toBeDefined();
    expect(state.boundaries.find(boundary => boundary.id === id)?.geometry).toEqual(source?.geometry);
    expect(map.boundaries.features.some(feature => feature.id === id), `${id} remains in map data in ${year}`)
      .toBe(true);
  }

  for (const id of [
    'clio-1574-jin_eastern-394',
    'clio-1576-western_qin-394',
    'clio-1529-silla-378',
    'clio-1551-tuyuhun-387',
    'clio-1552-later_liang-387',
  ]) {
    const source = boundaryCatalog.find(boundary => boundary.id === id);
    expect(getHistoricalState(395).boundaries.find(boundary => boundary.id === id)?.geometry)
      .toEqual(source?.geometry);
  }
});

test('Sui founding years show the capital transition without inventing an imperial border', () => {
  const northernZhouSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2147-zhou_northern-577');
  const suiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2174-sui-587');
  for (const year of [581, 582]) {
    const state = getHistoricalState(year);
    const sui = state.boundaries.find(boundary => boundary.polityId === 'sui');
    expect(sui, `隋在${year}年的长安中心`).toMatchObject({
      geometry:{type:'Point',coordinates:[108.94,34.34]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(sui!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.94,34.34]},
      properties:expect.objectContaining({polityId:'sui',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }

  for (const year of [583, 584, 585, 586]) {
    const state = getHistoricalState(year);
    const sui = state.boundaries.find(boundary => boundary.polityId === 'sui');
    expect(sui, `隋在${year}年的大兴中心`).toMatchObject({
      geometry:{type:'Point',coordinates:[108.935,34.25]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(sui!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.935,34.25]},
      properties:expect.objectContaining({polityId:'sui',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }

  expect(northernZhouSource).toMatchObject({validFrom:577,validTo:581,confidence:'low',controlType:'unspecified'});
  expect(suiSource).toMatchObject({validFrom:587,validTo:591,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:northern-zhou-sui-transition-581',
    boundaryId:'clio-2147-zhou_northern-577',
    polityIds:['zhou_northern','sui'],
    years:[581],
    status:'requires-review',
  }));
  expect(getHistoricalState(580).boundaries.find(boundary => boundary.id === northernZhouSource?.id)?.geometry)
    .toEqual(northernZhouSource?.geometry);
  expect(getHistoricalState(581).boundaries.some(boundary => boundary.id === northernZhouSource?.id)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(581)).boundaries.features.some(feature =>
    feature.properties?.polityId === 'zhou_northern' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(587).boundaries.find(boundary => boundary.id === suiSource?.id)?.geometry)
    .toEqual(suiSource?.geometry);
});

test('Ming and Northern Yuan foundation years show sourced, dated political centers without boundary polygons', async () => {
  expect(mingNorthernYuanAnnualAudit.yearCount).toBe(14);
  expect(mingNorthernYuanAnnualAudit.years).toHaveLength(14);
  expect(mingNorthernYuanAnnualAudit.years.map(row => `${row.year}:${row.polityId}`)).toEqual([
    ...Array.from({length: 7}, (_, index) => `${1368 + index}:ming`),
    ...Array.from({length: 7}, (_, index) => `${1368 + index}:northern_yuan`),
  ]);
  expect(mingNorthernYuanAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(mingNorthernYuanAnnualAudit.years.every(row => row.evidenceGap.length > 30
    && row.sourceIds.includes('ming-yuan-northern-frontier-1368-1374'))).toBe(true);
  expect(mingNorthernYuanAnnualAudit.years.some(row => row.year === 0)).toBe(false);

  const expected = new Map<number, Array<[string, GeoJSON.Geometry]>>([
    [1368, [
      ['ming', {type:'Point',coordinates:[118.80,32.06]}],
      ['northern_yuan', {type:'Point',coordinates:[116.18,42.36]}],
    ]],
    [1369, [
      ['ming', {type:'Point',coordinates:[118.80,32.06]}],
      ['northern_yuan', {type:'MultiPoint',coordinates:[[116.18,42.36],[116.79,43.24]]}],
    ]],
    [1370, [
      ['ming', {type:'Point',coordinates:[118.80,32.06]}],
      ['northern_yuan', {type:'MultiPoint',coordinates:[[116.79,43.24],[102.83,47.20]]}],
    ]],
    ...[1371,1372,1373,1374].map(year => [year, [
      ['ming', {type:'Point',coordinates:[118.80,32.06]}],
      ['northern_yuan', {type:'Point',coordinates:[102.83,47.20]}],
    ]] as [number, Array<[string,GeoJSON.Geometry]>]),
  ]);

  for (const [year, polities] of expected) {
    const state = getHistoricalState(year);
    for (const [polityId, geometry] of polities) {
      const center = state.boundaries.find(boundary => boundary.polityId === polityId);
      expect(center, `${polityId} ${year}`).toMatchObject({
        geometry,
        evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
        mapRepresentation:'control-centers',
        sourceIds:expect.arrayContaining(['ming-yuan-northern-frontier-1368-1374']),
      });
      expect(isDefiniteBoundary(center!)).toBe(false);
      expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
        geometry,
        properties:expect.objectContaining({polityId,evidenceLevel:'D',derivation:'control-centers'}),
      }));
    }
  }

  const mingFoundingEvent = events.find(event => event.id === 'ming-founded');
  expect(mingFoundingEvent).toMatchObject({
    year:1368,
    placeId:'yingtian',
    coordinates:[118.80,32.06],
    locationPrecision:'approximate',
  });
  expect(buildLocalMapData(getHistoricalState(1368)).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[118.80,32.06]},
    properties:expect.objectContaining({entityId:'ming-founded'}),
  }));
  expect(buildLocalMapData(getHistoricalState(1367)).events.features.some(feature =>
    feature.properties?.entityId === 'ming-founded')).toBe(false);

  const { coverageDecisions } = await import('./coverage-decisions');
  for (const id of ['gap-ming-1368-1374','gap-northern_yuan-1368-1374']) {
    const decision = coverageDecisions.find(item => item.id === id);
    expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  }
});

test('the Yuan period outline is withheld in the 1368 dynasty transition year', () => {
  const sourceBoundaryId = 'clio-6542-yuan-1363';
  const conflict = boundaryGeometryConflicts.find(item => item.boundaryId === sourceBoundaryId);

  expect(getHistoricalState(1367).boundaries.some(boundary => boundary.id === sourceBoundaryId)).toBe(true);
  expect(getHistoricalState(1368).boundaries.some(boundary => boundary.id === sourceBoundaryId)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(1368)).boundaries.features.some(
    feature => feature.properties?.boundaryId === sourceBoundaryId || feature.properties?.polityId === 'yuan',
  )).toBe(false);
  expect(conflict).toMatchObject({
    polityIds: ['yuan', 'ming', 'northern_yuan'],
    years: [1368],
    status: 'requires-review',
    reviewedBy: [],
  });
});

test('Sui gap decision keeps borders unfilled while documenting each capital phase', async () => {
  const { coverageDecisions } = await import('./coverage-decisions');
  const decision = coverageDecisions.find(item => item.id === 'gap-sui-581-586');
  expect(decision).toMatchObject({
    verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',
    annualAudit:'docs/audits/topics/sui-founding-581-586.json',
  });
  expect(decision?.rationale).toContain('中心点');
  expect(decision?.historicalTransitionCheck).toContain('583年迁都');
  expect(suiFoundingAnnualAudit).toMatchObject({decisionId:'gap-sui-581-586',yearCount:6,reviewStatus:'source-checked'});
  expect(suiFoundingAnnualAudit.years.map(row => row.year)).toEqual([581,582,583,584,585,586]);
  expect(suiFoundingAnnualAudit.years.every(row => row.polityId === 'sui' && row.territoryBoundary === null
    && row.sourceIds.includes('zizhi-tongjian') && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  expect(suiFoundingAnnualAudit.years.every(row => row.sourceIds.every(sourceId => decision?.citationIds.includes(sourceId)))).toBe(true);
  expect(suiFoundingAnnualAudit.years.slice(0,2).every(row => row.centerPlaceId === 'changan')).toBe(true);
  expect(suiFoundingAnnualAudit.years.slice(2).every(row => row.centerPlaceId === 'daxing'
    && row.sourceIds.includes('sui-tang-changan-gis-study'))).toBe(true);
  const daxing = places.find(place => place.id === 'daxing');
  expect(daxing).toMatchObject({longitude:108.935,latitude:34.25,pointType:'regional-reference',mappingStatus:'regional',confidence:'low'});
  expect(daxing?.notes).toContain('边界框中点');
  expect(capitalHistory.filter(item => item.polityId === 'sui' && item.validFrom >= 583 && item.validTo <= 604))
    .toEqual([expect.objectContaining({placeId:'daxing',validFrom:583})]);
});

test('Tang founding years render Chang’an as a control center while leaving the changing war frontier unmapped', () => {
  const suiSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2257-sui-617');
  const tangSource = boundaryCatalog.find(boundary => boundary.id === 'clio-2281-tang-623');
  for (const year of [618, 619, 620, 621, 622]) {
    const state = getHistoricalState(year);
    const tang = state.boundaries.find(boundary => boundary.polityId === 'tang');
    expect(tang, `唐在${year}年的长安政治中心`).toMatchObject({
      geometry:{type:'Point',coordinates:[108.935,34.25]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(tang!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.935,34.25]},
      properties:expect.objectContaining({polityId:'tang',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  expect(suiSource).toMatchObject({validFrom:617,validTo:618,confidence:'low',controlType:'unspecified'});
  expect(tangSource).toMatchObject({validFrom:623,validTo:625,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:sui-tang-transition-618',
    boundaryId:'clio-2257-sui-617',
    polityIds:['sui','tang'],
    years:[618],
    status:'requires-review',
  }));
  expect(getHistoricalState(617).boundaries.find(boundary => boundary.id === suiSource?.id)?.geometry)
    .toEqual(suiSource?.geometry);
  expect(getHistoricalState(618).boundaries.some(boundary => boundary.id === suiSource?.id)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(618)).boundaries.features.some(feature =>
    feature.properties?.polityId === 'sui' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(623).boundaries.find(boundary => boundary.id === tangSource?.id)?.geometry)
    .toEqual(tangSource?.geometry);
});

test('Tang 621 annual map expression includes the Luoyang surrender event without inferring territory', () => {
  const eventId = 'tang-captures-luoyang-621';
  const row = tangFoundingAnnualAudit.years.find(item => item.year === 621);
  expect(row).toMatchObject({
    mapExpression: 'capital-and-event-points',
    centerPlaceId: 'tang_changan',
    mapEventIds: [eventId],
    territoryBoundary: null,
  });
  expect(events.find(event => event.id === eventId)).toMatchObject({
    year: 621,
    placeId: 'luoyang',
    sourceIds: expect.arrayContaining(['zizhi-tongjian']),
  });
  expect(eventDetails.find(detail => detail.eventId === eventId)).toMatchObject({
    polityIds: ['tang'],
    locationIds: ['luoyang'],
  });
  const mapData = buildLocalMapData(getHistoricalState(621));
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [112.45, 34.62]},
    properties: expect.objectContaining({entityId: eventId}),
  }));
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'tang'
    && feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint')).toBe(false);
});

test('Tang 622 map includes Liu Heita establishing his capital at Mingzhou without adding Tang territory', () => {
  const eventId = 'liu-heita-establishes-handong-kingdom-622';
  const row = tangFoundingAnnualAudit.years.find(item => item.year === 622);
  expect(row).toMatchObject({
    mapExpression: 'capital-and-event-points',
    centerPlaceId: 'tang_changan',
    mapEventIds: [eventId],
    territoryBoundary: null,
  });
  expect(events.find(event => event.id === eventId)).toMatchObject({
    year: 622,
    placeId: 'mingzhou',
    coordinates: [114.72307, 36.70103],
    sourceIds: expect.arrayContaining(['tang-early-years-primary-sources', 'mingzhou-chgis-hvd-87888']),
  });
  expect(eventDetails.find(detail => detail.eventId === eventId)).toMatchObject({
    locationIds: ['mingzhou'],
    sourceIds: expect.arrayContaining(['tang-early-years-primary-sources', 'mingzhou-chgis-hvd-87888']),
  });
  expect(sourceNotes.find(source => source.id === 'mingzhou-chgis-hvd-87888')?.note).toContain('CC BY-NC 4.0');
  const mapData = buildLocalMapData(getHistoricalState(622));
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [114.72307, 36.70103]},
    properties: expect.objectContaining({entityId: eventId}),
  }));
  expect(buildLocalMapData(getHistoricalState(621)).events.features.some(feature =>
    feature.properties?.entityId === eventId)).toBe(false);
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'tang'
    && feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint')).toBe(false);
});

test('Tang gap decision distinguishes its capital reference from missing annual border geometry', async () => {
  const { coverageDecisions } = await import('./coverage-decisions');
  const decision = coverageDecisions.find(item => item.id === 'gap-tang-618-622');
  expect(decision).toMatchObject({
    verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed',
    annualAudit:'docs/audits/topics/tang-founding-618-622.json',
  });
  expect(decision?.rationale).toContain('政治中心参照点');
  expect(decision?.historicalTransitionCheck).toContain('622年');
  expect(tangFoundingAnnualAudit).toMatchObject({decisionId:'gap-tang-618-622',yearCount:5,reviewStatus:'source-checked'});
  expect(tangFoundingAnnualAudit.years.map(row => row.year)).toEqual([618,619,620,621,622]);
  expect(tangFoundingAnnualAudit.years.every(row => row.polityId === 'tang' && row.territoryBoundary === null
    && row.centerPlaceId === 'tang_changan' && row.sourceIds.includes('modern-geography-reference')
    && row.sourceIds.includes('sui-tang-changan-gis-study'))).toBe(true);
  expect(tangFoundingAnnualAudit.years.every(row => row.sourceIds.every(sourceId => decision?.citationIds.includes(sourceId)))).toBe(true);
  expect(places.find(place => place.id === 'tang_changan')).toMatchObject({
    longitude:108.935,latitude:34.25,pointType:'regional-reference',mappingStatus:'regional',confidence:'low',
  });
});

test('Later Liang foundation years render Daliang as a capital center without a closed border', () => {
  for (const [year, placeId, coordinates, capitalPlaceIds] of [
    [907, 'kaifeng', [114.34,34.80], ['kaifeng']],
    [908, 'kaifeng', [114.34,34.80], ['kaifeng']],
    [909, 'luoyang', [112.45,34.62], ['kaifeng','luoyang']],
    [910, 'luoyang', [112.45,34.62], ['kaifeng','luoyang']],
  ] as const) {
    const state = getHistoricalState(year);
    const liang = state.boundaries.find(boundary => boundary.polityId === 'liang_later');
    expect((state.capitalTerms ?? []).filter(term => term.polityId === 'liang_later').map(term => term.placeId)).toEqual(capitalPlaceIds);
    expect(buildLocalMapData(state).capitalPlaces.features
      .filter(feature => feature.properties?.polityId === 'liang_later')
      .map(feature => feature.properties?.placeId)).toEqual(capitalPlaceIds);
    expect(liang, `后梁在${year}年的都城中心 ${placeId}`).toMatchObject({
      geometry:{type:'Point',coordinates},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(liang!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates},
      properties:expect.objectContaining({polityId:'liang_later',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
});

test('Later Liang 909 map records the documented move to Luoyang and return to Daliang', () => {
  const eventIds = ['later-liang-moves-capital-to-luoyang-909', 'later-liang-court-returns-to-daliang-909'];
  const row = laterLiangFoundingAnnualAudit.years.find(item => item.year === 909);
  expect(row).toMatchObject({
    mapExpression: 'capital-and-event-points',
    centerPlaceId: 'luoyang',
    secondaryCenterPlaceIds: ['kaifeng'],
    mapEventIds: eventIds,
    territoryBoundary: null,
  });
  expect(events.filter(event => eventIds.includes(event.id)).map(event => [event.id, event.year, event.placeId])).toEqual([
    [eventIds[0], 909, 'luoyang'],
    [eventIds[1], 909, 'kaifeng'],
  ]);
  expect(capitalHistory.find(record => record.polityId === 'liang_later'
    && record.placeId === 'luoyang' && record.validFrom === 909)?.sourceIds)
    .toContain('later-liang-capital-timeline-primary');
  for (const eventId of eventIds) {
    expect(eventDetails.find(detail => detail.eventId === eventId)).toMatchObject({
      polityIds: ['liang_later'],
      participants: [expect.objectContaining({personId:'zhu-wen'})],
      sourceIds: expect.arrayContaining(['later-liang-capital-move-909-primary']),
    });
  }
  const year909 = buildLocalMapData(getHistoricalState(909));
  expect(year909.events.features).toEqual(expect.arrayContaining([
    expect.objectContaining({geometry:{type:'Point',coordinates:[112.45,34.62]},properties:expect.objectContaining({entityId:eventIds[0]})}),
    expect.objectContaining({geometry:{type:'Point',coordinates:[114.34,34.80]},properties:expect.objectContaining({entityId:eventIds[1]})}),
  ]));
  for (const year of [908,910]) {
    const eventFeatures = buildLocalMapData(getHistoricalState(year)).events.features;
    expect(eventFeatures.some(feature => eventIds.includes(String(feature.properties?.entityId)))).toBe(false);
  }
  expect(year909.boundaries.features.some(feature => feature.properties?.polityId === 'liang_later'
    && feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint')).toBe(false);
});

test('Northern Song founding year renders Kaifeng as a political center without backfilling a border', async () => {
  expect(northernSongAnnualAudit).toMatchObject({
    decisionId:'gap-song_northern-960-960',
    yearCount:1,
    years:[{
      year:960,
      mapExpression:'control-center-point',
      capitalPlaceId:'kaifeng',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['songshi-vol1-taizu','modern-geography-reference']),
    }],
  });
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    northernSongAnnualAudit.years[0].sourceIds,
  ));
  const state = getHistoricalState(960);
  const oldZhouSource = boundaryCatalog.find(boundary => boundary.id === 'clio-3861-zhou_later-960');
  const songSource = boundaryCatalog.find(boundary => boundary.id === 'clio-3909-song_northern-961');
  const song = state.boundaries.find(boundary => boundary.polityId === 'song_northern');
  expect(song).toMatchObject({
    geometry:{type:'Point',coordinates:[114.34,34.80]},
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(song!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[114.34,34.80]},
    properties:expect.objectContaining({polityId:'song_northern',evidenceLevel:'D',derivation:'control-centers'}),
  }));
  // The Later Zhou annual outline crosses the January abdication and must not
  // render as a stable full-year control area.
  expect(oldZhouSource).toMatchObject({validFrom:960,validTo:960,confidence:'low',controlType:'unspecified'});
  expect(songSource).toMatchObject({validFrom:961,validTo:969,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:later-zhou-song-transition-960',
    boundaryId:'clio-3861-zhou_later-960',
    polityIds:['zhou_later','song_northern'],
    years:[960],
    status:'requires-review',
  }));
  expect(state.boundaries.some(boundary => boundary.id === oldZhouSource?.id)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature =>
    feature.properties?.polityId === 'zhou_later' && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(961).boundaries.find(boundary => boundary.id === songSource?.id)?.geometry)
    .toEqual(songSource?.geometry);

  const { coverageDecisions } = await import('./coverage-decisions');
  const decision = coverageDecisions.find(item => item.id === 'gap-song_northern-960-960');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed'});
  expect(decision?.rationale).toContain('开封政治中心参照点');
  expect(decision?.historicalTransitionCheck).toContain('与辽、北汉及南方政权并存');
});

test('Southern Song southward movement records each annual court-center phase without drawing a border', () => {
  const jinSource = boundaryCatalog.find(boundary => boundary.id === 'clio-4811-jin_jurchen-1126');
  const expected = new Map<number, number[][]>([
    [1127, [[115.65,34.45],[119.42,32.39]]],
    [1128, [[119.42,32.39]]],
    [1129, [[119.42,32.39],[120.16,30.25],[118.80,32.06],[120.58,30.00],[121.55,29.87],[120.70,28.00],[121.42,28.66]]],
    [1130, [[120.58,30.00]]],
    [1131, [[120.58,30.00],[120.16,30.25]]],
    [1132, [[120.58,30.00],[120.16,30.25]]],
    [1133, [[120.16,30.25]]],
    [1134, [[120.16,30.25],[120.58,31.30]]],
    [1135, [[120.16,30.25],[120.58,31.30]]],
    [1136, [[120.16,30.25],[118.80,32.06]]],
    [1137, [[118.80,32.06]]],
    [1138, [[118.80,32.06],[120.16,30.25]]],
  ]);

  for (const [year, centers] of expected) {
    const auditRow = southernSongAnnualAudit.years.find(row => row.year === year);
    expect(auditRow, `南宋年审 ${year}`).toMatchObject({
      mapExpression:'control-center-point',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['southern-song-court-route-study']),
    });
    expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(auditRow!.sourceIds));
    const auditedCoordinates = auditRow!.capitalPlaceIds.map(placeId => {
      const place = places.find(item => item.id === placeId);
      expect(place, `缺少年审地点 ${placeId}`).toBeDefined();
      return [place!.longitude, place!.latitude];
    });
    expect(auditedCoordinates, `年审地点与地图表达 ${year}`).toEqual(centers);
    const state = getHistoricalState(year);
    const song = state.boundaries.find(boundary => boundary.polityId === 'song_south');
    const geometryType = centers.length === 1 ? 'Point' : 'MultiPoint';
    const geometryCoordinates = centers.length === 1 ? centers[0] : centers;
    expect(song, `南宋 ${year}`).toMatchObject({
      geometry:{type:geometryType,coordinates:geometryCoordinates},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(song!)).toBe(false);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'song_south'
      && ['Polygon','MultiPolygon'].includes(boundary.geometry.type)).map(({id,validFrom,validTo,geometry,evidence}) => ({
        id,validFrom,validTo,geometryType:geometry.type,evidenceLevel:evidence.evidenceLevel,
      }))).toEqual([]);
    const map = buildLocalMapData(state);
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:geometryType,coordinates:geometryCoordinates},
      properties:expect.objectContaining({polityId:'song_south',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'song_south'
      && ['Polygon','MultiPolygon'].includes(feature.geometry.type))).toBe(false);
    expect(jinSource).toMatchObject({validFrom:1126,validTo:1138,confidence:'low',controlType:'unspecified'});
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry:jinSource?.geometry,
      properties:expect.objectContaining({polityId:'jin_jurchen'}),
    }));
  }
});

test('Southern Song movement gap stays unfilled and names the annual route evidence', async () => {
  expect(southernSongAnnualAudit).toMatchObject({
    decisionId:'gap-song_south-1127-1138',
    yearCount:12,
    years:Array.from({length:12}, (_, index) => expect.objectContaining({
      year:1127 + index,
      mapExpression:'control-center-point',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['southern-song-court-route-study']),
    })),
  });
  const { coverageDecisions } = await import('./coverage-decisions');
  const decision = coverageDecisions.find(item => item.id === 'gap-song_south-1127-1138');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed'});
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'southern-song-court-route-study','southern-song-linan-academic-study',
  ]));
  expect(decision?.rationale).toContain('逐年增加 D 级中心参照');
  expect(decision?.historicalTransitionCheck).toContain('逐年复核');
});

test('Southern Song termination year shows the terminal battle region without annual territory', async () => {
  const lastSouthernSongSource = boundaryCatalog.find(boundary => boundary.id === 'clio-5854-song_south-1272');
  expect(southernSongTerminationAudit).toMatchObject({
    decisionId:'gap-song_south-1279-1279',
    yearCount:1,
    years:[{
      year:1279,
      mapExpression:'leave-unfilled',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['songshi-vol47-last-emperor']),
      evidenceGap:expect.stringContaining('事件区域参照点'),
    }],
  });
  expect(sourceNotes.map(source => source.id)).toContain('songshi-vol47-last-emperor');
  expect(eventDetails.find(detail => detail.eventId === 'southern-song-ended-1279')?.sourceIds)
    .toContain('songshi-vol47-last-emperor');
  const { events } = await import('./events');
  expect(events.find(event => event.id === 'southern-song-ended-1279')?.sourceIds).toContain('songshi-vol47-last-emperor');
  const state = getHistoricalState(1279);
  const map = buildLocalMapData(state);
  expect(map.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[113.11,22.24]},
    properties:expect.objectContaining({entityId:'southern-song-ended-1279'}),
  }));
  expect(map.boundaries.features.filter(feature => feature.properties?.polityId === 'song_south'
    && feature.geometry.type !== 'Point')).toHaveLength(0);
  expect(lastSouthernSongSource).toMatchObject({validFrom:1272,validTo:1278,confidence:'low',controlType:'unspecified'});
  expect(getHistoricalState(1278).boundaries.find(boundary => boundary.id === lastSouthernSongSource?.id)?.geometry)
    .toEqual(lastSouthernSongSource?.geometry);
  expect(state.boundaries.some(boundary => boundary.id === lastSouthernSongSource?.id)).toBe(false);
  const decision = coverageDecisions.find(item => item.id === 'gap-song_south-1279-1279');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed'});
});

test('Western Xia termination year shows the siege location without presenting an annual border', () => {
  const westernXiaSource = boundaryCatalog.find(boundary => boundary.id === 'clio-5454-western_xia-1220');
  const mongolSource = boundaryCatalog.find(boundary => boundary.id === 'clio-5505-mongol-1227');
  expect(westernXiaTerminationAudit).toMatchObject({
    decisionId:'gap-western_xia-1227-1227',
    yearCount:1,
    years:[{
      year:1227,
      mapExpression:'leave-unfilled',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['yuanshi-vol1-taizu-xixia']),
    }],
  });
  expect(sourceNotes.map(source => source.id)).toContain('yuanshi-vol1-taizu-xixia');
  expect(eventDetails.find(detail => detail.eventId === 'western-xia-ended-1227')?.sourceIds)
    .toContain('yuanshi-vol1-taizu-xixia');
  expect(eventDetails.find(detail => detail.eventId === 'western-xia-ended-1227')?.sourceIds)
    .not.toContain('zizhi-tongjian');
  expect(westernXiaTerminationAudit.years[0].sourceIds).not.toContain('zizhi-tongjian');
  expect(coverageDecisions.find(item => item.id === 'gap-western_xia-1227-1227')?.citationIds)
    .not.toContain('zizhi-tongjian');
  const state = getHistoricalState(1227);
  const map = buildLocalMapData(state);
  expect(map.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[106.27,38.47]},
    properties:expect.objectContaining({entityId:'western-xia-ended-1227'}),
  }));
  expect(map.boundaries.features.filter(feature => feature.properties?.polityId === 'western_xia'
    && feature.geometry.type !== 'Point')).toHaveLength(0);
  expect(westernXiaSource).toMatchObject({validFrom:1220,validTo:1226,confidence:'low',controlType:'unspecified'});
  expect(mongolSource).toMatchObject({validFrom:1227,validTo:1235,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:mongol-xixia-transition-1227',
    boundaryId:'clio-5505-mongol-1227',
    polityIds:['mongol','western_xia'],
    years:[1227],
    status:'requires-review',
  }));
  expect(getHistoricalState(1226).boundaries.find(boundary => boundary.id === westernXiaSource?.id)?.geometry)
    .toEqual(westernXiaSource?.geometry);
  expect(state.boundaries.some(boundary => boundary.id === mongolSource?.id)).toBe(false);
  expect(map.boundaries.features.some(feature => feature.properties?.polityId === 'mongol'
    && feature.geometry.type !== 'Point')).toBe(false);
  expect(getHistoricalState(1228).boundaries.find(boundary => boundary.id === mongolSource?.id)?.geometry)
    .toEqual(mongolSource?.geometry);
});

test('Jurchen Jin founding decade renders its Huining political center without inventing annual borders', () => {
  expect(jurchenJinAnnualAudit).toMatchObject({
    decisionId:'gap-jin_jurchen-1115-1125',
    yearCount:11,
    years:Array.from({length:11}, (_, index) => expect.objectContaining({
      year:1115 + index,
      mapExpression:'control-center-point',
      capitalPlaceId:'huining',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['capital-history-reference']),
    })),
  });
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    jurchenJinAnnualAudit.years.flatMap(row => row.sourceIds),
  ));
  for (let year = 1115; year <= 1125; year++) {
    const jin = getHistoricalState(year).boundaries.find(boundary => boundary.polityId === 'jin_jurchen');
    expect(jin, `金 ${year}`).toMatchObject({
      geometry:{type:'Point',coordinates:[126.98,45.55]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(jin!)).toBe(false);
    expect(buildLocalMapData(getHistoricalState(year)).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[126.98,45.55]},
      properties:expect.objectContaining({polityId:'jin_jurchen',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  expect(coverageDecisions.find(item => item.id === 'gap-jin_jurchen-1115-1125'))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(jurchenJinAnnualAudit.years.find(row => row.year === 1122)?.conclusion).toContain('十二月进军燕京');
  expect(jurchenJinAnnualAudit.years.find(row => row.year === 1123)?.conclusion).toContain('太祖去世、太宗即位');
  expect(jurchenJinAnnualAudit.years.find(row => row.year === 1123)?.conclusion).not.toContain('进入燕京');
});

test('Northern Song source outline is held only in 1125 when the Jin-Song war begins', () => {
  const source = boundaryCatalog.find(boundary => boundary.id === 'clio-4444-song_northern-1056');
  expect(source).toMatchObject({validFrom:1056,validTo:1125,confidence:'low',controlType:'unspecified'});
  expect(getHistoricalState(1124).boundaries.find(boundary => boundary.id === source?.id)?.geometry)
    .toEqual(source?.geometry);
  expect(buildLocalMapData(getHistoricalState(1124)).boundaries.features.some(feature => (
    feature.properties?.polityId === 'song_northern' && ['Polygon','MultiPolygon'].includes(feature.geometry.type)
  ))).toBe(true);
  expect(getHistoricalState(1125).boundaries.some(boundary => boundary.id === source?.id)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(1125)).boundaries.features.some(feature => (
    feature.properties?.polityId === 'song_northern' && ['Polygon','MultiPolygon'].includes(feature.geometry.type)
  ))).toBe(false);
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:northern-song-jin-war-1125',
    boundaryId:'clio-4444-song_northern-1056',
    polityIds:['song_northern','jin_jurchen'],
    years:[1125],
    status:'requires-review',
  }));
});

test('Western Liao migration years document annual political change without mapping a speculative frontier', () => {
  expect(westernLiaoAnnualAudit).toMatchObject({
    decisionId:'gap-western_liao-1124-1125',
    yearCount:2,
    years:[1124,1125].map(year => expect.objectContaining({
      year,
      mapExpression:'leave-unfilled',
      capitalPlaceId:null,
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['liaoshi-vol30-yelu-dashi','iranica-qara-ketay']),
    })),
  });
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    westernLiaoAnnualAudit.years.flatMap(row => row.sourceIds),
  ));
  for (const year of [1124,1125]) {
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.polityId === 'western_liao')).toBe(false);
  }
  expect(coverageDecisions.find(item => item.id === 'gap-western_liao-1124-1125'))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(westernLiaoAnnualAudit.years[0].conclusion).toContain('继续西行');
  expect(westernLiaoAnnualAudit.years[1].conclusion).toContain('中央政权终结');
  const westernLiaoDetail = eventDetails.find(detail => detail.eventId === 'western-liao-founded');
  expect(westernLiaoAnnualAudit.years[0].conclusion).toContain('可敦城');
  expect(westernLiaoAnnualAudit.years[0].conclusion).toContain('北庭都护府');
  expect(westernLiaoAnnualAudit.years[0].conclusion).toContain('七州');
  expect(westernLiaoAnnualAudit.years[0].evidenceGap).toMatch(/现代遗址对应|精确坐标/);
  expect(westernLiaoDetail?.phases?.some(phase => phase.label.includes('可敦城'))).toBe(true);
  expect(westernLiaoDetail?.locationIds).not.toContain('balasagun');
  for (const year of [1124, 1125]) {
    const state = getHistoricalState(year);
    const mapData = buildLocalMapData(state);
    expect(mapData.boundaries.features.some(boundary => boundary.properties?.polityId === 'western_liao')).toBe(false);
    if (year === 1124) expect(mapData.events.features.some(event => event.properties?.entityId === 'western-liao-founded')).toBe(false);
  }
});

test('Dali early years show the Yangjumei political-center point while leaving annual borders unfilled', () => {
  expect(daliEarlyAnnualAudit).toMatchObject({
    decisionId:'gap-dali-937-946',
    yearCount:10,
    years:Array.from({length:10}, (_, index) => expect.objectContaining({
      year:937 + index,
      mapExpression:'control-center-point',
      capitalPlaceId:'yangjumei',
      territoryBoundary:null,
      sourceIds:expect.arrayContaining(['dali-yangjumei-mct']),
    })),
  });
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    daliEarlyAnnualAudit.years.flatMap(row => row.sourceIds),
  ));
  for (let year = 937; year <= 946; year++) {
    const dali = getHistoricalState(year).boundaries.find(boundary => boundary.polityId === 'dali');
    expect(dali, `大理 ${year}`).toMatchObject({
      geometry:{type:'Point',coordinates:[100.16,25.70]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(dali!)).toBe(false);
    expect(buildLocalMapData(getHistoricalState(year)).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[100.16,25.70]},
      properties:expect.objectContaining({polityId:'dali',evidenceLevel:'D',derivation:'control-centers'}),
    }));
  }
  expect(coverageDecisions.find(item => item.id === 'gap-dali-937-946'))
    .toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[]});
  expect(daliEarlyAnnualAudit.years[0].evidenceGap).toContain('938');
});

test('Later Liang 907–910 decision keeps the frontier unfilled despite displaying its capital center', async () => {
  const { coverageDecisions } = await import('./coverage-decisions');
  const decision = coverageDecisions.find(item => item.id === 'gap-liang_later-907-910');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed'});
  expect(decision?.rationale).toContain('政治中心');
  expect(decision?.historicalTransitionCheck).toContain('907');
  expect(laterLiangFoundingAnnualAudit).toMatchObject({decisionId:'gap-liang_later-907-910',yearCount:4,reviewStatus:'source-checked'});
  expect(laterLiangFoundingAnnualAudit.years.map(row => row.year)).toEqual([907,908,909,910]);
  expect(laterLiangFoundingAnnualAudit.years.every(row => row.polityId === 'liang_later' && row.territoryBoundary === null
    && row.sourceIds.includes('zizhi-tongjian') && row.sourceIds.includes('modern-geography-reference'))).toBe(true);
  expect(laterLiangFoundingAnnualAudit.years.map(row => row.centerPlaceId)).toEqual(['kaifeng','kaifeng','luoyang','luoyang']);
  for (const year of [907,908,909,910]) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === (year < 909
      ? 'special-later-liang-907-908-kaifeng-center'
      : 'special-later-liang-909-912-luoyang-center'))).toBe(true);
    expect(isDefiniteBoundary(state.boundaries.find(boundary => boundary.polityId === 'liang_later')!)).toBe(false);
  }
  expect(laterLiangFoundingAnnualAudit.years[2].secondaryCenterPlaceIds).toContain('kaifeng');
  expect(laterLiangFoundingAnnualAudit.years[3].secondaryCenterPlaceIds).toContain('kaifeng');
});

test('Qin collapse years render dated Xianyang centers while keeping the annual territory unfilled', async () => {
  expect(qinCollapseAnnualAudit.decisionId).toBe('gap-qin--208--206');
  expect(qinCollapseAnnualAudit.years.map(row => row.year)).toEqual([-208, -207, -206]);
  expect(qinCollapseAnnualAudit.years.every(row => row.mapExpression === (row.year === -206 ? 'leave-unfilled' : 'control-center-point')
    && row.centerPlaceId === (row.year === -206 ? null : 'xianyang')
    && row.territoryBoundary === null
    && row.conclusion.length > 40
    && row.evidenceGap.length > 25
    && row.sourceIds.length > 0)).toBe(true);
  expect(qinCollapseAnnualAudit.sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    [...new Set(qinCollapseAnnualAudit.years.flatMap(row => row.sourceIds))],
  ));
  expect(qinCollapseAnnualAudit.years[2].conclusion).toMatch(/前207.*前206|前206.*前207/);
  expect(qinCollapseAnnualAudit.years[1].evidenceGap).toContain('秦、汉时期武关地望及遗址对应仍有争议');
  expect('mapEventIds' in qinCollapseAnnualAudit.years[1]).toBe(false);
  for (const year of [-208,-207,-206]) {
    const state = getHistoricalState(year);
    const qinRecords = state.boundaries.filter(boundary => boundary.polityId === 'qin');
    if (year === -206) {
      expect(qinCollapseAnnualAudit.years[2]).toMatchObject({
        mapExpression:'leave-unfilled', centerPlaceId:null, territoryBoundary:null,
      });
      expect(qinRecords, '前206年秦仅在年内前段存在，年度图不显示全年秦中心点').toHaveLength(0);
      expect(state.boundaries.some(boundary => boundary.polityId === 'han_western')).toBe(true);
      continue;
    }
    expect(qinRecords, `秦在前${Math.abs(year)}年不得被旧疆域轮廓回填`).toHaveLength(1);
    const qin = qinRecords[0];
    expect(qin, `秦末前${Math.abs(year)}年咸阳中心`).toMatchObject({
      geometry:{type:'Point',coordinates:[108.70,34.33]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
      mapRepresentation:'control-centers',
      sourceIds:expect.arrayContaining(['qin-collapse-timeline-shiji']),
    });
    expect(isDefiniteBoundary(qin!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[108.70,34.33]},
      properties:expect.objectContaining({polityId:'qin',evidenceLevel:'D',derivation:'control-centers'}),
    }));
    expect(buildLocalMapData(state).boundaries.features.filter(feature => feature.properties?.polityId === 'qin')).toHaveLength(1);
  }

  const { coverageDecisions } = await import('./coverage-decisions');
  const decision = coverageDecisions.find(item => item.id === 'gap-qin--208--206');
  expect(decision).toMatchObject({verdict:'leave-unfilled',sourceBoundaryIds:[],reviewStatus:'reviewed'});
  expect(decision?.citationIds).toContain('qin-collapse-timeline-shiji');
  expect(decision?.citationIds).toContain('modern-geography-reference');
  expect(decision?.historicalTransitionCheck).toContain('qin-collapse-208-206.json');
  expect(decision?.historicalTransitionCheck).toContain('前207年');
  expect(decision?.historicalTransitionCheck).toContain('前206年');
  expect(decision?.rationale).toContain('疆域面继续留空');
  expect(decision?.rationale).toContain('年度图不显示秦的全年中心点');
});

test('Yuan annual audit records each year without inferring borders from capitals or wars', () => {
  const mongolSource = boundaryCatalog.find(boundary => boundary.id === 'clio-5808-mongol-1260');
  const yuan1279Basemap = boundaryCatalog.find(boundary => boundary.id === 'hb-1279-yuan-246');
  expect(yuanAnnualAudit.decisionId).toBe('gap-yuan-1271-1293');
  expect(yuanAnnualAudit.yearCount).toBe(23);
  expect(yuanAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 23}, (_, index) => 1271 + index),
  );
  expect(yuanAnnualAudit.years.some(row => row.year === 0)).toBe(false);
  expect(yuanAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(yuanAnnualAudit.years.every(row => row.evidenceGap.length > 20)).toBe(true);
  expect(sourceNotes.map(source => source.id)).toContain('yuanshi-shizu-1271-1293');
  expect(coverageDecisions.find(item => item.id === yuanAnnualAudit.decisionId)?.citationIds)
    .toContain('yuanshi-shizu-1271-1293');
  expect(yuan1279Basemap).toMatchObject({
    validFrom:1279,
    validTo:1279,
    snapshotYear:1279,
    confidence:'low',
    controlType:'unspecified',
    sourceIds:['historical-basemaps'],
  });
  expect(yuanAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'historical-basemaps'}));
  expect(yuanAnnualAudit.years.find(row => row.year === 1279)?.sourceIds).toContain('historical-basemaps');
  expect(coverageDecisions.find(item => item.id === yuanAnnualAudit.decisionId)?.citationIds)
    .toContain('historical-basemaps');
  expect(coverageDecisions.find(item => item.id === yuanAnnualAudit.decisionId)?.rationale)
    .toContain('Historical Basemaps record 246');
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'hold:yuan-unfilled-gap:1279',
    boundaryId:'hb-1279-yuan-246',
    polityIds:['yuan'],
    years:[1279],
    status:'requires-review',
  }));

  for (let year = 1271; year <= 1293; year++) {
    const row = yuanAnnualAudit.years[year - 1271];
    const yuan = getHistoricalState(year).boundaries.find(boundary => boundary.polityId === 'yuan');
    expect(row.sourceIds).toContain('yuanshi-shizu-1271-1293');
    if (year === 1271) {
      expect(yuan).toBeUndefined();
    } else {
      expect(yuan, `Yuan political center should be recorded in ${year}`).toMatchObject({
        geometry: {type: 'Point', coordinates: [116.40, 39.90]},
        evidence: {evidenceLevel: 'D', derivation: 'control-centers'},
      });
      expect(isDefiniteBoundary(yuan!)).toBe(false);
    }
    if (year === 1279) {
      expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === yuan1279Basemap?.id)).toBe(false);
      expect(buildLocalMapData(getHistoricalState(year)).boundaries.features.some(feature => (
        feature.id === yuan1279Basemap?.id
      ))).toBe(false);
    }
  }
  expect(mongolSource).toMatchObject({validFrom:1260,validTo:1271,confidence:'low',controlType:'unspecified'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:mongol-yuan-transition-1271',
    boundaryId:'clio-5808-mongol-1260',
    polityIds:['mongol','yuan'],
    years:[1271],
    status:'requires-review',
  }));
  expect(getHistoricalState(1270).boundaries.find(boundary => boundary.id === mongolSource?.id)?.geometry)
    .toEqual(mongolSource?.geometry);
  expect(getHistoricalState(1271).boundaries.some(boundary => boundary.id === mongolSource?.id)).toBe(false);
  expect(buildLocalMapData(getHistoricalState(1271)).boundaries.features.some(feature =>
    feature.properties?.polityId === 'mongol' && feature.geometry.type !== 'Point')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(1271)).capitalPlaces.features.some(feature =>
    feature.properties?.placeId === 'shangdu')).toBe(true);
});

test('Yuan capital reference reaches the rendered local map data as points only', () => {
  const state = getHistoricalState(1272);
  const mapData = buildLocalMapData(state);

  expect(mapData.boundaries.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [116.40, 39.90]},
    properties: expect.objectContaining({polityId: 'yuan', evidenceLevel: 'D', derivation: 'control-centers'}),
  }));
  expect(mapData.capitalPlaces.features).toEqual(expect.arrayContaining([
    expect.objectContaining({geometry: {type: 'Point', coordinates: [116.18, 42.36]}}),
    expect.objectContaining({geometry: {type: 'Point', coordinates: [116.40, 39.90]}}),
  ]));
  expect(mapData.boundaries.features.some(feature => (
    feature.properties?.polityId === 'yuan' && feature.geometry.type.endsWith('Polygon')
  ))).toBe(false);
});

test('Northern Yuan 1440-1467 has one sourced annual finding per year and no inherited outline', () => {
  expect(northernYuanYesenAnnualAudit.decisionId).toBe('gap-northern_yuan-1440-1467');
  expect(northernYuanYesenAnnualAudit.yearCount).toBe(28);
  expect(northernYuanYesenAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 28}, (_, index) => 1440 + index),
  );
  expect(northernYuanYesenAnnualAudit.years.every(row => row.territoryBoundary === null
    && row.sourceIds.includes('northern-yuan-yesen')
    && row.evidenceGap.length > 25)).toBe(true);
  expect(sourceNotes.map(source => source.id)).toContain('northern-yuan-yesen');

  for (let year = 1440; year <= 1467; year++) {
    const state = getHistoricalState(year);
    const northernYuan = state.boundaries.find(boundary => boundary.polityId === 'northern_yuan');
    expect(northernYuan, `Northern Yuan should remain explicitly unmapped in ${year}`).toBeUndefined();
  }

  const tumuEvent = events.find(event => event.id === 'tumu-incident-1449');
  expect(tumuEvent).toMatchObject({
    year:1449,
    coordinates:[115.6064,40.3814],
    locationPrecision:'approximate',
  });
  expect(tumuEvent?.sourceIds.every(id => sourceNotes.some(source => source.id === id))).toBe(true);
  const tumuState = getHistoricalState(1449);
  expect(tumuState.boundaries.some(boundary => boundary.polityId === 'northern_yuan')).toBe(false);
  expect(buildLocalMapData(tumuState).events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[115.6064,40.3814]},
    properties:expect.objectContaining({entityId:'tumu-incident-1449'}),
  }));
});

test('Han Warring States termination marks Xinzheng as the final political center without a border', () => {
  expect(hanWarringTerminationAudit.decisionId).toBe('gap-han_warring--230--230');
  expect(hanWarringTerminationAudit.years).toHaveLength(1);
  expect(hanWarringTerminationAudit.years[0]).toMatchObject({
    year: -230,
    mapExpression: 'control-center-point',
    centerPlaceId: 'xinzheng',
    territoryBoundary: null,
  });
  expect(hanWarringTerminationAudit.years[0].sourceIds).toContain('zizhi-tongjian-vol6-han-termination');
  expect(hanWarringTerminationAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'shiji-han-shijia-termination-230',
    'han-warring-late-territory-li-xiaojie-2001',
    'han-warring-late-territory-zhang-jianyu-2023',
  ]));
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining([
    'shiji-han-shijia-termination-230',
    'han-warring-late-territory-li-xiaojie-2001',
    'han-warring-late-territory-zhang-jianyu-2023',
  ]));

  const state = getHistoricalState(-230);
  const han = state.boundaries.find(boundary => boundary.polityId === 'han_warring');
  expect(han).toMatchObject({
    geometry: {type: 'Point', coordinates: [113.74, 34.40]},
    evidence: {evidenceLevel: 'D', derivation: 'control-centers', reviewStatus: 'source-checked'},
  });
  expect(isDefiniteBoundary(han!)).toBe(false);
  expect(getHistoricalState(-231).boundaries.some(boundary => boundary.polityId === 'han_warring'
    && boundary.geometry.type === 'Point'
    && boundary.geometry.coordinates[0] === 113.74
    && boundary.geometry.coordinates[1] === 34.40)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [113.74, 34.40]},
    properties: expect.objectContaining({polityId: 'han_warring', evidenceLevel: 'D'}),
  }));
});

test('Chu termination keeps disputed Shouchun control unfilled and records the chronology sources', () => {
  expect(chuWarringTerminationAudit.decisionId).toBe('gap-chu_warring--223--223');
  expect(chuWarringTerminationAudit.years).toHaveLength(1);
  expect(chuWarringTerminationAudit.years[0].sourceIds).toEqual(expect.arrayContaining([
    'shiji-chu-shijia-termination-223',
    'shiji-qin-shihuang-chu-war-224-223',
    'chu-conquest-chronology-tao-ran-2019',
  ]));
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining([
    'shiji-chu-shijia-termination-223',
    'shiji-qin-shihuang-chu-war-224-223',
    'chu-conquest-chronology-tao-ran-2019',
  ]));
  expect(chuWarringTerminationAudit.years[0]).toMatchObject({
    year: -223,
    mapExpression: 'leave-unfilled',
    centerPlaceId: null,
    territoryBoundary: null,
  });
  expect(chuWarringTerminationAudit.years[0].sourceIds).toContain('zizhi-tongjian-vol7-chu-termination');

  const state = getHistoricalState(-223);
  expect(state.boundaries.some(boundary => boundary.polityId === 'chu_warring')).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature => feature.properties?.polityId === 'chu_warring')).toBe(false);
});

test('Yan termination shows the researched Liaoyang regional center without drawing a boundary', () => {
  expect(yanWarringTerminationAudit.decisionId).toBe('gap-yan_warring--222--222');
  expect(yanWarringTerminationAudit.years).toHaveLength(1);
  expect(yanWarringTerminationAudit.years[0]).toMatchObject({
    year: -222,
    mapExpression: 'control-center-point',
    centerPlaceId: 'liaoyang',
    territoryBoundary: null,
  });
  expect(yanWarringTerminationAudit.years[0].sourceIds).toContain('zizhi-tongjian-vol7-yan-termination');

  const state = getHistoricalState(-222);
  const liaoyang = state.boundaries.find(boundary => boundary.polityId === 'yan_warring');
  expect(liaoyang).toMatchObject({
    id: 'special-yan-warring-226-222-liaoyang-regional-center',
    geometry: {type:'Point',coordinates:[123.17,41.27]},
    presentation: 'reference',
    confidence: 'low',
    mapRepresentation: 'control-centers',
    evidence: {evidenceLevel:'D', derivation:'control-centers', reviewStatus:'source-checked'},
  });
  expect(isDefiniteBoundary(liaoyang!)).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature => (
    feature.properties?.polityId === 'yan_warring' && feature.geometry.type === 'Point'
  ))).toBe(true);
});
