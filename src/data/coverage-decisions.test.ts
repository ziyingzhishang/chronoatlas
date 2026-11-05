import { expect, test } from 'vitest';
import audit from '../../internal/audits/coverage-audit.json';
import { boundaryCatalog } from './boundaries';
import { boundaryGeometryConflicts } from './boundary-conflicts';
import { coverageDecisions, decisionKey, gapKey } from './coverage-decisions';
import { getHistoricalState } from '../domain/history-state';
import { isDefiniteBoundary } from '../domain/boundary-evidence';
import { sourceNotes } from './sources';
import { events } from './events';
import { capitalHistory } from './capital-history';
import { places } from './places';
import { buildLocalMapData } from '../map/history-map';
import { expandCivilYears } from './territory-research';
import easternZhouAnnualAudit from '../../docs/audits/topics/eastern-zhou-royal-core-770-751.json';
import easternZhouEndAudit from '../../docs/audits/topics/eastern-zhou-termination-256.json';
import qinEarlyAnnualAudit from '../../docs/audits/topics/qin-state-early-gap-770-751.json';
import qinUnificationAnnualAudit from '../../docs/audits/topics/qin-unification-221-219.json';
import hanKingChuHanAnnualAudit from '../../docs/audits/topics/han-king-chuhan-206-203.json';
import gengshiAnnualAudit from '../../docs/audits/topics/gengshi-capital-centers-23-25.json';
import liuSongEarlyAnnualAudit from '../../docs/audits/topics/liu-song-founding-420-425.json';
import wuZhouEndAnnualAudit from '../../docs/audits/topics/wu-zhou-termination-705.json';
import yangWuFormationAnnualAudit from '../../docs/audits/topics/yang-wu-formation-and-expansion-902-910.json';
import southernTangAnnualAudit from '../../docs/audits/topics/southern-tang-formation-and-contraction-937-959.json';
import wuyueEarlyAnnualAudit from '../../docs/audits/topics/wuyue-formation-and-contested-huzhou-907-910.json';
import minEarlyAnnualAudit from '../../docs/audits/topics/min-founding-and-fujian-region-909-910.json';
import maChuEarlyAnnualAudit from '../../docs/audits/topics/ma-chu-regional-expansion-907-910.json';
import formerShuEarlyAnnualAudit from '../../docs/audits/topics/former-shu-early-extent-907-910.json';
import laterShuEarlyAnnualAudit from '../../docs/audits/topics/later-shu-early-extent-934-935.json';
import jingnanEarlyAnnualAudit from '../../docs/audits/topics/jingnan-early-polity-924-925.json';
import northernHanEarlyAnnualAudit from '../../docs/audits/topics/northern-han-establishment-and-early-wars-951-959.json';
import chengHanFoundingAnnualAudit from '../../docs/audits/topics/cheng-han-founding-304-305.json';
import formerLiangAnnualAudit from '../../docs/audits/topics/former-liang-early-extent-314-323.json';
import westernQinEarlyAnnualAudit from '../../docs/audits/topics/western-qin-founding-385-386.json';
import westernQinRestorationAnnualAudit from '../../docs/audits/topics/western-qin-restoration-409.json';
import laterLiangFoundingAnnualAudit from '../../docs/audits/topics/later-liang-founding-386.json';
import laterYanQinFoundingAnnualAudit from '../../docs/audits/topics/later-yan-qin-founding-384-386.json';
import southernLiangEndAnnualAudit from '../../docs/audits/topics/southern-liang-termination-414.json';
import laterQinTerminationAnnualAudit from '../../docs/audits/topics/later-qin-termination-417.json';
import frozenShortGapBatch from './frozen-short-gaps.json';
import frozenMediumGapBatch from './frozen-medium-gaps.json';

test('every audited coverage gap has exactly one explicit decision', () => {
  const gapKeys = audit.flatMap(polity => polity.missingRanges.map(([from, to]) =>
    gapKey(polity.id, from, to)));
  const decisionKeys = coverageDecisions.map(decisionKey);

  expect(new Set(decisionKeys).size).toBe(decisionKeys.length);
  expect(decisionKeys.sort()).toEqual(gapKeys.sort());
});

test('unfilled gaps never borrow the same polity polygon that begins in the following year', () => {
  const adjacentSources = coverageDecisions
    .filter(decision => decision.verdict === 'leave-unfilled')
    .flatMap(decision => boundaryCatalog
      .filter(boundary => boundary.polityId === decision.polityId &&
        boundary.validFrom === decision.to + 1 &&
        (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon'))
      .map(boundary => ({decision, boundary})));

  expect(adjacentSources.length).toBeGreaterThan(0);
  for (const {decision, boundary} of adjacentSources) {
    for (let year = decision.from; year <= decision.to; year++) {
      if (year === 0) continue;
      const state = getHistoricalState(year);
      expect(state.boundaries.some(item => item.id === boundary.id),
        `${decision.id} year ${year} must not inherit ${boundary.id}`).toBe(false);
      expect(buildLocalMapData(state).boundaries.features.some(feature =>
        feature.geometry?.type === boundary.geometry.type &&
        JSON.stringify(feature.geometry) === JSON.stringify(boundary.geometry) &&
        feature.properties?.polityId === decision.polityId),
      `${decision.id} year ${year} must not render ${boundary.id}`).toBe(false);
    }
    const firstSourceYear = getHistoricalState(boundary.validFrom);
    const sourceHeldForReview = boundaryGeometryConflicts.some(conflict =>
      conflict.boundaryId === boundary.id && conflict.status === 'requires-review' &&
      conflict.years.includes(boundary.validFrom));
    const sourceInRuntime = firstSourceYear.boundaries.find(item => item.id === boundary.id);
    const sourceInMapData = buildLocalMapData(firstSourceYear).boundaries.features.some(feature =>
      feature.geometry?.type === boundary.geometry.type &&
      JSON.stringify(feature.geometry) === JSON.stringify(boundary.geometry) &&
      feature.properties?.polityId === decision.polityId);
    if (sourceHeldForReview) {
      expect(sourceInRuntime, `${boundary.id} is held pending conflict review`).toBeUndefined();
      expect(sourceInMapData, `${boundary.id} must stay out of map data pending review`).toBe(false);
    } else {
      expect(sourceInRuntime?.geometry, `${boundary.id} should retain its source geometry in ${boundary.validFrom}`)
        .toEqual(boundary.geometry);
      expect(sourceInMapData, `${boundary.id} should be present in map data in ${boundary.validFrom}`).toBe(true);
    }
  }
});

test('every annual topic audit is linked from its decision with all yearly source ids', () => {
  const topicAudits = import.meta.glob('../../docs/audits/topics/*.json', {
    eager:true, import:'default',
  }) as Record<string, {
    decisionId?:string; decisionIds?:string[]; years?:Array<{polityId?:string;sourceIds?:string[]}>;
  }>;

  for (const [path, audit] of Object.entries(topicAudits)) {
    if (!audit.decisionId && !audit.decisionIds?.length) continue;
    const file = path.split('/').pop();
    const decisionIds = audit.decisionIds ?? (audit.decisionId ? [audit.decisionId] : []);
    for (const decisionId of decisionIds) {
      const decision = coverageDecisions.find(item => item.id === decisionId);
      expect(decision?.annualAudit, decisionId).toBe(`docs/audits/topics/${file}`);
      const decisionRows = (audit.years ?? []).filter(year => !year.polityId || year.polityId === decision?.polityId);
      for (const sourceId of new Set(decisionRows.flatMap(year => year.sourceIds ?? []))) {
        expect(decision?.citationIds, `${decisionId} cites ${sourceId}`).toContain(sourceId);
        expect(sourceNotes.some(source => source.id === sourceId), `${decisionId} registers ${sourceId}`).toBe(true);
      }
    }
  }
});

test('every coverage decision has one complete annual conclusion for each valid civil year', () => {
  const topicAudits = import.meta.glob('../../docs/audits/topics/*.json', {
    eager:true, import:'default',
  }) as Record<string, {
    decisionId?:string; decisionIds?:string[];
    years?:Array<{polityId?:string;year:number;conclusion?:string;evidenceGap?:string;sourceIds?:string[]}>;
  }>;

  for (const decision of coverageDecisions) {
    const file = decision.annualAudit?.split('/').pop();
    const audit = file ? topicAudits[`../../docs/audits/topics/${file}`] : undefined;
    expect(audit, `${decision.id} must link to an annual audit`).toBeDefined();
    const decisionIds = audit?.decisionIds ?? (audit?.decisionId ? [audit.decisionId] : []);
    expect(decisionIds, `${decision.id} must be named by its annual audit`).toContain(decision.id);

    const rows = (audit?.years ?? []).filter(row => !row.polityId || row.polityId === decision.polityId);
    const expectedYears = expandCivilYears(decision.from, decision.to);
    expect(rows.map(row => row.year), decision.id).toEqual(expectedYears);
    expect(rows.every(row => row.year !== 0 && Boolean(row.conclusion?.trim())
      && Boolean(row.evidenceGap?.trim() || row.sourceIds?.length)), decision.id).toBe(true);
  }
});

test('every leave-unfilled ledger year stays free of inherited polity polygons in runtime map data', () => {
  for (const decision of coverageDecisions.filter(item => item.verdict === 'leave-unfilled')) {
    for (let year = decision.from; year <= decision.to; year += 1) {
      if (year === 0) continue;
      const state = getHistoricalState(year);
      const mapData = buildLocalMapData(state);
      const isPolygon = (geometry: {type: string}) => (
        geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
      );

      expect(state.boundaries.some(boundary => boundary.polityId === decision.polityId && isPolygon(boundary.geometry)),
        `${decision.id} must stay unfilled in ${year}; runtime polygons: ${state.boundaries
          .filter(boundary => boundary.polityId === decision.polityId && isPolygon(boundary.geometry))
          .map(boundary => `${boundary.id} (${boundary.polityId})`).join(', ')}`).toBe(false);
      expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === decision.polityId
        && isPolygon(feature.geometry)),
      `${decision.id} must not render an inherited polygon in ${year}`).toBe(false);
    }
  }
});

