import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';

const candidateIds = ['changle-palace-site', 'maoling', 'du-ling', 'white-horse-temple'] as const;

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

function hasIndependentConstructionEvent(heritageId: typeof candidateIds[number]) {
  const asset = heritageAssets.find((item) => item.id === heritageId);
  const detail = getHeritageDetail(heritageId);
  if (!asset || !detail) return false;

  return detail.associatedEvents.some((eventId) => {
    const event = getEventDetail(eventId);
    return Boolean(
      event
      && detail.associatedPolities.some((polityId) => event.polityIds.includes(polityId))
      && event.locationIds.includes(asset.placeId)
      && event.phases?.some((phase) => (
        overlaps(phase.startYear, phase.endYear, asset.constructionFrom)
        || overlaps(phase.startYear, phase.endYear, asset.constructionTo)
      )),
    );
  });
}

describe('round 110 Han capital heritage boundary', () => {
  it('keeps cross-polity Changle Palace and White Horse Temple outside a single-polity closure', () => {
    expect(getHeritageDetail('changle-palace-site')?.associatedPolities).toEqual(['han_western', 'xin']);
    expect(getHeritageDetail('white-horse-temple')?.associatedPolities).toEqual(['han_eastern', 'tang']);
    expect(getPolityDetail('han_western')?.heritageIds).not.toContain('changle-palace-site');
    expect(getPolityDetail('han_eastern')?.heritageIds).not.toContain('white-horse-temple');
  });

  it('keeps Maoling and Duling deferred when their event links are only background events', () => {
    for (const heritageId of ['maoling', 'du-ling'] as const) {
      const asset = heritageAssets.find((item) => item.id === heritageId)!;
      const detail = getHeritageDetail(heritageId)!;
      const westernHanCapital = capitalHistory.find((term) => (
        term.polityId === 'han_western'
        && term.placeId === asset.placeId
        && overlaps(term.validFrom, term.validTo, asset.constructionFrom)
      ));

      expect(detail.associatedPolities).toEqual(['han_western']);
      expect(asset.sourceIds.length).toBeGreaterThan(0);
      expect(detail.sourceIds.some((sourceId) => asset.sourceIds.includes(sourceId))).toBe(true);
      expect(westernHanCapital).toMatchObject({ polityId: 'han_western', placeId: 'changan' });
      expect(hasIndependentConstructionEvent(heritageId)).toBe(false);
      expect(getPolityDetail('han_western')?.heritageIds).not.toContain(heritageId);
    }
  });

  it('does not treat any of the four candidates as closed by background events alone', () => {
    expect(candidateIds.filter(hasIndependentConstructionEvent)).toEqual([]);
    expect(getEventDetail('han-imperial-accession')).toMatchObject({
      eventId: 'han-imperial-accession',
      polityIds: ['han_western'],
      locationIds: ['sishui-northbank'],
    });
    expect(getEventDetail('han-imperial-accession')?.phases?.every((phase) => (
      phase.startYear === -202 && phase.endYear === -202
    ))).toBe(true);
  });
});
