import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 111 capital reference task C', () => {
  it('closes the Chu Shouchun heritage chain with one independent polity endpoint', () => {
    const asset = heritageAssets.find((item) => item.id === 'chu-shouchun-city-site');
    const detail = getHeritageDetail('chu-shouchun-city-site');
    const polityDetail = getPolityDetail('chu_warring');
    const capital = capitalHistory.find((term) => (
      term.polityId === 'chu_warring' && term.placeId === 'shouchun'
    ));

    expect(asset).toMatchObject({
      id: 'chu-shouchun-city-site',
      placeId: 'shouchun',
      constructionFrom: -278,
      constructionTo: -223,
    });
    expect(detail).toMatchObject({
      heritageId: 'chu-shouchun-city-site',
      associatedPolities: ['chu_warring'],
      associatedEvents: ['chu-warring-founded-eighth-batch'],
    });
    expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(capital).toMatchObject({
      polityId: 'chu_warring',
      placeId: 'shouchun',
      validFrom: -278,
      validTo: -223,
    });
    expect(overlaps(capital?.validFrom, capital?.validTo, asset?.constructionFrom)).toBe(true);
    expect(polityDetail?.heritageIds).toContain('chu-shouchun-city-site');
  });

  it('keeps the seven cross-polity candidates outside forced single-polity closure', () => {
    const sharedEvents = [
      ['chu-han-contention', 'qin'],
      ['court-moves-luoyang', 'tang'],
      ['five-dynasties', 'liang_later'],
      ['zhou-eastward', 'zhou_eastern'],
    ] as const;

    for (const [eventId, polityId] of sharedEvents) {
      const event = getEventDetail(eventId);
      expect(event?.polityIds.length, eventId).toBeGreaterThan(1);
      expect(getPolityDetail(polityId)?.eventIds, eventId).not.toContain(eventId);
    }

    expect(getEventDetail('song-founded')?.polityIds).toEqual(['song_northern']);
    expect(getPolityDetail('song_northern')?.eventIds).toContain('northern-song-founded');
    expect(getPolityDetail('song_northern')?.eventIds).not.toContain('song-founded');

    for (const [heritageId, polityId] of [
      ['guzang-baita-temple-site', 'later_liang'],
      ['kaifeng-northern-song-city-site', 'zhou_later'],
    ] as const) {
      const detail = getHeritageDetail(heritageId);
      expect(detail?.associatedPolities.length, heritageId).toBeGreaterThan(1);
      expect(getPolityDetail(polityId)?.heritageIds, heritageId).not.toContain(heritageId);
    }
  });
});