test('every maximum reference names one source record from the same polity', () => {
  for (const decision of coverageDecisions.filter(item => item.verdict === 'maximum-record')) {
    expect(decision.sourceBoundaryIds).toHaveLength(1);
    const source = boundaryCatalog.find(boundary => boundary.id === decision.sourceBoundaryIds[0]);
    expect(source?.polityId).toBe(decision.polityId);
    expect(decision.rationale.length).toBeGreaterThan(20);
  }
});

test('a reviewed Qin unification gap stays without a boundary while its capital center is displayed', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-qin--221--219');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: [],
    annualAudit: 'docs/audits/topics/qin-unification-221-219.json',
  });
  expect(qinUnificationAnnualAudit.decisionId).toBe(decision?.id);
  expect(qinUnificationAnnualAudit.years.map(row => row.year)).toEqual([-221, -220, -219]);
  expect(qinUnificationAnnualAudit.years.every(row => row.territoryBoundary === null &&
    row.sourceIds.includes('qin-empire-at-height-map-land') && row.evidenceGap.length > 20)).toBe(true);
  const qinHeightMapSource = sourceNotes.find(source => source.id === 'qin-empire-at-height-map-land');
  expect(qinHeightMapSource?.authorOrInstitution).toContain('Volume 7, Issue 1');
  expect(qinHeightMapSource?.scope).toContain('前230');
  expect(qinHeightMapSource?.scope).toContain('湖南、浙江');
  expect(qinHeightMapSource?.note).toContain('前221年');
  const qin = getHistoricalState(-221).boundaries.find(boundary => boundary.polityId === 'qin');
  expect(qin).toMatchObject({geometry:{type:'Point'}, evidence:{evidenceLevel:'D',derivation:'control-centers'}});
  expect(isDefiniteBoundary(qin!)).toBe(false);
});

test('Qin 219 records the debated post-unification commandery changes in Qi without inferring borders', () => {
  const source = sourceNotes.find(item => item.id === 'qin-qi-commandery-setup-review-2023');
  const year219 = qinUnificationAnnualAudit.years.find(row => row.year === -219);

  expect(source?.note).toContain('前219年');
  expect(year219?.sourceIds).toContain('qin-qi-commandery-setup-review-2023');
  expect(year219?.conclusion).toContain('济北');
  expect(year219?.conclusion).toContain('即墨');
  expect(year219?.evidenceGap).toContain('不能复原全年疆界');
  expect(year219?.territoryBoundary).toBeNull();
});

test('Later Qin 385 keeps the Xinping old-city location dispute traceable without inventing an event point', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_qin-384-386');
  const year385 = laterYanQinFoundingAnnualAudit.years.find(row => row.polityId === 'later_qin' && row.year === 385);
  const gazetteer = sourceNotes.find(item => item.id === 'zhili-binzhou-gazetteer-qi-county-location');

  expect(year385?.mapExpression).toBe('historical-conclusion-only');
  expect(year385?.centerPlaceId).toBeNull();
  expect(year385?.territoryBoundary).toBeNull();
  expect(year385?.sourceIds).toContain('zhili-binzhou-gazetteer-qi-county-location');
  expect(year385?.evidenceGap).toContain('西南塬');
  expect(year385?.evidenceGap).toContain('地望');
  expect(gazetteer?.note).toContain('没有提供可复核坐标');
  expect(decision?.citationIds).toContain('zhili-binzhou-gazetteer-qi-county-location');
});

test('a reviewed Han king gap links its annual fief evidence while keeping war years unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-han_western--206--203');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: [],
    annualAudit: 'docs/audits/topics/han-king-chuhan-206-203.json',
  });
  expect(decision?.citationIds).toContain('huayang-guozhi-han-king-fief');
  expect(hanKingChuHanAnnualAudit.decisionId).toBe(decision?.id);
  expect(hanKingChuHanAnnualAudit.years.map(row => row.year)).toEqual([-206, -205, -204, -203]);
  expect(hanKingChuHanAnnualAudit.sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining(
    [...new Set(hanKingChuHanAnnualAudit.years.flatMap(row => row.sourceIds))],
  ));
  expect(hanKingChuHanAnnualAudit.years.every(row => row.territoryBoundary === null &&
    row.sourceIds.every(sourceId => decision?.citationIds.includes(sourceId) || sourceId === 'modern-geography-reference') &&
    row.evidenceGap.length > 20)).toBe(true);
  for (const row of hanKingChuHanAnnualAudit.years) {
    const center = getHistoricalState(row.year).boundaries.find(boundary => boundary.polityId === 'han_western');
    expect(center?.geometry).toMatchObject({type: 'Point'});
    expect(isDefiniteBoundary(center!)).toBe(false);
  }
});

test('Han 205 renders the Pengcheng battle as a year-specific event point beside the Liyang center', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-han_western--206--203');
  const year205 = hanKingChuHanAnnualAudit.years.find(row => row.year === -205);
  const event = events.find(item => item.id === 'han-pengcheng-battle-205');
  const state = getHistoricalState(-205);
  const mapData = buildLocalMapData(state);

  expect(year205?.mapExpression).toContain('event-point');
  expect(year205?.mapEventIds).toContain('han-pengcheng-battle-205');
  expect(event).toMatchObject({year:-205, placeId:'pengcheng', locationPrecision:'approximate'});
  expect(event?.sourceIds).toEqual(expect.arrayContaining([
    'shiji-gaozubenji-pengcheng-battle-205', 'xuzhou-pengcheng-historical-location',
  ]));
  expect(mapData.events.features.some(feature => feature.properties?.entityId === event?.id)).toBe(true);
  expect(state.boundaries.find(boundary => boundary.polityId === 'han_western')?.geometry).toMatchObject({type:'Point'});
  expect(year205?.territoryBoundary).toBeNull();
  expect(coverageDecisions.find(item => item.id === decision?.id)?.sourceBoundaryIds).toEqual([]);
  expect(getHistoricalState(-204).events.some(item => item.id === 'han-pengcheng-battle-205')).toBe(false);
});

test('Yang Wu 902-910 shows the Yangzhou political center without inferring territorial geometry', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-wu_ten-902-910');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-03',
    annualAudit: 'docs/audits/topics/yang-wu-formation-and-expansion-902-910.json',
    sourceBoundaryIds: [],
  });
  expect(yangWuFormationAnnualAudit.decisionIds).toEqual(['gap-wu_ten-902-910']);
  expect(yangWuFormationAnnualAudit.yearCount).toBe(9);
  expect(yangWuFormationAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 9}, (_, index) => 902 + index),
  );
  expect(yangWuFormationAnnualAudit.years.every(row => row.polityId === 'wu_ten' &&
    row.conclusion.length > 30 && row.sourceIds.length > 0 && row.territoryBoundary === null &&
    (row.mapExpression === 'capital-center-point' || ([905, 906].includes(row.year) && row.mapExpression === 'capital-and-event-points')) &&
    row.centerPlaceId === 'yangzhou' && row.evidenceGap.length > 20)).toBe(true);
  expect(yangWuFormationAnnualAudit.years.find(row => row.year === 905)?.conclusion).toContain('鄂州');
  expect(yangWuFormationAnnualAudit.years.find(row => row.year === 906)?.conclusion).toContain('洪州');
  expect(yangWuFormationAnnualAudit.years.find(row => row.year === 909)?.conclusion).toContain('虔');
  expect(yangWuFormationAnnualAudit.years.find(row => row.year === 906)?.mapExpression).toBe('capital-and-event-points');
  expect(yangWuFormationAnnualAudit.years.find(row => row.year === 905)).toMatchObject({
    mapExpression:'capital-and-event-points',
    sourceIds:expect.arrayContaining(['yang-wu-ezhou-modern-location']),
  });
  for (const year of yangWuFormationAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.polityId === 'wu_ten');
    expect(center, `杨吴${year}年广陵中心`).toMatchObject({
      geometry:{type:'Point',coordinates:[119.42,32.39]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(center!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[119.42,32.39]},
      properties:expect.objectContaining({polityId:'wu_ten',derivation:'control-centers'}),
    }));
  }
  const map905 = buildLocalMapData(getHistoricalState(905));
  expect(map905.events.features).toContainEqual(expect.objectContaining({
    geometry:expect.objectContaining({type:'Point',coordinates:[114.30,30.59]}),
    properties:expect.objectContaining({entityId:'yang-wu-captures-ezhou-905'}),
  }));
  expect(map905.events.features.some(feature => feature.properties?.entityId === 'yang-wu-captures-ezhou-905'
    && 'coordinates' in feature.geometry && feature.geometry.coordinates[0] === 114.88)).toBe(false);
  const map906 = buildLocalMapData(getHistoricalState(906));
  expect(map906.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[115.86,28.68]},
    properties:expect.objectContaining({entityId:'yang-wu-captures-hongzhou-906'}),
  }));
  expect(map906.boundaries.features.some(feature => feature.properties?.polityId === 'wu_ten'
    && feature.geometry.type.endsWith('Polygon'))).toBe(false);
});

