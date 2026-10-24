import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const heritageCandidates = [
  'taiji-palace-site',
  'hanguang-gate-site',
  'mingde-gate-site',
  'qianling',
  'ximing-temple-site',
] as const;

const overlap = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 112 task B Sui-Tang capital heritage boundary', () => {
  it('audits all five remaining heritage candidates and the Tang Luoyang court-move event', () => {
    const sui = getPolityDetail('sui');
    const tang = getPolityDetail('tang');

    expect(heritageCandidates).toHaveLength(5);
    for (const heritageId of heritageCandidates) {
      const asset = heritageAssets.find((item) => item.id === heritageId);
      const detail = getHeritageDetail(heritageId);

      expect(asset, heritageId).toBeDefined();
      expect(detail, heritageId).toBeDefined();
      expect(asset?.placeId, heritageId).toBeDefined();
      expect(asset?.constructionFrom, heritageId).toBeDefined();
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), heritageId).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), heritageId).toBe(true);
      expect(detail?.associatedPolities.length, heritageId).toBeGreaterThan(0);
      expect(sui?.heritageIds, heritageId).not.toContain(heritageId);
      expect(tang?.heritageIds, heritageId).not.toContain(heritageId);
    }

    const courtMove = getEventDetail('court-moves-luoyang');
    expect(courtMove).toMatchObject({
      eventId: 'court-moves-luoyang',
      polityIds: ['tang', 'liang_later'],
      locationIds: ['changan', 'luoyang'],
      sourceIds: ['zizhi-tongjian'],
    });
    expect(courtMove?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ startYear: 904, endYear: 904 }),
    ]));
    expect(tang?.eventIds).toContain('court-moves-luoyang');
  });

  it('preserves the shared, layered, and Xuanzang boundary classifications', () => {
    expect(getHeritageDetail('taiji-palace-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('hanguang-gate-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('mingde-gate-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('dingding-gate-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('qianling')?.associatedPolities).toEqual(['tang', 'wu_zhou']);
    expect(getHeritageDetail('shangyang-palace-site')?.associatedPolities).toEqual(['tang', 'wu_zhou']);

    const ximing = getHeritageDetail('ximing-temple-site');
    expect(ximing?.associatedPolities).toEqual(['tang']);
    expect(ximing?.associatedEvents).toEqual(['ximing-temple-built', 'xuanzang-at-ximing-658', 'tang-founded']);
    expect(ximing?.associatedEvents).not.toContain('xuanzang-translations');
    expect(ximing?.uncertaintyNote).toContain('约址');
    expect(ximing?.uncertaintyNote).toContain('译经事件端点');

    const courtMove = getEventDetail('court-moves-luoyang');
    expect(courtMove?.polityIds.length).toBeGreaterThan(1);
    expect(courtMove?.locationIds.length).toBeGreaterThan(1);
  });

  it('requires capital-stage overlap but does not treat overlap as sufficient evidence', () => {
    for (const heritageId of heritageCandidates) {
      const asset = heritageAssets.find((item) => item.id === heritageId)!;
      const terms = capitalHistory.filter((term) => (
        term.placeId === asset.placeId
        && term.validFrom <= (asset.constructionTo ?? asset.constructionFrom!)
        && term.validTo >= asset.constructionFrom!
      ));

      expect(terms.length, heritageId).toBeGreaterThan(0);
      expect(terms.some((term) => overlap(term.validFrom, term.validTo, asset.constructionFrom)), heritageId).toBe(true);
    }

    const courtMove = getEventDetail('court-moves-luoyang')!;
    expect(courtMove.phases?.some((phase) => phase.startYear === 904)).toBe(true);
    expect(capitalHistory.some((term) => (
      term.polityId === 'tang'
      && term.placeId === 'luoyang'
      && overlap(term.validFrom, term.validTo, 904)
    ))).toBe(true);
  });
});
