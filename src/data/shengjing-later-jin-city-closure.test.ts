import { describe, expect, it } from 'vitest';

import { buildCityHistoryTimeline } from '../domain/city-timeline';
import { buildPolityStudyView } from '../domain/study-view';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { polityDetails } from './polity-details';
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

describe('盛京城市视角闭环：后金迁都阶段', () => {
  it('connects the Later Jin Shengjing capital phase to the existing palace-city heritage detail', () => {
    const place = places.find((candidate) => candidate.id === 'shengjing');
    const capital = capitalHistory.find((candidate) => (
      candidate.polityId === 'later_jin' && candidate.placeId === 'shengjing'
    ));
    const polityDetail = polityDetails.find((detail) => detail.polityId === 'later_jin');
    const asset = heritageAssets.find((candidate) => candidate.id === 'qing-shengjing-palace-city-site');
    const heritageDetail = getHeritageDetail('qing-shengjing-palace-city-site');

    expect(place).toMatchObject({ historicalName: '盛京', modernName: '沈阳市' });
    expect(capital).toMatchObject({ validFrom: 1626, validTo: 1636, role: 'primary', status: 'formal' });
    expect(polityDetail?.heritageIds).toContain('qing-shengjing-palace-city-site');
    expect(asset).toMatchObject({ placeId: 'shengjing', constructionFrom: 1625, constructionTo: 1644 });
    expect(heritageDetail).toMatchObject({
      associatedPolities: expect.arrayContaining(['later_jin', 'qing']),
      associatedEvents: expect.arrayContaining(['qing-founded', 'qing-enters-pass']),
    });
  });

  it('exposes the same closure in city timeline and polity study views', () => {
    const timeline = buildCityHistoryTimeline('shengjing', data);
    const polityView = buildPolityStudyView('later_jin', 1636, data);

    expect(timeline.missingData).not.toContain('暂无已收录政权历史层');
    expect(timeline.missingData).not.toContain('暂无已收录遗产');
    expect(timeline.nodes.map((node) => node.entity)).toEqual(expect.arrayContaining([
      { type: 'place', id: 'shengjing' },
      { type: 'polity', id: 'later_jin' },
      { type: 'heritage', id: 'qing-shengjing-palace-city-site' },
    ]));
    expect(polityView?.capitalPlaces.map((place) => place.id)).toContain('shengjing');
    expect(polityView?.detailLinkedHeritage.map((asset) => asset.id)).toContain('qing-shengjing-palace-city-site');
  });
});