test('all frozen short gaps have an individually reviewed non-automatic verdict', () => {
  expect(frozenShortGapBatch.count).toBe(65);
  const rationaleSet = new Set<string>();
  for (const gap of frozenShortGapBatch.rows) {
    const decision = coverageDecisions.find(item => decisionKey(item) ===
      gapKey(gap.polityId, gap.from, gap.to));
    expect(decision, gap.id).toBeDefined();
    expect(decision?.reviewStatus, gap.id).toBe('reviewed');
    expect(decision?.reviewedAt, gap.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(decision?.rationale.length, gap.id).toBeGreaterThan(30);
    expect(decision?.historicalTransitionCheck.length, gap.id).toBeGreaterThan(20);
    expect(decision?.citationIds.length, gap.id).toBeGreaterThan(0);
    rationaleSet.add(decision?.rationale ?? '');
  }
  expect(rationaleSet.size).toBe(frozenShortGapBatch.count);
});

test('the current continuation is the only reviewed short-gap geometry bridge', () => {
  const bridged = frozenShortGapBatch.rows.map(gap => coverageDecisions.find(item =>
    decisionKey(item) === gapKey(gap.polityId, gap.from, gap.to)))
    .filter(decision => decision?.verdict === 'nearest-same-polity');
  expect(bridged).toEqual([expect.objectContaining({
    id: 'gap-prc-2025-2026', sourceBoundaryIds: ['clio-13616-prc-2024'],
  })]);
});

test('all frozen medium gaps are reviewed without nearest-year bridging', () => {
  expect(frozenMediumGapBatch.count).toBe(18);
  for (const gap of frozenMediumGapBatch.rows) {
    const decision = coverageDecisions.find(item => decisionKey(item) ===
      gapKey(gap.polityId, gap.from, gap.to));
    expect(decision?.reviewStatus, gap.id).toBe('reviewed');
    expect(decision?.verdict, gap.id).not.toBe('nearest-same-polity');
    expect(decision?.historicalTransitionCheck.length, gap.id).toBeGreaterThan(30);
    expect(decision?.citationIds.length, gap.id).toBeGreaterThan(0);
  }
});

test('the Silla long-gap review records every year as explicitly unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-silla--57-377');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-03',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'silla-encykorea', 'silla-samguksagi-db', 'silla-periodization',
    'mcbride-korea-early-medieval-2020',
  ]));
  expect(decision?.rationale).toContain('逐年');
  expect(decision?.historicalTransitionCheck).toContain('434个有效民用年');
  expect(decision?.historicalTransitionCheck).toContain('不含公元0年');
});

test('the Turkic long-gap review records every year and publication restrictions', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-turkic-661-744');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-03',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'turkic-history-db', 'turkic-orkhon-heritage', 'turkic-orkhon-collection',
    'zizhi-tongjian-215-turkic-collapse-742-744',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the early Tibetan gap shows a regional core point without publishing an inferred border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-tibetan_empire-618-622');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-03',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'tibetan-empire-early-history-ucpress', 'tibetan-yarlung-polities-uva',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('tibetan-empire-early-formation-618-622.json');
  for (let year = 618; year <= 622; year++) {
    const state = getHistoricalState(year);
    const core = state.boundaries.find(boundary => boundary.polityId === 'tibetan_empire');
    expect(core, `missing Tibetan core reference in ${year}`).toMatchObject({
      geometry:{type:'Point'}, evidence:{evidenceLevel:'D',derivation:'control-centers'},
    });
    expect(isDefiniteBoundary(core!), `unexpected Tibetan border in ${year}`).toBe(false);
  }
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining([
    'tibetan-empire-early-history-ucpress', 'tibetan-yarlung-polities-uva',
  ]));
});

test('the early Nanzhao gap separates six-Zhao consolidation from an unsupported annual border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-nanzhao-738-740');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-03',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'nanzhao-formation-zizhi-214', 'nanzhao-taihe-site-whitrap', 'nanzhao-royal-titles-bryson-2015',
    'nanzhao-taihe-capital-period-reference',
  ]));
  expect(decision?.historicalTransitionCheck).toContain('nanzhao-early-territorial-gap-738-740.json');
  for (let year = 738; year <= 740; year++) {
    const state = getHistoricalState(year);
    const center = state.boundaries.find(boundary => boundary.polityId === 'nanzhao');
    if (year === 738) {
      expect(center, '迁都事件年保留事件点而不重复绘制边界点').toBeUndefined();
      expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
        geometry:{type:'Point',coordinates:[100.17,25.68]},
        properties:expect.objectContaining({entityId:'nanzhao-founded'}),
      }));
    } else {
      expect(center, `南诏${year}年太和城中心参照`).toMatchObject({
        geometry:{type:'Point',coordinates:[100.17,25.68]},
        evidence:{evidenceLevel:'D',derivation:'control-centers'},
      });
      expect(isDefiniteBoundary(center!)).toBe(false);
      expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
        geometry:{type:'Point',coordinates:[100.17,25.68]},
        properties:expect.objectContaining({polityId:'nanzhao',derivation:'control-centers'}),
      }));
    }
  }
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining([
    'nanzhao-formation-zizhi-214', 'nanzhao-taihe-site-whitrap', 'nanzhao-taihe-capital-period-reference',
  ]));
  expect(events.find(event => event.id === 'nanzhao-founded')).toMatchObject({
    placeId: 'taihe',
    coordinates: [100.17, 25.68],
    locationPrecision: 'approximate',
    sourceIds: expect.arrayContaining(['nanzhao-taihe-site-whitrap']),
  });
});

test('Eastern Zhou 770-751 records the Luoyi royal center annually without a royal-domain polygon', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-zhou_eastern--770--751');
  expect(decision).toMatchObject({
    verdict: 'control-centers',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'shiji-zhou-benji-eastward', 'eastern-zhou-luoyang-royal-center',
  ]));
  expect(sourceNotes.map(source => source.id)).toEqual(expect.arrayContaining([
    'shiji-zhou-benji-eastward', 'eastern-zhou-luoyang-royal-center',
  ]));
  expect(easternZhouAnnualAudit.yearCount).toBe(20);
  expect(easternZhouAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 20}, (_, index) => -770 + index),
  );
  for (let year = -770; year <= -751; year++) {
    const row = easternZhouAnnualAudit.years[year + 770];
    expect(row).toMatchObject({mapExpression: 'capital-center-point', royalDomainBoundary: null});
    expect(row.evidenceGap, `missing annual royal-domain gap in ${year}`).toBeTruthy();
    const state = getHistoricalState(year);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'zhou_eastern'),
      `unexpected Eastern Zhou domain geometry in ${year}`).toEqual([]);
    const mapData = buildLocalMapData(state);
    expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry: {type: 'Point', coordinates: [112.45, 34.62]},
      properties: expect.objectContaining({polityId: 'zhou_eastern', role: 'primary', status: 'formal'}),
    }));
  }
});

test('Eastern Zhou 256 records the royal-center reference without clipping Qin or conflating the later Eastern Zhou state', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-zhou_eastern--256--256');
  expect(decision).toMatchObject({
    verdict: 'control-centers',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'shiji-zhou-benji-final-256', 'zizhi-tongjian-vol5-256', 'zhou-termination-chronology-255-256',
  ]));
  expect(easternZhouEndAudit).toMatchObject({
    yearCount: 1,
    years: [expect.objectContaining({year: -256, royalDomainBoundary: null, mapExpression: 'capital-center-point'})],
  });
  expect(easternZhouEndAudit.years[0].evidenceGap).toBeTruthy();

  const state = getHistoricalState(-256);
  expect(state.boundaries.filter(boundary => boundary.polityId === 'zhou_eastern')).toEqual([]);
  const qin = state.boundaries.find(boundary => boundary.polityId === 'qin_state');
  expect(qin?.geometry.type).toBe('Polygon');
  expect(qin?.geometry).toEqual(getHistoricalState(-257).boundaries.find(boundary =>
    boundary.polityId === 'qin_state')?.geometry);
  expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [112.45, 34.62]},
    properties: expect.objectContaining({polityId: 'zhou_eastern', role: 'primary', status: 'formal'}),
  }));
});

test('early Qin leaves each 770-751 annual boundary unfilled and documents why granted land is not a control polygon', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-qin_state--770--751');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
  });
  expect(decision?.citationIds).toContain('qin-early-state-annals-and-local-archaeology');
  expect(sourceNotes.map(source => source.id)).toContain('qin-early-state-annals-and-local-archaeology');
  expect(qinEarlyAnnualAudit.yearCount).toBe(20);
  expect(qinEarlyAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 20}, (_, index) => -770 + index),
  );
  for (let year = -770; year <= -751; year++) {
    const row = qinEarlyAnnualAudit.years[year + 770];
    expect(row).toMatchObject({
      mapExpression: 'capital-center-point',
      centerPlaceId: year <= -763 ? 'xiquanquiu' : 'qianwei',
      boundaryGeometry: null,
    });
    expect(row.evidenceGap).toContain('封授');
    expect(getHistoricalState(year).boundaries.filter(boundary => boundary.polityId === 'qin_state'),
      `unexpected Qin territory geometry in ${year}`).toEqual([]);
  }
  expect(capitalHistory.filter(record => record.polityId === 'qin_state' && record.validFrom <= -751 && record.validTo >= -770))
    .toEqual(expect.arrayContaining([
      expect.objectContaining({placeId: 'xiquanquiu', validFrom: -770, validTo: -763}),
      expect.objectContaining({placeId: 'qianwei', validFrom: -762, validTo: -715}),
    ]));
  expect(capitalHistory.some(record => record.polityId === 'qin_state' && record.placeId === 'changan' && record.validFrom <= -770))
    .toBe(false);
  expect(buildLocalMapData(getHistoricalState(-770)).capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [105.18, 34.19]},
    properties: expect.objectContaining({polityId: 'qin_state', placeId: 'xiquanquiu'}),
  }));
  expect(buildLocalMapData(getHistoricalState(-762)).capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [107.25, 34.38]},
    properties: expect.objectContaining({polityId: 'qin_state', placeId: 'qianwei'}),
  }));
});

