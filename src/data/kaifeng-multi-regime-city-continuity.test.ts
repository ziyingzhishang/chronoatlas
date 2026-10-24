import { describe, expect, it } from 'vitest';

import { buildCityHistoryTimeline } from '../domain/city-timeline';
import { buildPolityStudyView } from '../domain/study-view';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { getPolityDetail, polityDetails } from './polity-details';
import { claims } from './claims';

const data = {
  polities,
  places,
  people,
  heritage: heritageAssets,
  events,
  eventDetails,
  claims,
  capitalTerms: capitalHistory,
  polityDetails,
};

const stages = [
  { polityId: 'liang_later', from: 907, to: 923, heritageId: 'later-liang-kaifeng-city-layer', eventId: 'later-liang-five-dynasties-founded', personId: 'zhu-wen' },
  { polityId: 'jin_later', from: 936, to: 947, heritageId: 'kaifeng-later-jin-han-city-layer', eventId: 'later-jin-ended-947', personId: 'shi-jingtang' },
  { polityId: 'han_later', from: 947, to: 951, heritageId: 'kaifeng-later-jin-han-city-layer', eventId: 'later-han-ended-951', personId: 'liu-zhiyuan' },
  { polityId: 'zhou_later', from: 951, to: 960, heritageId: 'kaifeng-later-zhou-city-layer', eventId: 'later-zhou-ended-960', personId: 'guo-wei' },
  { polityId: 'song_northern', from: 960, to: 1127, heritageId: 'kaifeng-northern-song-city-site', eventId: 'northern-song-founded', personId: 'zhao-kuangyin' },
  { polityId: 'jin_jurchen', from: 1214, to: 1234, heritageId: 'jin-kaifeng-city-layer', eventId: 'jin-ended-1234', personId: 'wanyan-shouxu' },
] as const;

describe('开封跨政权城市连续性审计', () => {
  it('connects six capital stages to one modern place and a dated heritage layer', () => {
    const place = places.find((candidate) => candidate.id === 'kaifeng');
    expect(place).toMatchObject({ historicalName: '开封', modernName: '开封市' });

    for (const stage of stages) {
      const capital = capitalHistory.find((candidate) => (
        candidate.polityId === stage.polityId
        && candidate.placeId === 'kaifeng'
        && candidate.validFrom === stage.from
        && candidate.validTo === stage.to
      ));
      const polity = getPolityDetail(stage.polityId);
      const asset = heritageAssets.find((candidate) => candidate.id === stage.heritageId);
      const heritageDetail = getHeritageDetail(stage.heritageId);
      const event = events.find((candidate) => candidate.id === stage.eventId);
      const eventDetail = eventDetails.find((candidate) => candidate.eventId === stage.eventId);
      const person = people.find((candidate) => candidate.id === stage.personId);

      expect(capital, stage.polityId).toMatchObject({ placeId: 'kaifeng' });
      expect(polity?.capitalPhases.some((phase) => phase.placeId === 'kaifeng' && phase.validFrom === stage.from && phase.validTo === stage.to), stage.polityId).toBe(true);
      expect(polity?.heritageIds, stage.polityId).toContain(stage.heritageId);
      expect(polity?.eventIds, stage.polityId).toContain(stage.eventId);
      expect(asset, stage.heritageId).toMatchObject({ placeId: 'kaifeng' });
      expect(heritageDetail, stage.heritageId).toBeDefined();
      expect(heritageDetail?.associatedPolities, stage.heritageId).toContain(stage.polityId);
      expect(heritageDetail?.associatedEvents, stage.heritageId).toContain(stage.eventId);
      expect(heritageDetail?.associatedPeople, stage.heritageId).toContain(stage.personId);
      expect(event, stage.eventId).toMatchObject({ placeId: 'kaifeng' });
      expect(eventDetail?.locationIds, stage.eventId).toContain('kaifeng');
      expect(person, stage.personId).toBeDefined();
    }
  });

  it('exposes the same sequence in city timeline and polity study views', () => {
    const timeline = buildCityHistoryTimeline('kaifeng', data);
    const timelineEntityKeys = new Set(timeline.nodes.map((node) => `${node.entity.type}:${node.entity.id}`));

    expect(timeline.city?.modernName).toBe('开封市');
    expect(timeline.missingData).not.toContain('暂无已收录政权历史层');
    expect(timeline.missingData).not.toContain('暂无已收录遗产');
    for (const stage of stages) {
      expect(timelineEntityKeys.has(`polity:${stage.polityId}`), stage.polityId).toBe(true);
      expect(timelineEntityKeys.has(`heritage:${stage.heritageId}`), stage.heritageId).toBe(true);
      const view = buildPolityStudyView(stage.polityId, stage.to, data);
      expect(view?.capitalPlaces.map((place) => place.id), stage.polityId).toContain('kaifeng');
      expect(view?.detailLinkedHeritage.map((asset) => asset.id), stage.polityId).toContain(stage.heritageId);
    }
  });
});
