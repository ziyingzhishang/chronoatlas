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

describe('round 109 capital chain task C', () => {
  it('audits all seven shared candidates without closing a non-exclusive endpoint', () => {
    const eventCandidates = [
      {
        label: '秦—楚汉之争',
        targetPolityId: 'qin',
        placeId: 'xianyang',
        eventId: 'chu-han-contention',
        category: 'shared-transition-event',
      },
      {
        label: '唐—洛阳行幸',
        targetPolityId: 'tang',
        placeId: 'luoyang',
        eventId: 'court-moves-luoyang',
        category: 'shared-transition-event',
      },
      {
        label: '后梁五代转折',
        targetPolityId: 'liang_later',
        placeId: 'kaifeng',
        eventId: 'five-dynasties',
        category: 'shared-transition-event',
      },
      {
        label: '东周东迁',
        targetPolityId: 'zhou_eastern',
        placeId: 'luoyang',
        eventId: 'zhou-eastward',
        category: 'foundation-stage-boundary',
      },
      {
        label: '北宋建政重复节点',
        targetPolityId: 'song_northern',
        placeId: 'kaifeng',
        eventId: 'song-founded',
        category: 'duplicate-event-node',
      },
    ] as const;

    expect(eventCandidates).toHaveLength(5);

    for (const candidate of eventCandidates) {
      const capital = capitalHistory.find((term) => (
        term.polityId === candidate.targetPolityId && term.placeId === candidate.placeId
      ));
      const event = events.find((item) => item.id === candidate.eventId);
      const detail = getEventDetail(candidate.eventId);
      const polityDetail = getPolityDetail(candidate.targetPolityId);

      expect(capital, candidate.label).toBeDefined();
      expect(event, candidate.label).toMatchObject({ id: candidate.eventId, placeId: candidate.placeId });
      expect(detail?.polityIds, candidate.label).toContain(candidate.targetPolityId);
      expect(detail?.locationIds, candidate.label).toContain(candidate.placeId);
      expect(overlaps(capital?.validFrom, capital?.validTo, event?.year), candidate.label).toBe(true);
      expect(candidate.category).toBeTruthy();

      if (candidate.category === 'duplicate-event-node') {
        expect(polityDetail?.eventIds, candidate.label).toContain('northern-song-founded');
      }
      expect(polityDetail?.eventIds, candidate.label).not.toContain(candidate.eventId);
    }

    expect(getEventDetail('chu-han-contention')?.polityIds).toEqual(
      expect.arrayContaining(['qin', 'han_western']),
    );
    expect(getEventDetail('court-moves-luoyang')?.polityIds).toEqual(
      expect.arrayContaining(['tang', 'liang_later']),
    );
    expect(getEventDetail('five-dynasties')?.polityIds).toEqual(
      expect.arrayContaining(['tang', 'liang_later']),
    );
    expect(getEventDetail('zhou-eastward')?.polityIds).toEqual(
      expect.arrayContaining(['zhou_western', 'zhou_eastern']),
    );
  });

  it('keeps the two heritage candidates cross-polity or cross-stage', () => {
    const heritageCandidates = [
      {
        label: '后凉姑臧遗产',
        targetPolityId: 'later_liang',
        placeId: 'guzang',
        heritageId: 'guzang-baita-temple-site',
        category: 'cross-polity-heritage',
        expectedPolities: ['former_liang', 'northern_liang', 'later_liang'],
      },
      {
        label: '后周开封遗产',
        targetPolityId: 'zhou_later',
        placeId: 'kaifeng',
        heritageId: 'kaifeng-northern-song-city-site',
        category: 'cross-stage-city-layer',
        expectedPolities: ['liang_later', 'jin_later', 'han_later', 'zhou_later', 'song_northern'],
      },
    ] as const;

    for (const candidate of heritageCandidates) {
      const asset = heritageAssets.find((item) => item.id === candidate.heritageId);
      const detail = getHeritageDetail(candidate.heritageId);
      const polityDetail = getPolityDetail(candidate.targetPolityId);

      expect(asset, candidate.label).toMatchObject({ id: candidate.heritageId, placeId: candidate.placeId });
      expect(detail?.associatedPolities, candidate.label).toEqual(
        expect.arrayContaining([...candidate.expectedPolities]),
      );
      expect(candidate.category).toBeTruthy();
      expect(polityDetail?.heritageIds, candidate.label).not.toContain(candidate.heritageId);
    }
  });
});