test('Gengshi annual centers render as city points while its unstable reach stays without a boundary', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-gengshi-23-25');
  expect(decision).toMatchObject({verdict: 'control-centers', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(decision?.citationIds).toContain('gengshi-capital-chronology-tongjian');
  expect(sourceNotes.map(source => source.id)).toContain('gengshi-capital-chronology-tongjian');
  expect(gengshiAnnualAudit.yearCount).toBe(3);
  expect(gengshiAnnualAudit.years.map(row => row.year)).toEqual([23, 24, 25]);
  const xinTransitionBoundary = boundaryCatalog.find(boundary => boundary.id === 'clio-1136-xin-23');
  expect(xinTransitionBoundary).toMatchObject({polityId:'xin',validFrom:23,validTo:23,sourceFrom:23,sourceTo:29});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:xin-gengshi-transition:23',
    boundaryId:'clio-1136-xin-23',
    polityIds:['xin','gengshi'],
    years:[23],
    status:'requires-review',
  }));
  expect(getHistoricalState(23).boundaries.some(boundary => boundary.id === 'clio-1136-xin-23')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(23)).boundaries.features.some(feature => (
    feature.id === 'clio-1136-xin-23'
  ))).toBe(false);
  const expected = [
    {year: 23, placeId: 'wan_nanyang', coordinates: [112.53, 32.99]},
    {year: 24, placeId: 'luoyang', coordinates: [112.45, 34.62]},
    {year: 25, placeId: 'changan', coordinates: [108.94, 34.34]},
  ];
  for (const item of expected) {
    expect(gengshiAnnualAudit.years.find(row => row.year === item.year)).toMatchObject({
      mapExpression: 'capital-center-point', capitalPlaceId: item.placeId, boundaryGeometry: null,
    });
    expect(gengshiAnnualAudit.years.find(row => row.year === item.year)?.evidenceGap,
      `missing annual control-boundary gap in ${item.year}`).toBeTruthy();
    const state = getHistoricalState(item.year);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'gengshi').filter(isDefiniteBoundary),
      `unexpected definite Gengshi boundary in ${item.year}`).toEqual([]);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry: {type: 'Point', coordinates: item.coordinates},
      properties: expect.objectContaining({polityId: 'gengshi', role: 'primary'}),
    }));
  }
});

test('holds the Xin interval outline in 9 while preserving its original interval from 10 onward', () => {
  const xinBoundary = boundaryCatalog.find(boundary => boundary.id === 'clio-1120-xin-9');
  expect(xinBoundary).toMatchObject({polityId: 'xin', validFrom: 9, validTo: 13, confidence: 'low'});
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId: 'conflict:xin-han-transition:9',
    boundaryId: 'clio-1120-xin-9',
    polityIds: ['xin', 'han_western'],
    years: [9],
    status: 'requires-review',
  }));
  const yearNine = getHistoricalState(9);
  const yearTen = getHistoricalState(10);
  expect(yearNine.boundaries.some(boundary => boundary.id === 'clio-1120-xin-9')).toBe(false);
  expect(buildLocalMapData(yearNine).boundaries.features.some(feature => feature.id === 'clio-1120-xin-9')).toBe(false);
  expect(yearTen.boundaries.some(boundary => boundary.id === 'clio-1120-xin-9')).toBe(true);
  expect(buildLocalMapData(yearTen).boundaries.features.some(feature => feature.id === 'clio-1120-xin-9')).toBe(true);
});

test('Gengshi year 25 links the primary chronicle for the annual handover', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-gengshi-23-25');
  const year25 = gengshiAnnualAudit.years.find(row => row.year === 25);

  expect(decision?.citationIds).toContain('zizhi-tongjian-vol40-gengshi-25');
  expect(year25?.sourceIds).toContain('zizhi-tongjian-vol40-gengshi-25');
  expect(sourceNotes.find(source => source.id === 'zizhi-tongjian-vol40-gengshi-25')).toMatchObject({
    urlOrCitation: 'https://zh.wikisource.org/zh-hans/資治通鑑/卷040',
    scope: expect.stringContaining('刘秀六月即位'),
    note: expect.stringContaining('全年稳定疆界'),
  });
});

test('Liu Song administrative geography research does not turn late-dynasty records into 420-425 borders', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-song_southern-420-425');
  expect(decision?.citationIds).toContain('liu-song-administrative-evolution-yao-2025');
  expect(liuSongEarlyAnnualAudit.sourceNotes.map(source => source.id))
    .toContain('liu-song-administrative-evolution-yao-2025');
  expect(liuSongEarlyAnnualAudit.years).toHaveLength(6);
  expect(liuSongEarlyAnnualAudit.years.every(row => row.territoryBoundary === null)).toBe(true);
  expect(liuSongEarlyAnnualAudit.reviewLimitations.join(' ')).toMatch(/大明八年|420—425/);
});

test('Wu Zhou 705 records the part-year restoration and renders Luoyang without a year-wide border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-wu_zhou-705-705');
  expect(decision).toMatchObject({verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(decision?.citationIds).toContain('wu-zhou-termination-tongjian-207-208');
  expect(sourceNotes.map(source => source.id)).toContain('wu-zhou-termination-tongjian-207-208');
  expect(wuZhouEndAnnualAudit).toMatchObject({
    yearCount: 1,
    years: [expect.objectContaining({
      year: 705,
      mapExpression: 'luoyang-city-reference-during-part-year-transition',
      wuzhouBoundaryGeometry: null,
    })],
  });
  const state = getHistoricalState(705);
  expect(state.boundaries.filter(boundary => boundary.polityId === 'wu_zhou').filter(isDefiniteBoundary)).toEqual([]);
  const tangTransitionBoundary = boundaryCatalog.find(boundary => boundary.id === 'clio-2642-tang-705');
  expect(tangTransitionBoundary).toMatchObject({
    polityId:'tang',validFrom:705,validTo:749,sourceFrom:705,sourceTo:749,confidence:'low',controlType:'unspecified',
  });
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId:'conflict:wu-zhou-tang-transition:705',
    boundaryId:'clio-2642-tang-705',
    polityIds:['wu_zhou','tang'],
    years:[705],
    status:'requires-review',
  }));
  expect(state.boundaries.some(boundary => boundary.id === 'clio-2642-tang-705')).toBe(false);
  expect(buildLocalMapData(state).boundaries.features.some(feature => feature.id === 'clio-2642-tang-705')).toBe(false);
  expect(getHistoricalState(706).boundaries.some(boundary => boundary.id === 'clio-2642-tang-705')).toBe(true);
  expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [112.45, 34.62]},
    properties: expect.objectContaining({polityId: 'wu_zhou', role: 'primary', status: 'formal'}),
  }));
});

test('Former Liang 314-323 renders Guzang each year while tracking political changes without a boundary', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-former_liang-314-323');
  const laterFormerLiangSource = boundaryCatalog.find(item => item.id === 'clio-1445-former_liang-324');
  expect(decision).toMatchObject({verdict: 'control-centers', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(decision?.citationIds).toContain('former-liang-early-years-jinshu-tongjian');
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'zizhi-tongjian-former-liang-323-frontier-campaign', 'gansu-tianshui-jicheng-longcheng-geography',
  ]));
  expect(sourceNotes.map(source => source.id)).toContain('former-liang-early-years-jinshu-tongjian');
  expect(formerLiangAnnualAudit.yearCount).toBe(10);
  expect(formerLiangAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 10}, (_, index) => 314 + index),
  );
  expect(formerLiangAnnualAudit.years.find(row => row.year === 322)?.conclusion).toContain('取得陇西、南安');
  expect(formerLiangAnnualAudit.sourceNotes.find(source => source.id === 'gansu-tianshui-jicheng-longcheng-geography')?.use)
    .toMatch(/韩瑶.*韩璞/);
  expect(formerLiangAnnualAudit.years.find(row => row.year === 323)?.conclusion).toContain('称藩');
  const year323Audit = formerLiangAnnualAudit.years.find(row => row.year === 323);
  expect(year323Audit?.mapExpression).toBe('capital-center-and-frontier-campaign-event-points');
  expect(year323Audit?.sourceIds).toEqual(expect.arrayContaining([
    'zizhi-tongjian-former-liang-323-frontier-campaign', 'gansu-tianshui-jicheng-longcheng-geography',
  ]));
  expect(laterFormerLiangSource).toMatchObject({
    polityId:'former_liang', validFrom:324, validTo:372, snapshotYear:324,
    sourceFrom:324, sourceTo:372, sourceRecord:1445, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.rationale).toContain('clio-1445-former_liang-324');
  for (let year = 314; year <= 323; year++) {
    const row = formerLiangAnnualAudit.years[year - 314];
    expect(row).toMatchObject({
      mapExpression: year === 322 ? 'capital-center-and-qinzhou-establishment-event-point' :
        year === 323 ? 'capital-center-and-frontier-campaign-event-points' : 'capital-center-point',
      capitalPlaceId: 'guzang', territoryBoundary: null,
    });
    const state = getHistoricalState(year);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'former_liang').filter(isDefiniteBoundary),
      `unexpected definite Former Liang boundary in ${year}`).toEqual([]);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry: {type: 'Point', coordinates: [102.64, 37.93]},
      properties: expect.objectContaining({polityId: 'former_liang', role: 'primary'}),
    }));
    expect(state.boundaries.some(boundary => boundary.id === 'clio-1445-former_liang-324')).toBe(false);
    expect(buildLocalMapData(state).boundaries.features.some(feature => feature.id === 'clio-1445-former_liang-324')).toBe(false);
    if (year >= 319) {
      expect(state.activePolities.some(polity => polity.id === 'later_zhao')).toBe(true);
      expect(state.boundaries.some(boundary => boundary.polityId === 'later_zhao' && boundary.geometry.type === 'Point')).toBe(true);
    }
    if (year === 323) {
      const eventFeatures = buildLocalMapData(state).events.features;
      expect(eventFeatures).toContainEqual(expect.objectContaining({
        geometry: {type: 'Point', coordinates: [105.9806, 34.99874]},
        properties: expect.objectContaining({entityId: 'former-zhao-siege-longcheng-323'}),
      }));
      expect(eventFeatures).toContainEqual(expect.objectContaining({
        geometry: {type: 'Point', coordinates: [105.340789, 34.745447]},
        properties: expect.objectContaining({entityId: 'former-zhao-attack-jicheng-323'}),
      }));
    }
    if (year === 322) {
      expect(state.places.some(place => place.id === 'jicheng-gangu-frontier')).toBe(true);
      expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
        geometry: {type: 'Point', coordinates: [105.340789, 34.745447]},
        properties: expect.objectContaining({entityId: 'former-liang-establishes-qinzhou-jicheng-322'}),
      }));
    }
  }
  const year324Shape = getHistoricalState(324).boundaries.find(boundary => boundary.id === 'clio-1445-former_liang-324');
  expect(year324Shape?.geometry).toEqual(laterFormerLiangSource?.geometry);
});

