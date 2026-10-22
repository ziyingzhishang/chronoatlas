import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';

const candidates = [
  'changle-palace-site',
  'maoling',
  'du-ling',
  'white-horse-temple',
] as const;

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

function hasIndependentAttachedEndpoint(heritageId: typeof candidates[number]) {
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

describe('round 111 Han capital heritage boundary', () => {
  it('audits the four candidates\' detail fields, source overlap, and capital alignment', () => {
    const expected = [
      { id: 'changle-palace-site', polities: ['han_western', 'xin'], placeId: 'changan', constructionFrom: -200 },
      { id: 'maoling', polities: ['han_western'], placeId: 'changan', constructionFrom: -139 },
      { id: 'du-ling', polities: ['han_western'], placeId: 'changan', constructionFrom: -74 },
      { id: 'white-horse-temple', polities: ['han_eastern', 'tang'], placeId: 'luoyang', constructionFrom: 68 },
    ] as const;

    for (const item of expected) {
      const asset = heritageAssets.find((candidate) => candidate.id === item.id);
      const detail = getHeritageDetail(item.id);
      const politySet = new Set<string>(item.polities);
      const capitalTerms = capitalHistory.filter((term) => (
        politySet.has(term.polityId)
        && term.placeId === item.placeId
        && overlaps(term.validFrom, term.validTo, asset?.constructionFrom)
      ));

      expect(asset).toMatchObject({
        id: item.id,
        placeId: item.placeId,
        constructionFrom: item.constructionFrom,
      });
      expect(detail).toMatchObject({
        heritageId: item.id,
        associatedPolities: item.polities,
        associatedEvents: expect.any(Array),
        constructionHistory: expect.arrayContaining([
          expect.objectContaining({ sourceIds: expect.arrayContaining(['modern-geography-reference']) }),
        ]),
        modernLocation: expect.any(String),
        uncertaintyNote: expect.any(String),
      });
      expect(asset?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.some((sourceId) => asset?.sourceIds.includes(sourceId))).toBe(true);
      expect(capitalTerms.length).toBeGreaterThan(0);
    }
  });

  it('finds no attached independent construction endpoint for any candidate', () => {
    expect(candidates.filter(hasIndependentAttachedEndpoint)).toEqual([]);
  });

  it('keeps each endpoint gap explicit instead of treating a nearby event as construction proof', () => {
    const changle = getHeritageDetail('changle-palace-site')!;
    const maoling = getHeritageDetail('maoling')!;
    const duLing = getHeritageDetail('du-ling')!;
    const whiteHorse = getHeritageDetail('white-horse-temple')!;

    expect(changle.associatedEvents).not.toContain('han-changan-new-city');
    expect(getEventDetail('han-changan-new-city')).toMatchObject({
      eventId: 'han-changan-new-city',
      polityIds: ['han_western'],
      locationIds: expect.arrayContaining(['changan']),
    });
    expect(getEventDetail('han-changan-new-city')?.phases).toEqual([
      expect.objectContaining({ startYear: -200, endYear: -200 }),
    ]);

    for (const detail of [maoling, duLing]) {
      expect(detail.associatedEvents).toEqual(['han-imperial-accession']);
      expect(getEventDetail('han-imperial-accession')?.locationIds).not.toContain('changan');
    }

    expect(whiteHorse.associatedPolities).toEqual(['han_eastern', 'tang']);
    expect(whiteHorse.associatedEvents).not.toContain('eastern-han-moves-luoyang');
    expect(getPolityDetail('han_western')?.heritageIds).not.toContain('changle-palace-site');
    expect(getPolityDetail('han_western')?.heritageIds).not.toContain('maoling');
    expect(getPolityDetail('han_western')?.heritageIds).not.toContain('du-ling');
    expect(getPolityDetail('han_eastern')?.heritageIds).not.toContain('white-horse-temple');
  });
});
