import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 107 capital chain task C', () => {
  it('closes only the independently anchored Southern Song Linan center event', () => {
    const capital = capitalHistory.find((term) => term.polityId === 'song_south' && term.placeId === 'linan');
    const event = events.find((item) => item.id === 'song-linan-center-formed');
    const detail = getEventDetail('song-linan-center-formed');
    const polityDetail = getPolityDetail('song_south');

    expect(capital).toMatchObject({ polityId: 'song_south', placeId: 'linan', validFrom: 1127, validTo: 1279 });
    expect(event).toMatchObject({ id: 'song-linan-center-formed', year: 1138, placeId: 'linan' });
    expect(detail?.polityIds).toContain('song_south');
    expect(detail?.locationIds).toContain('linan');
    expect(overlaps(capital?.validFrom, capital?.validTo, event?.year)).toBe(true);
    expect(polityDetail?.eventIds).toContain('song-linan-center-formed');
  });

  it('keeps the other five task-C candidates classified instead of inferring from shared cities', () => {
    const remaining = [
      { polityId: 'liang_later', placeId: 'kaifeng', eventId: 'five-dynasties', category: 'shared-transition-event' },
      { polityId: 'zhou_later', placeId: 'kaifeng', heritageId: 'kaifeng-northern-song-city-site', category: 'cross-stage-city-layer' },
      { polityId: 'zhou_eastern', placeId: 'luoyang', eventId: 'zhou-eastward', category: 'foundation-stage-boundary' },
      { polityId: 'later_liang', placeId: 'guzang', heritageId: 'guzang-baita-temple-site', category: 'cross-polity-heritage' },
      { polityId: 'song_northern', placeId: 'kaifeng', eventId: 'song-founded', category: 'duplicate-event-node' },
    ];

    for (const candidate of remaining) {
      const capital = capitalHistory.find((term) => term.polityId === candidate.polityId && term.placeId === candidate.placeId);
      const detail = getPolityDetail(candidate.polityId);
      if (candidate.eventId) {
        const event = events.find((item) => item.id === candidate.eventId);
        expect(event).toBeDefined();
        expect(getEventDetail(candidate.eventId)?.polityIds).toContain(candidate.polityId);
        expect(event?.placeId).toBe(candidate.placeId);
        expect(overlaps(capital?.validFrom, capital?.validTo, event?.year)).toBe(true);
        expect(detail?.eventIds).not.toContain(candidate.eventId);
      } else {
        const asset = heritageAssets.find((item) => item.id === candidate.heritageId);
        expect(asset).toBeDefined();
        expect(getHeritageDetail(candidate.heritageId!)?.associatedPolities).toContain(candidate.polityId);
        expect(asset?.placeId).toBe(candidate.placeId);
        expect(detail?.heritageIds).not.toContain(candidate.heritageId);
      }
      expect(candidate.category).toBeTruthy();
    }
  });
});