test('Later Zhao 326 renders Ye as a military and palace event while Xiangguo remains the sole capital center', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_zhao-319-336');
  const state = getHistoricalState(326);
  const mapData = buildLocalMapData(state);
  expect(decision?.citationIds).toContain('later-zhao-326-ye-palace-primary');
  expect(sourceNotes.map(source => source.id)).toContain('later-zhao-326-ye-palace-primary');
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [114.37, 36.33]},
    properties: expect.objectContaining({entityId: 'later-zhao-ye-palace-and-garrison-326'}),
  }));
  expect(mapData.capitalPlaces.features.some(feature => feature.properties?.placeId === 'ye')).toBe(false);
  expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
    properties: expect.objectContaining({polityId: 'later_zhao', placeId: 'xiangguo'}),
  }));
  expect(state.boundaries.filter(boundary => boundary.polityId === 'later_zhao')
    .filter(isDefiniteBoundary)).toEqual([]);
});

test('Western Qin 385-386 maps the documented Yongshi center instead of the later Jincheng phase', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-western_qin-385-386');
  const laterWesternQinSource = boundaryCatalog.find(item => item.id === 'clio-1542-western_qin-387');
  const earlyCapital = capitalHistory.find(record => record.polityId === 'western_qin' && record.validFrom === 385);
  expect(decision).toMatchObject({verdict: 'control-centers', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(decision?.citationIds).toContain('western-qin-early-center-jinshu-106');
  expect(sourceNotes.map(source => source.id)).toContain('western-qin-early-center-jinshu-106');
  expect(laterWesternQinSource).toMatchObject({validFrom:387,validTo:393,snapshotYear:387,sourceRecord:1542,confidence:'low',controlType:'unspecified'});
  expect(decision?.rationale).toContain('clio-1542-western_qin-387');
  expect(decision?.citationIds).toContain('cliopatria');
  expect(westernQinEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(westernQinEarlyAnnualAudit).toMatchObject({
    decisionId: 'gap-western_qin-385-386',
    yearCount: 2,
    years: [
      expect.objectContaining({year: 385, mapExpression: 'regional-capital-point-part-year', territoryBoundary: null}),
      expect.objectContaining({year: 386, mapExpression: 'regional-capital-point', territoryBoundary: null}),
    ],
  });
  expect(earlyCapital).toMatchObject({placeId: 'yongshi_western_qin', validFrom: 385, validTo: 387});
  expect(places.find(place => place.id === 'yongshi_western_qin')).toMatchObject({
    mappingStatus: 'regional',
    confidence: 'low',
  });
  for (const year of [385, 386]) {
    const center = buildLocalMapData(getHistoricalState(year)).capitalPlaces.features.find(feature =>
      feature.properties?.polityId === 'western_qin');
    expect(center?.geometry).toEqual({type: 'Point', coordinates: [104.17173, 35.94267]});
    if (year === 385) expect(center?.properties?.note).toContain('九月');
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === 'clio-1542-western_qin-387')).toBe(false);
  }
  expect(getHistoricalState(387).boundaries.find(boundary => boundary.id === 'clio-1542-western_qin-387')?.geometry)
    .toEqual(laterWesternQinSource?.geometry);
});

test('Western Qin restoration in 409 records the changing political center without inventing a mapped site or border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-western_qin-409-409');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: [],
    citationIds: expect.arrayContaining(['western-qin-restoration-jinshu-125']),
  });
  expect(decision?.rationale).toContain('度坚山');
  expect(westernQinRestorationAnnualAudit).toMatchObject({
    decisionId: 'gap-western_qin-409-409', yearCount: 1,
    years: [expect.objectContaining({
      year: 409, territoryBoundary: null, mapExpression: 'leave-unfilled',
      sourceIds: expect.arrayContaining(['western-qin-restoration-jinshu-125']),
    })],
  });
  expect(westernQinRestorationAnnualAudit.years[0].conclusion).toContain('七月复即秦王位');
  const state = getHistoricalState(409);
  expect(state.boundaries.filter(boundary => boundary.polityId === 'western_qin')).toHaveLength(0);
  expect(buildLocalMapData(state).boundaries.features.filter(feature =>
    feature.properties?.polityId === 'western_qin')).toHaveLength(0);
  expect(buildLocalMapData(state).capitalPlaces.features.filter(feature =>
    feature.properties?.polityId === 'western_qin')).toHaveLength(0);
});

test('Later Liang in 386 displays Guzang as a city center without borrowing a later territorial outline', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_liang-386-386');
  const laterLiangSource = boundaryCatalog.find(item => item.id === 'clio-1552-later_liang-387');
  expect(decision).toMatchObject({verdict: 'control-centers', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(decision?.citationIds).toContain('later-liang-founding-386-primary');
  expect(laterLiangSource).toMatchObject({validFrom:387,validTo:396,snapshotYear:387,sourceRecord:1552,confidence:'low',controlType:'unspecified'});
  expect(decision?.rationale).toContain('clio-1552-later_liang-387');
  expect(decision?.citationIds).toContain('cliopatria');
  expect(laterLiangFoundingAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(getHistoricalState(386).boundaries.some(boundary => boundary.id === 'clio-1552-later_liang-387')).toBe(false);
  expect(buildLocalMapData(getHistoricalState(386)).boundaries.features.some(feature => feature.id === 'clio-1552-later_liang-387')).toBe(false);
  expect(getHistoricalState(387).boundaries.find(boundary => boundary.id === 'clio-1552-later_liang-387')?.geometry)
    .toEqual(laterLiangSource?.geometry);
  expect(laterLiangFoundingAnnualAudit).toMatchObject({
    decisionId: 'gap-later_liang-386-386', yearCount: 1,
    years: [expect.objectContaining({year: 386, capitalPlaceId: 'guzang', territoryBoundary: null})],
  });
  expect(laterLiangFoundingAnnualAudit.years[0].conclusion).toMatch(/姑臧.*酒泉公|酒泉公.*姑臧/);
  expect(laterLiangFoundingAnnualAudit.years[0].conclusion).toContain('张大豫');
  expect(laterLiangFoundingAnnualAudit.sourceNotes.find(source => source.id === 'later-liang-founding-386-primary')?.use)
    .toMatch(/入姑臧.*385）秋段.*386年条/);
  const state = getHistoricalState(386);
  expect(state.boundaries.filter(boundary => boundary.polityId === 'later_liang').filter(isDefiniteBoundary)).toEqual([]);
  expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [102.64, 37.93]},
    properties: expect.objectContaining({polityId: 'later_liang'}),
  }));
});

test('Southern Liang in 414 shows the part-year Ledu center alongside Western Qin without territory overlap', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-southern_liang-414-414');
  expect(decision).toMatchObject({verdict: 'control-centers', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(decision?.citationIds).toContain('southern-liang-termination-414-primary');
  expect(southernLiangEndAnnualAudit).toMatchObject({
    decisionId: 'gap-southern_liang-414-414', yearCount: 1,
    years: [expect.objectContaining({
      year: 414, mapExpression: 'capital-center-point-part-year',
      capitalPlaceId: 'ledu', territoryBoundary: null,
    })],
  });
  const state = getHistoricalState(414);
  const mapData = buildLocalMapData(state);
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [102.4, 36.48]},
    properties: expect.objectContaining({entityId: 'southern-liang-ended-414'}),
  }));
  for (const polityId of ['southern_liang', 'western_qin']) {
    expect(state.boundaries.filter(boundary => boundary.polityId === polityId).filter(isDefiniteBoundary), polityId).toEqual([]);
  }
  const centers = buildLocalMapData(state).capitalPlaces.features;
  expect(boundaryGeometryConflicts).toContainEqual(expect.objectContaining({
    conflictId: 'conflict:western-qin-southern-liang:414',
    boundaryId: 'clio-1684-western_qin-414',
    years: [414], status: 'requires-review', reviewedBy: [],
  }));
  expect(state.boundaries.some(boundary => boundary.id === 'clio-1684-western_qin-414')).toBe(false);
  const heldSourceGeometry = boundaryCatalog.find(boundary => boundary.id === 'clio-1684-western_qin-414');
  expect(heldSourceGeometry).toMatchObject({validFrom: 414, validTo: 416, sourceFrom: 414, sourceTo: 416});
  expect(getHistoricalState(415).boundaries).toContainEqual(expect.objectContaining({id: 'clio-1684-western_qin-414'}));
  expect(centers).toContainEqual(expect.objectContaining({
    geometry: {type: 'Point', coordinates: [102.4, 36.48]},
    properties: expect.objectContaining({polityId: 'southern_liang'}),
  }));
  expect(centers).toContainEqual(expect.objectContaining({
    properties: expect.objectContaining({polityId: 'western_qin', placeId: 'fuhan'}),
  }));
});

