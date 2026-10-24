import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const overlaps = (from: number, to: number, year: number | undefined) => (
  year !== undefined && from <= year && year <= to
);

const key = (candidate: Candidate) => (
  `${candidate.polityId}|${candidate.placeId}|${candidate.eventId ?? ''}|${candidate.heritageId ?? ''}`
);

type Candidate = {
  polityId: string;
  placeId: string;
  eventId?: string;
  heritageId?: string;
};

const auditedRelations: Candidate[] = [
  { polityId: 'han_eastern', placeId: 'luoyang', eventId: 'white-horse-temple-founded', heritageId: 'white-horse-temple' },
  { polityId: 'liang_southern', placeId: 'jiankang', eventId: 'southern-qi-ended-502' },
  { polityId: 'zhou_northern', placeId: 'changan', eventId: 'western-wei-ended-557' },
  { polityId: 'tang', placeId: 'luoyang', eventId: 'court-moves-luoyang' },
];

const relationKeys = (candidate: Candidate) => [
  candidate.eventId ? key({ ...candidate, heritageId: undefined }) : undefined,
  candidate.heritageId ? key({ ...candidate, eventId: undefined }) : undefined,
].filter((candidateKey): candidateKey is string => candidateKey !== undefined);

function discoverResiduals(): Candidate[] {
  const residuals: Candidate[] = [];

  for (const capital of capitalHistory) {
    const polity = getPolityDetail(capital.polityId);
    if (!polity) continue;

    for (const event of events) {
      const detail = getEventDetail(event.id);
      if (event.placeId !== capital.placeId || !detail || !overlaps(capital.validFrom, capital.validTo, event.year)) continue;
      if (detail.polityIds.includes(capital.polityId) && !polity.eventIds.includes(event.id)) {
        residuals.push({ polityId: capital.polityId, placeId: capital.placeId, eventId: event.id });
      }
    }

    for (const heritage of heritageAssets) {
      const detail = getHeritageDetail(heritage.id);
      if (heritage.placeId !== capital.placeId || heritage.constructionFrom === undefined
        || !overlaps(capital.validFrom, capital.validTo, heritage.constructionFrom)) continue;
      if (detail?.associatedPolities.includes(capital.polityId) && !polity.heritageIds.includes(heritage.id)) {
        residuals.push({ polityId: capital.polityId, placeId: capital.placeId, heritageId: heritage.id });
      }
    }
  }

  return residuals;
}

describe('round 133 polity-city closure audit', () => {
  it('closes the selected source-backed event and heritage relations', () => {
    expect(auditedRelations).toHaveLength(4);
    const residualKeys = discoverResiduals().map(key);

    for (const candidate of auditedRelations) {
      const polity = getPolityDetail(candidate.polityId);
      expect(residualKeys, key(candidate)).not.toEqual(expect.arrayContaining(relationKeys(candidate)));
      expect(polity, key(candidate)).toBeDefined();
      expect(new Set(polity?.eventIds ?? []).size, key(candidate)).toBe(polity?.eventIds.length);
      expect(new Set(polity?.heritageIds ?? []).size, key(candidate)).toBe(polity?.heritageIds.length);
      if (candidate.eventId) expect(polity?.eventIds, key(candidate)).toContain(candidate.eventId);
      if (candidate.heritageId) expect(polity?.heritageIds, key(candidate)).toContain(candidate.heritageId);
    }
  });

  it('keeps every audited endpoint source-backed and navigable', () => {
    for (const candidate of auditedRelations) {
      const capital = capitalHistory.find((item) => (
        item.polityId === candidate.polityId && item.placeId === candidate.placeId
      ));
      expect(capital, key(candidate)).toBeDefined();

      if (candidate.eventId) {
        const event = events.find((item) => item.id === candidate.eventId);
        const detail = getEventDetail(candidate.eventId);
        expect(event?.placeId, key(candidate)).toBe(candidate.placeId);
        expect(detail?.polityIds, key(candidate)).toContain(candidate.polityId);
        expect(event?.year === undefined || overlaps(capital!.validFrom, capital!.validTo, event.year), key(candidate)).toBe(true);
        expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(event?.sourceIds.every((sourceId) => getPolityDetail(candidate.polityId)?.sourceIds.includes(sourceId)), key(candidate)).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => getPolityDetail(candidate.polityId)?.sourceIds.includes(sourceId)), key(candidate)).toBe(true);
      }

      if (candidate.heritageId) {
        const heritage = heritageAssets.find((item) => item.id === candidate.heritageId);
        const detail = getHeritageDetail(candidate.heritageId);
        expect(heritage?.placeId, key(candidate)).toBe(candidate.placeId);
        expect(detail?.associatedPolities, key(candidate)).toContain(candidate.polityId);
        expect(heritage?.constructionFrom === undefined
          || overlaps(capital!.validFrom, capital!.validTo, heritage.constructionFrom), key(candidate)).toBe(true);
        expect(heritage?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(heritage?.sourceIds.every((sourceId) => getPolityDetail(candidate.polityId)?.sourceIds.includes(sourceId)), key(candidate)).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => getPolityDetail(candidate.polityId)?.sourceIds.includes(sourceId)), key(candidate)).toBe(true);
      }
    }
  });
});
