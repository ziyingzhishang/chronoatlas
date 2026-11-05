import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';
import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';
import { boundaryCatalog } from './boundaries';
import { boundaryGeometryConflicts } from './boundary-conflicts';
import formerZhaoAnnualAudit from '../../docs/audits/out-of-ledger/former-zhao-306-329.json';

describe('襄国前赵城市视角历史链审计', () => {
  it('records a sourced conclusion for every Former Zhao year from 306 through 329 without restoring held polygons', () => {
    const sourceIds = new Set(Object.keys(sourceById));
    expect(formerZhaoAnnualAudit).toMatchObject({polityId:'former_zhao', yearCount:24, reviewStatus:'source-checked'});
    expect(formerZhaoAnnualAudit.years.map((row) => row.year)).toEqual(
      Array.from({length:24}, (_, index) => 306 + index),
    );
    expect(formerZhaoAnnualAudit.years.every((row) => row.territoryBoundary === null
      && row.sourceIds.length > 0 && row.sourceIds.every((id) => sourceIds.has(id)))).toBe(true);
    expect(formerZhaoAnnualAudit.years.slice(0,3).every((row) =>
      row.mapExpression === 'historical-conclusion-only' && row.centerPlaceId === null)).toBe(true);
    expect(formerZhaoAnnualAudit.years.find((row) => row.year === 308)).toMatchObject({
      mapExpression:'historical-conclusion-only',
      centerPlaceId:null,
      sourceIds:expect.arrayContaining([
        'former-zhao-puzhi-historical-geography-review',
        'yangtao-hanzhao-regime-2014',
      ]),
    });
    expect(formerZhaoAnnualAudit.years.find((row) => row.year === 307)).toMatchObject({
      mapExpression:'historical-conclusion-only',
      centerPlaceId:null,
      sourceIds:expect.arrayContaining(['yangtao-hanzhao-regime-2014']),
    });
    expect(formerZhaoAnnualAudit.years.find((row) => row.year === 308)?.conclusion)
      .toContain('平阳、河东、上党、乐平');
    expect(formerZhaoAnnualAudit.years.find((row) => row.year === 308)?.evidenceGap)
      .toContain('未给出各地直接控制起讫');
    expect(sourceById['former-zhao-capital-timeline-primary-sources']?.urlOrCitation).toContain('卷086');
    expect(formerZhaoAnnualAudit.years.slice(3,13).every((row) =>
      row.mapExpression === 'control-center-point' && row.centerPlaceId === 'pingyang')).toBe(true);
    expect(formerZhaoAnnualAudit.years.slice(13).every((row) =>
      row.mapExpression === 'control-center-point' && row.centerPlaceId === 'changan')).toBe(true);
    expect(formerZhaoAnnualAudit.years.at(-1)?.evidenceGap).toContain('覆亡');
    expect([306,307,308,309,310,311,318,319,323,324,328,329].every((year) =>
      !getHistoricalState(year).boundaries.some((boundary) => boundary.polityId === 'former_zhao'
        && boundary.geometry.type !== 'Point'))).toBe(true);
    for (const year of [307,308]) {
      const state = getHistoricalState(year);
      const map = buildLocalMapData(state);
      expect(state.boundaries.some((boundary) => boundary.polityId === 'former_zhao')).toBe(false);
      expect(map.boundaries.features.some((feature) => feature.properties?.polityId === 'former_zhao')).toBe(false);
    }
  });

  it('keeps Xiangguo distinct and dates the Former Zhao capitals to their sourced intervals', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'former-zhao-xiangguo-city-site');
    const detail = getHeritageDetail('former-zhao-xiangguo-city-site');
    const place = places.find((candidate) => candidate.id === 'xiangguo');
    const capitalTerms = capitalHistory.filter((candidate) => candidate.polityId === 'former_zhao');
    const pingyangTerm = capitalTerms.find((candidate) => candidate.placeId === 'pingyang');
    const changanTerm = capitalTerms.find((candidate) => candidate.placeId === 'changan');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '邢台市一带', modernAdministrativeUnit: '河北省邢台市', mappingStatus: 'approximate' });
    expect(pingyangTerm).toMatchObject({ polityId: 'former_zhao', placeId: 'pingyang', validFrom: 309, validTo: 318 });
    expect(changanTerm).toMatchObject({ polityId: 'former_zhao', placeId: 'changan', validFrom: 319, validTo: 329 });
    expect(capitalTerms.some((term) => term.validFrom <= 305 && term.validTo >= 305)).toBe(false);
    expect(capitalTerms.some((term) => term.validFrom <= 308 && term.validTo >= 308)).toBe(false);
    expect(pingyangTerm?.sourceIds).toContain('former-zhao-capital-timeline-primary-sources');
    expect(changanTerm?.sourceIds).toContain('former-zhao-capital-timeline-primary-sources');
    expect(getHistoricalState(305).boundaries.some((boundary) => boundary.polityId === 'former_zhao')).toBe(false);
    expect(getHistoricalState(309).boundaries).toContainEqual(expect.objectContaining({
      polityId:'former_zhao', geometry:{type:'Point',coordinates:[111.52,36.08]},
    }));
    expect(getHistoricalState(319).boundaries).toContainEqual(expect.objectContaining({
      polityId:'former_zhao', geometry:{type:'Point',coordinates:[108.94,34.34]},
    }));
    expect(buildLocalMapData(getHistoricalState(309)).boundaries.features.some((feature) =>
      feature.id === 'special-former-zhao-309-318-pingyang-center')).toBe(true);
    expect(buildLocalMapData(getHistoricalState(319)).boundaries.features.some((feature) =>
      feature.id === 'special-former-zhao-319-329-changan-center')).toBe(true);
    for (const year of [309,319]) {
      expect(getHistoricalState(year).boundaries
        .filter((boundary) => boundary.polityId === 'former_zhao' && boundary.geometry.type !== 'Point'))
        .toEqual([]);
    }
    const formerZhaoSourceIds = ['clio-1428-former_zhao-306','clio-1434-former_zhao-311','clio-1444-former_zhao-324'];
    for (const id of formerZhaoSourceIds) {
      const original = boundaryCatalog.find((boundary) => boundary.id === id);
      expect(original?.geometry.type).toBe('Polygon');
      expect(boundaryGeometryConflicts.some((conflict) => conflict.boundaryId === id
        && conflict.status === 'requires-review')).toBe(true);
      expect([306,310,311,318,319,323,324,329].every((year) =>
        !getHistoricalState(year).boundaries.some((boundary) => boundary.id === id))).toBe(true);
    }
    for (const year of [306,307,308,309,311,319,324,329]) {
      expect(buildLocalMapData(getHistoricalState(year)).boundaries.features.some((feature) =>
        formerZhaoSourceIds.includes(String(feature.id)))).toBe(false);
    }
    expect(asset).toMatchObject({ placeId: 'xiangguo', constructionFrom: 304, constructionTo: 329 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('邢台市');
    expect(detail?.associatedPolities).toContain('former_zhao');
    expect(detail?.associatedEvents).toContain('former-zhao-founded');
    expect(detail?.associatedPeople).toContain('liu-yao');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('former_zhao')).toBe(true);
    expect(eventIds.has('former-zhao-founded')).toBe(true);
    expect(peopleIds.has('liu-yao')).toBe(true);
  });
});