test('Later Qin termination in 417 keeps Chang’an as a transition point and leaves borders unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_qin-417-417');
  const state = getHistoricalState(417);
  const mapData = buildLocalMapData(state);
  expect(decision).toMatchObject({verdict:'leave-unfilled',reviewStatus:'reviewed',sourceBoundaryIds:[]});
  expect(laterQinTerminationAnnualAudit).toMatchObject({
    decisionId:'gap-later_qin-417-417',yearCount:1,
    years:[expect.objectContaining({year:417,mapExpression:'transition-center-point',centerPlaceId:'changan',territoryBoundary:null})],
  });
  expect(state.boundaries.filter(boundary => boundary.polityId === 'later_qin'
    && isDefiniteBoundary(boundary))).toEqual([]);
  expect(mapData.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[108.94,34.34]},
    properties:expect.objectContaining({polityId:'later_qin',placeId:'changan'}),
  }));
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[108.94,34.34]},
    properties:expect.objectContaining({entityId:'later-qin-falls-changan'}),
  }));
});

test('the Western Zhou long-gap review separates direct control from feudal influence', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-zhou_western--1046--1001');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-03',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'western-zhou-national-museum', 'western-zhou-epic', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Yuan long-gap review separates nominal extent from direct control', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-yuan-1271-1293');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-02',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'yuan-nationalities-history', 'yuan-li-bingzhong', 'yuan-goryeo-records', 'yuanshi-shizu-1271-1293', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Northern Yuan long-gap review separates Mongol factions from direct control', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-northern_yuan-1440-1467');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-02',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'northern-yuan-early-ming', 'northern-yuan-yesen', 'ming-shilu-yingzong-1440-1467', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Southern Tang long-gap review separates nominal submission from direct control', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-southern_tang-937-959');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-11-04',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'southern-tang-nanjing', 'southern-tang-periods', 'southern-tang-local-administration', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('Southern Tang 937-959 shows annual city references without inferring territory polygons', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-southern_tang-937-959');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-04',
    annualAudit: 'docs/audits/topics/southern-tang-formation-and-contraction-937-959.json',
    sourceBoundaryIds: [],
  });
  expect(southernTangAnnualAudit.decisionIds).toEqual(['gap-southern_tang-937-959']);
  expect(southernTangAnnualAudit.yearCount).toBe(23);
  expect(southernTangAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 23}, (_, index) => 937 + index),
  );
  expect(southernTangAnnualAudit.years.every(row => row.polityId === 'southern_tang' &&
    row.conclusion.length > 30 && row.sourceIds.length > 0 && row.territoryBoundary === null &&
    (row.mapExpression === 'capital-center-point' || ([945, 946, 951].includes(row.year) && row.mapExpression === 'capital-and-event-points')) &&
    row.centerPlaceId === 'jiankang' && row.evidenceGap.length > 20)).toBe(true);
  const knownSourceIds = new Set(sourceNotes.map(source => source.id));
  expect(decision?.citationIds).toContain('zizhi-tongjian-southern-tang-937-959');
  expect(southernTangAnnualAudit.years.every(row => row.sourceIds.every(sourceId => knownSourceIds.has(sourceId)))).toBe(true);
  expect(southernTangAnnualAudit.years.find(row => row.year === 939)?.conclusion).toContain('改国号');
  expect(southernTangAnnualAudit.years.find(row => row.year === 945)?.conclusion).toContain('闽');
  expect(southernTangAnnualAudit.years.find(row => row.year === 951)?.conclusion).toContain('楚');
  expect(southernTangAnnualAudit.years.find(row => row.year === 958)?.conclusion).toContain('十四州');
  for (const year of southernTangAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    const capital = state.boundaries.find(boundary => boundary.polityId === 'southern_tang');
    expect(capital, `南唐${year}年金陵中心`).toMatchObject({
      geometry:{type:'Point',coordinates:[118.8,32.06]},
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked'},
    });
    expect(isDefiniteBoundary(capital!)).toBe(false);
    expect(buildLocalMapData(state).boundaries.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[118.8,32.06]},
      properties:expect.objectContaining({polityId:'southern_tang',derivation:'control-centers'}),
    }));
  }
  for (const [year, eventId, coordinates] of [
    [945, 'min-ended-945', [118.32378, 27.03886]],
    [946, 'southern-tang-assaults-fuzhou-946', [119.30, 26.08]],
    [951, 'ma-chu-ended-951', [112.94, 28.23]],
  ] as const) {
    const mapData = buildLocalMapData(getHistoricalState(year));
    expect(mapData.events.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates},
      properties:expect.objectContaining({entityId:eventId}),
    }));
    expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'southern_tang'
      && feature.geometry.type.endsWith('Polygon'))).toBe(false);
  }
});

test('Southern Tang 937-959 does not borrow the separate Cliopatria shape whose source interval begins in 960', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-southern_tang-937-959');
  const laterSouthernTangSource = boundaryCatalog.find(item => item.id === 'clio-3842-southern_tang-960');

  expect(laterSouthernTangSource).toMatchObject({
    polityId:'southern_tang', validFrom:960, validTo:969, sourceFrom:960, sourceTo:969,
    snapshotYear:960, sourceRecord:3842, controlType:'unspecified', confidence:'low',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.sourceBoundaryIds).toEqual([]);
  expect(decision?.rationale).toContain('clio-3842-southern_tang-960');
  expect(southernTangAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));

  for (let year = 937; year <= 959; year++) {
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === 'clio-3842-southern_tang-960'),
      `南唐 ${year} must not inherit the 960–969 source interval`).toBe(false);
  }
  const year960Shape = getHistoricalState(960).boundaries.find(boundary => boundary.id === 'clio-3842-southern_tang-960');
  expect(year960Shape?.geometry).toEqual(laterSouthernTangSource?.geometry);
});

test('Wuyue 907-910 records recognition, conflict and Huzhou control changes without turning them into border polygons', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-wuyue-907-910');
  const laterWuyueSource = boundaryCatalog.find(item => item.id === 'clio-3631-wuyue-911');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-04',
    annualAudit: 'docs/audits/topics/wuyue-formation-and-contested-huzhou-907-910.json',
    sourceBoundaryIds: [],
  });
  expect(wuyueEarlyAnnualAudit.decisionIds).toEqual(['gap-wuyue-907-910']);
  expect(wuyueEarlyAnnualAudit.yearCount).toBe(4);
  expect(wuyueEarlyAnnualAudit.years.map(row => row.year)).toEqual([907, 908, 909, 910]);
  expect(wuyueEarlyAnnualAudit.years.every(row => row.polityId === 'wuyue' &&
    row.conclusion.length > 30 && row.sourceIds.length > 0 && row.territoryBoundary === null &&
    (row.mapExpression === 'hangzhou-capital-point-no-boundary' ||
      ([909, 910].includes(row.year) && row.mapExpression === 'capital-and-event-points')) && row.capitalPlaceId === 'hangzhou' &&
    row.evidenceGap.length > 20)).toBe(true);
  const knownSourceIds = new Set(sourceNotes.map(source => source.id));
  expect(decision?.citationIds).toContain('zizhi-tongjian-wuyue-907-910');
  expect(decision?.citationIds).toContain('suzhou-city-history-official');
  expect(wuyueEarlyAnnualAudit.years.every(row => row.sourceIds.every(sourceId => knownSourceIds.has(sourceId)))).toBe(true);
  expect(wuyueEarlyAnnualAudit.years.find(row => row.year === 907)?.conclusion).toContain('吴越王');
  expect(wuyueEarlyAnnualAudit.years.find(row => row.year === 908)?.conclusion).toContain('东洲');
  expect(wuyueEarlyAnnualAudit.years.find(row => row.year === 909)?.conclusion).toContain('湖州');
  expect(wuyueEarlyAnnualAudit.years.find(row => row.year === 910)?.conclusion).toContain('钱镖');
  expect(laterWuyueSource).toMatchObject({
    polityId:'wuyue', validFrom:911, validTo:946, snapshotYear:911,
    sourceFrom:911, sourceTo:946, sourceRecord:3631, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.rationale).toContain('clio-3631-wuyue-911');
  for (const year of wuyueEarlyAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3631-wuyue-911'),
      `吴越 ${year} 不得回填 911—946 年来源面`).toBe(false);
    expect(state.boundaries.some(boundary => boundary.polityId === 'wuyue' &&
      (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon'))).toBe(false);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry: {type:'Point',coordinates:[120.16,30.25]},
      properties: expect.objectContaining({polityId:'wuyue',placeId:'hangzhou',role:'primary'}),
    }));
  }
  const year909Map = buildLocalMapData(getHistoricalState(909));
  expect(year909Map.events.features).toContainEqual(expect.objectContaining({
    geometry:{type:'Point',coordinates:[120.58,31.30]},
    properties:expect.objectContaining({entityId:'wuyue-relieves-suzhou-909'}),
  }));
  expect(year909Map.boundaries.features.some(feature => feature.properties?.polityId === 'wuyue'
    && feature.geometry.type.endsWith('Polygon'))).toBe(false);
  const year911Shape = getHistoricalState(911).boundaries.find(boundary => boundary.id === 'clio-3631-wuyue-911');
  expect(year911Shape?.geometry).toEqual(laterWuyueSource?.geometry);
});

