import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const luoyangPhases = [
  ['zhou_western', -1046, -771, 'secondary', 'formal', 'medium'],
  ['zhou_eastern', -770, -256, 'primary', 'formal', 'high'],
  ['han_western', -206, -202, 'primary', 'formal', 'medium'],
  ['gengshi', 24, 24, 'primary', 'actual', 'medium'],
  ['han_eastern', 25, 220, 'primary', 'formal', 'high'],
  ['wei_three', 220, 265, 'primary', 'formal', 'high'],
  ['jin_western', 265, 311, 'primary', 'formal', 'high'],
  ['wei_northern', 495, 534, 'primary', 'formal', 'medium'],
  ['sui', 605, 618, 'primary', 'formal', 'high'],
  ['tang', 618, 907, 'secondary', 'formal', 'high'],
  ['wu_zhou', 690, 705, 'primary', 'formal', 'high'],
  ['tang_later', 923, 936, 'primary', 'formal', 'high'],
] as const;

const luoyangRecord = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId && record.placeId === 'luoyang');

describe('Luoyang capital-history completeness boundary', () => {
  it('preserves the complete audited capital-phase sequence and modern mapping', () => {
    expect(places.find((place) => place.id === 'luoyang')).toMatchObject({
      modernName: '洛阳市',
      modernAdministrativeUnit: '河南省',
    });

    const expectedPhaseIds = luoyangPhases.map(([polityId]) => polityId).sort();
    const actualPhaseIds = [...new Set(capitalHistory.filter((record) => record.placeId === 'luoyang').map((record) => record.polityId))].sort();
    expect(actualPhaseIds).toEqual(expectedPhaseIds);

    for (const [polityId, validFrom, validTo, role, status, confidence] of luoyangPhases) {
      expect(luoyangRecord(polityId), polityId).toEqual([
        expect.objectContaining({
          placeId: 'luoyang', validFrom, validTo, role, status, confidence,
          sourceIds: expect.arrayContaining(['capital-history-reference']),
        }),
      ]);
    }

    const report = getCapitalCoverageReport();
    for (const [polityId] of luoyangPhases.filter(([, , , , , confidence]) => confidence === 'high')) {
      const coverage = report.polities.find((item) => item.polityId === polityId);
      expect(coverage?.missingPlaceIds, polityId).toEqual([]);
      expect(coverage?.noSourceRecordIds, polityId).toEqual([]);
      expect(coverage?.noTimeRecordIds, polityId).toEqual([]);
      expect(coverage?.placeholderRecordIds, polityId).toEqual([]);
      expect(coverage?.uncertainRecordIds, polityId).toEqual([]);
    }
  });

  it('keeps every Luoyang phase aligned with the polity-detail capital contract', () => {
    for (const [polityId, validFrom, validTo, role, status] of luoyangPhases) {
      const detail = getPolityDetail(polityId);
      expect(detail, polityId).toBeDefined();
      expect(detail?.capitalPhases).toEqual(expect.arrayContaining([
        expect.objectContaining({ placeId: 'luoyang', validFrom, validTo, role, status }),
      ]));
    }
  });

  it('keeps each Luoyang-located event and heritage asset source-backed and detail-resolvable', () => {
    const luoyangEventIds = events.filter((event) => event.placeId === 'luoyang').map((event) => event.id);
    const luoyangHeritage = heritageAssets.filter((asset) => asset.placeId === 'luoyang');

    expect(luoyangEventIds.length).toBeGreaterThan(0);
    expect(luoyangHeritage.length).toBeGreaterThan(0);

    for (const event of events.filter((candidate) => candidate.placeId === 'luoyang')) {
      expect(event.sourceIds.length, event.id).toBeGreaterThan(0);
      expect(eventDetails.find((detail) => detail.eventId === event.id)?.locationIds, event.id).toEqual(expect.arrayContaining(['luoyang']));
    }

    for (const asset of luoyangHeritage) {
      expect(asset.sourceIds.length, asset.id).toBeGreaterThan(0);
      const assetEnd = asset.constructionTo ?? asset.constructionFrom;
      expect(asset.constructionFrom, `${asset.id}: construction start`).toBeDefined();
      expect(assetEnd, `${asset.id}: construction end`).toBeDefined();
      if (asset.constructionFrom === undefined || assetEnd === undefined) continue;
      const assetStart = asset.constructionFrom;
      expect(assetStart).toBeLessThanOrEqual(assetEnd);
      expect(luoyangPhases.some(([, phaseStart, phaseEnd]) => assetStart <= phaseEnd && phaseStart <= assetEnd), asset.id).toBe(true);
    }
  });

  it('does not turn shared or temporary Luoyang layers into false single-polity claims', () => {
    const hanWeiLayer = heritageAssets.find((asset) => asset.id === 'luoyang-han-wei-city-site');
    expect(hanWeiLayer?.description).toContain('东汉、曹魏、西晋及北魏前期');
    expect(luoyangPhases.filter(([, validFrom, validTo]) => validFrom <= 534 && validTo >= 25)).toHaveLength(4);
    expect(luoyangRecord('gengshi')[0]).toMatchObject({ role: 'primary', status: 'actual', confidence: 'medium' });
    expect(luoyangRecord('tang')[0]).toMatchObject({ role: 'secondary', status: 'formal' });
  });
});