test('Min 909-910 records its five-prefecture historical region while keeping only a Fuzhou center point', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-min-909-910');
  const laterMinSource = boundaryCatalog.find(item => item.id === 'clio-3596-min-911');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-03',
    annualAudit: 'docs/audits/topics/min-founding-and-fujian-region-909-910.json',
    sourceBoundaryIds: [],
  });
  expect(minEarlyAnnualAudit.decisionIds).toEqual(['gap-min-909-910']);
  expect(minEarlyAnnualAudit.yearCount).toBe(2);
  expect(minEarlyAnnualAudit.years.map(row => row.year)).toEqual([909, 910]);
  expect(minEarlyAnnualAudit.years.every(row => row.polityId === 'min' && row.capitalPlaceId === 'fuzhou' &&
    row.regionalExtent.includes('福、泉、建、漳、汀') && row.territoryBoundary === null &&
    row.mapExpression === 'fuzhou-capital-point-and-regional-extent-note' && row.sourceIds.length > 0 &&
    row.evidenceGap.length > 20)).toBe(true);
  const knownSourceIds = new Set(sourceNotes.map(source => source.id));
  expect(minEarlyAnnualAudit.years.every(row => row.sourceIds.every(sourceId => knownSourceIds.has(sourceId)))).toBe(true);
  expect(decision?.citationIds).toContain('chgis-min-regime-909-943');
  expect(laterMinSource).toMatchObject({
    polityId:'min', validFrom:911, validTo:935, snapshotYear:911,
    sourceFrom:911, sourceTo:935, sourceRecord:3596, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.rationale).toContain('clio-3596-min-911');
  expect(minEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  for (const year of minEarlyAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3596-min-911'),
      `闽 ${year} 不得回填 911—935 年来源面`).toBe(false);
    expect(state.boundaries.some(boundary => boundary.polityId === 'min' &&
      (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon'))).toBe(false);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[119.30,26.08]},
      properties:expect.objectContaining({polityId:'min',placeId:'fuzhou',role:'primary'}),
    }));
  }
  const year911Shape = getHistoricalState(911).boundaries.find(boundary => boundary.id === 'clio-3596-min-911');
  expect(year911Shape?.geometry).toEqual(laterMinSource?.geometry);
});

test('Ma Chu 907-910 distinguishes the six prefectures taken south from the 910 defeat at Jingnan', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-chu_ten-907-910');
  const laterMaChuSource = boundaryCatalog.find(item => item.id === 'clio-3641-chu_ten-911');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-03',
    annualAudit: 'docs/audits/topics/ma-chu-regional-expansion-907-910.json',
    sourceBoundaryIds: [],
  });
  expect(maChuEarlyAnnualAudit.decisionIds).toEqual(['gap-chu_ten-907-910']);
  expect(maChuEarlyAnnualAudit.yearCount).toBe(4);
  expect(maChuEarlyAnnualAudit.years.map(row => row.year)).toEqual([907, 908, 909, 910]);
  expect(maChuEarlyAnnualAudit.years.every(row => row.polityId === 'chu_ten' &&
    row.capitalPlaceId === 'changsha' && row.regionalExtent.length > 20 &&
    row.territoryBoundary === null && (row.year === 910
      ? row.mapExpression === 'changsha-capital-point-and-youkou-event-point'
      : row.mapExpression === 'changsha-capital-point-and-regional-event-note') &&
    row.sourceIds.length > 0 && row.evidenceGap.length > 20)).toBe(true);
  const knownSourceIds = new Set(sourceNotes.map(source => source.id));
  expect(decision?.citationIds).toContain('zizhi-tongjian-chu-907-910');
  expect(maChuEarlyAnnualAudit.years.every(row => row.sourceIds.every(sourceId => knownSourceIds.has(sourceId)))).toBe(true);
  expect(maChuEarlyAnnualAudit.years.find(row => row.year === 907)?.conclusion).toContain('楚王');
  expect(maChuEarlyAnnualAudit.years.find(row => row.year === 908)?.conclusion).toContain('六州');
  expect(maChuEarlyAnnualAudit.years.find(row => row.year === 910)?.conclusion).toContain('油口');
  expect(maChuEarlyAnnualAudit.years.find(row => row.year === 910)?.mapExpression).toBe('changsha-capital-point-and-youkou-event-point');
  expect(laterMaChuSource).toMatchObject({
    polityId:'chu_ten', validFrom:911, validTo:925, snapshotYear:911,
    sourceFrom:911, sourceTo:925, sourceRecord:3641, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.rationale).toContain('clio-3641-chu_ten-911');
  expect(maChuEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  for (const year of maChuEarlyAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3641-chu_ten-911'),
      `马楚 ${year} 不得回填 911—925 年来源面`).toBe(false);
    expect(state.boundaries.some(boundary => boundary.polityId === 'chu_ten' &&
      (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon'))).toBe(false);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[112.94,28.23]},
      properties:expect.objectContaining({polityId:'chu_ten',placeId:'changsha',role:'primary'}),
    }));
    if (year === 910) expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[112.20,30.08]},
      properties:expect.objectContaining({entityId:'ma-chu-defeated-at-youkou-910'}),
    }));
  }
  const year911Shape = getHistoricalState(911).boundaries.find(boundary => boundary.id === 'clio-3641-chu_ten-911');
  expect(year911Shape?.geometry).toEqual(laterMaChuSource?.geometry);
});

test('Former Shu 907-910 has annual evidence and does not project its later extent backward', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-former_shu-907-910');
  const laterFormerShuSource = boundaryCatalog.find(item => item.id === 'clio-3618-former_shu-911');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-03',
    annualAudit: 'docs/audits/topics/former-shu-early-extent-907-910.json',
    sourceBoundaryIds: [],
  });
  expect(formerShuEarlyAnnualAudit.decisionIds).toEqual(['gap-former_shu-907-910']);
  expect(formerShuEarlyAnnualAudit.yearCount).toBe(4);
  expect(formerShuEarlyAnnualAudit.years.map(row => row.year)).toEqual([907, 908, 909, 910]);
  expect(formerShuEarlyAnnualAudit.years.every(row => row.polityId === 'former_shu' &&
    row.capitalPlaceId === 'chengdu' && row.regionalExtent.length > 20 && row.territoryBoundary === null &&
    row.mapExpression === 'chengdu-capital-point-and-regional-event-note' && row.sourceIds.length > 0 &&
    row.evidenceGap.length > 20)).toBe(true);
  const knownSourceIds = new Set(sourceNotes.map(source => source.id));
  expect(decision?.citationIds).toContain('zizhi-tongjian-former-shu-907-910');
  expect(formerShuEarlyAnnualAudit.years.every(row => row.sourceIds.every(sourceId => knownSourceIds.has(sourceId)))).toBe(true);
  expect(formerShuEarlyAnnualAudit.years.find(row => row.year === 907)?.conclusion).toContain('即皇帝位');
  expect(formerShuEarlyAnnualAudit.years.find(row => row.year === 908)?.conclusion).toContain('武成');
  expect(formerShuEarlyAnnualAudit.years.find(row => row.year === 909)?.conclusion).toContain('判六军');
  expect(formerShuEarlyAnnualAudit.years.find(row => row.year === 910)?.conclusion).toContain('巴、剑二州');
  expect(laterFormerShuSource).toMatchObject({
    polityId:'former_shu', validFrom:911, validTo:921, snapshotYear:911,
    sourceFrom:911, sourceTo:921, sourceRecord:3618, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.rationale).toContain('clio-3618-former_shu-911');
  expect(formerShuEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  for (const year of formerShuEarlyAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3618-former_shu-911'),
      `前蜀 ${year} 不得回填 911—921 年来源面`).toBe(false);
    expect(state.boundaries.some(boundary => boundary.polityId === 'former_shu' &&
      (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon'))).toBe(false);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[104.07,30.67]},
      properties:expect.objectContaining({polityId:'former_shu',placeId:'chengdu',role:'primary'}),
    }));
  }
  const year911Shape = getHistoricalState(911).boundaries.find(boundary => boundary.id === 'clio-3618-former_shu-911');
  expect(year911Shape?.geometry).toEqual(laterFormerShuSource?.geometry);
});

test('Later Shu 934-935 has a separately reviewed annual audit before its first territory sample', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-later_shu-934-935');
  const laterShuSource = boundaryCatalog.find(item => item.id === 'clio-3784-later_shu-936');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', reviewedAt: '2026-11-03',
    annualAudit: 'docs/audits/topics/later-shu-early-extent-934-935.json',
    sourceBoundaryIds: [],
  });
  expect(laterShuEarlyAnnualAudit.decisionIds).toEqual(['gap-later_shu-934-935']);
  expect(laterShuEarlyAnnualAudit.yearCount).toBe(2);
  expect(laterShuEarlyAnnualAudit.years.map(row => row.year)).toEqual([934, 935]);
  expect(laterShuEarlyAnnualAudit.years.every(row => row.polityId === 'later_shu' &&
    row.capitalPlaceId === 'chengdu' && row.regionalExtent.length > 20 && row.territoryBoundary === null &&
    (row.year === 934 ? row.mapExpression === 'chengdu-capital-point-and-quzhou-event-point'
      : row.mapExpression === 'chengdu-capital-point-and-regional-event-note') && row.sourceIds.length > 0 &&
    row.evidenceGap.length > 20)).toBe(true);
  const knownSourceIds = new Set(sourceNotes.map(source => source.id));
  expect(decision?.citationIds).toContain('zizhi-tongjian-later-shu-934-935');
  expect(decision?.citationIds).toContain('quzhou-historical-geography');
  expect(laterShuEarlyAnnualAudit.years.every(row => row.sourceIds.every(sourceId => knownSourceIds.has(sourceId)))).toBe(true);
  expect(laterShuEarlyAnnualAudit.years.find(row => row.year === 934)?.conclusion).toContain('即皇帝位');
  expect(laterShuEarlyAnnualAudit.years.find(row => row.year === 934)?.conclusion).toContain('渠州');
  expect(laterShuEarlyAnnualAudit.years.find(row => row.year === 935)?.conclusion).toContain('大赦');
  expect(laterShuSource).toMatchObject({
    polityId:'later_shu', validFrom:936, validTo:946, snapshotYear:936,
    sourceFrom:936, sourceTo:946, sourceRecord:3784, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.rationale).toContain('clio-3784-later_shu-936');
  expect(laterShuEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  for (const year of laterShuEarlyAnnualAudit.years.map(row => row.year)) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3784-later_shu-936'),
      `后蜀 ${year} 不得回填 936—946 年来源面`).toBe(false);
    expect(state.boundaries.some(boundary => boundary.polityId === 'later_shu' &&
      (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon'))).toBe(false);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[104.07,30.67]},
      properties:expect.objectContaining({polityId:'later_shu',placeId:'chengdu',role:'primary'}),
    }));
    if (year === 934) expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[106.97,30.84]},
      properties:expect.objectContaining({entityId:'later-shu-suppresses-quzhou-revolt-934'}),
    }));
  }
  const year936Shape = getHistoricalState(936).boundaries.find(boundary => boundary.id === 'clio-3784-later_shu-936');
  expect(year936Shape?.geometry).toEqual(laterShuSource?.geometry);
});

test('Jingnan 924-925 records its investiture and Jiangling center without inferring a border', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-jingnan-924-925');
  const laterJingnanSource = boundaryCatalog.find(item => item.id === 'clio-3728-jingnan-926');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: [],
    annualAudit: 'docs/audits/topics/jingnan-early-polity-924-925.json',
    citationIds: expect.arrayContaining(['zizhi-tongjian-jingnan-924-925']),
  });
  expect(jingnanEarlyAnnualAudit.years.map(row => row.year)).toEqual([924, 925]);
  expect(jingnanEarlyAnnualAudit.years.every(row => row.polityId === 'jingnan' &&
    row.capitalPlaceId === 'jiangling' && row.territoryBoundary === null &&
    row.sourceIds.includes('zizhi-tongjian-jingnan-924-925') && row.evidenceGap.length > 20)).toBe(true);
  expect(jingnanEarlyAnnualAudit.years.find(row => row.year === 924)?.conclusion).toContain('南平王');
  expect(laterJingnanSource).toMatchObject({
    polityId:'jingnan', validFrom:926, validTo:935, snapshotYear:926,
    sourceFrom:926, sourceTo:935, sourceRecord:3728, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.rationale).toContain('clio-3728-jingnan-926');
  expect(jingnanEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  for (const year of [924, 925]) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3728-jingnan-926'),
      `荆南 ${year} 不得回填 926—935 年来源面`).toBe(false);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'jingnan')
      .filter(isDefiniteBoundary)).toEqual([]);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry:{type:'Point',coordinates:[112.19,30.35]},
      properties:expect.objectContaining({polityId:'jingnan',placeId:'jiangling',role:'primary'}),
    }));
  }
  const year926Shape = getHistoricalState(926).boundaries.find(boundary => boundary.id === 'clio-3728-jingnan-926');
  expect(year926Shape?.geometry).toEqual(laterJingnanSource?.geometry);
});

test('Northern Han 951-959 separates claimed prefectures, political center, and wartime events', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-northern_han-951-959');
  const laterNorthernHanSource = boundaryCatalog.find(item => item.id === 'clio-3859-northern_han-960');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: [],
    annualAudit: 'docs/audits/topics/northern-han-establishment-and-early-wars-951-959.json',
    citationIds: expect.arrayContaining(['zizhi-tongjian-northern-han-951-959', 'gaoping-battlefield-location']),
  });
  expect(northernHanEarlyAnnualAudit.years.map(row => row.year)).toEqual(
    Array.from({length: 9}, (_, index) => 951 + index),
  );
  expect(northernHanEarlyAnnualAudit.years.every(row => row.polityId === 'northern_han' &&
    row.capitalPlaceId === 'taiyuan' && row.territoryBoundary === null &&
    row.sourceIds.includes('zizhi-tongjian-northern-han-951-959') && row.evidenceGap.length > 20)).toBe(true);
  expect(northernHanEarlyAnnualAudit.years.find(row => row.year === 951)?.conclusion).toContain('十二州');
  expect(northernHanEarlyAnnualAudit.years.find(row => row.year === 954)?.conclusion).toContain('高平');
  expect(northernHanEarlyAnnualAudit.years.find(row => row.year === 954)?.mapExpression).toBe('taiyuan-capital-point-and-bagongyuan-event-point');
  expect(northernHanEarlyAnnualAudit.years.find(row => row.year === 954)?.sourceIds).toContain('gaoping-battlefield-location');
  expect(northernHanEarlyAnnualAudit.years.find(row => row.year === 956)?.conclusion).toContain('围晋阳');
  const northernHan959 = northernHanEarlyAnnualAudit.years.find(row => row.year === 959);
  expect(northernHan959?.sourceIds).toContain('china-admin-history-five-dynasties-northern-han-map');
  expect(northernHan959?.evidenceGap).toContain('不能替代951—958年逐年控制证据');
  expect(northernHanEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({
    id:'china-admin-history-five-dynasties-northern-han-map',
  }));
  expect(laterNorthernHanSource).toMatchObject({
    polityId:'northern_han', validFrom:960, validTo:969, snapshotYear:960,
    sourceFrom:960, sourceTo:969, sourceRecord:3859, confidence:'low', controlType:'unspecified',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.rationale).toContain('clio-3859-northern_han-960');
  expect(northernHanEarlyAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));
  expect(decision?.citationIds).toContain('china-admin-history-five-dynasties-northern-han-map');
  for (let year = 951; year <= 959; year++) {
    const state = getHistoricalState(year);
    expect(state.boundaries.some(boundary => boundary.id === 'clio-3859-northern_han-960'),
      `北汉 ${year} 不得回填 960—969 年来源面`).toBe(false);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'northern_han')
      .filter(isDefiniteBoundary)).toEqual([]);
    expect(buildLocalMapData(state).capitalPlaces.features).toContainEqual(expect.objectContaining({
      geometry: {type: 'Point', coordinates: [112.55, 37.87]},
      properties: expect.objectContaining({polityId: 'northern_han', role: 'primary'}),
    }));
    if (year === 954) expect(buildLocalMapData(state).events.features).toContainEqual(expect.objectContaining({
      geometry: {type: 'Point', coordinates: [112.895, 35.619]},
      properties: expect.objectContaining({entityId: 'northern-han-gaoping-campaign-954'}),
    }));
  }
  const year960Shape = getHistoricalState(960).boundaries.find(boundary => boundary.id === 'clio-3859-northern_han-960');
  expect(year960Shape?.geometry).toEqual(laterNorthernHanSource?.geometry);
});

test('Cheng Han 305 Han’an campaign remains unmapped until its historical location is resolved', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-cheng_han-304-305');
  const year305 = chengHanFoundingAnnualAudit.years.find(row => row.year === 305);
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'jinshu-dilizhi-jiangyang-hanan', 'guangxu-neijiang-hanan-distinction',
    'huayang-guozhi-hanan-relative-location', 'republican-jiangan-gazetteer-hanan-review',
  ]));
  expect(year305?.sourceIds).toEqual(expect.arrayContaining([
    'jinshu-dilizhi-jiangyang-hanan', 'guangxu-neijiang-hanan-distinction',
    'huayang-guozhi-hanan-relative-location', 'republican-jiangan-gazetteer-hanan-review',
  ]));
  expect(year305?.evidenceGap).toContain('故不添加战事事件点');
  expect(year305?.evidenceGap).toContain('五百里');
  expect(year305?.evidenceGap).toContain('四百里');
  expect(year305?.territoryBoundary).toBeNull();
});

test('Dali 937-946 does not borrow the separate Cliopatria shape whose source interval begins in 947', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-dali-937-946');
  const laterDaliSource = boundaryCatalog.find(item => item.id === 'clio-3812-dali-947');

  expect(laterDaliSource).toMatchObject({
    polityId:'dali', validFrom:947, validTo:969, sourceFrom:947, sourceTo:969,
    sourceRecord:3812, controlType:'unspecified', confidence:'low',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.sourceBoundaryIds).toEqual([]);
  expect(decision?.rationale).toContain('clio-3812-dali-947');

  for (let year = 937; year <= 946; year++) {
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === 'clio-3812-dali-947'),
      `Dali ${year} must not inherit the 947–969 source interval`).toBe(false);
  }
  const year947Shape = getHistoricalState(947).boundaries.find(boundary => boundary.id === 'clio-3812-dali-947');
  expect(year947Shape?.geometry).toEqual(laterDaliSource?.geometry);
});

test('Yang Wu 902-910 does not borrow the separate Cliopatria shape whose source interval begins in 911', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-wu_ten-902-910');
  const laterWuSource = boundaryCatalog.find(item => item.id === 'clio-3646-wu_ten-911');

  expect(laterWuSource).toMatchObject({
    polityId:'wu_ten', validFrom:911, validTo:937, sourceFrom:911, sourceTo:946,
    snapshotYear:911, sourceRecord:3646, controlType:'unspecified', confidence:'low',
  });
  expect(decision?.citationIds).toContain('cliopatria');
  expect(decision?.sourceBoundaryIds).toEqual([]);
  expect(decision?.rationale).toContain('clio-3646-wu_ten-911');
  expect(yangWuFormationAnnualAudit.sourceNotes).toContainEqual(expect.objectContaining({id:'cliopatria'}));

  for (let year = 902; year <= 910; year++) {
    expect(getHistoricalState(year).boundaries.some(boundary => boundary.id === 'clio-3646-wu_ten-911'),
      `杨吴 ${year} must not inherit the later source interval`).toBe(false);
  }
  const year911Shape = getHistoricalState(911).boundaries.find(boundary => boundary.id === 'clio-3646-wu_ten-911');
  expect(year911Shape?.geometry).toEqual(laterWuSource?.geometry);
});
