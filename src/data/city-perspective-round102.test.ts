import { describe, expect, it } from 'vitest';
import { buildCityHistoryTimeline } from '../domain/city-timeline';
import { buildCityStudyView } from '../domain/study-view';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { claims } from './claims';

const data = { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory };

describe('round 102 city perspective closure: Zhangye', () => {
  it('connects the modern city, Northern Liang capital phase, formation event and heritage layer', () => {
    const city = places.find((item) => item.id === 'zhangye');
    const capital = capitalHistory.find((term) => term.polityId === 'northern_liang' && term.placeId === 'zhangye');
    const event = events.find((item) => item.id === 'northern-liang-founded');
    const eventDetail = eventDetails.find((item) => item.eventId === event?.id);
    const heritage = heritageAssets.find((item) => item.id === 'zhangye-northern-liang-city-layer');
    const heritageDetail = getHeritageDetail(heritage?.id ?? '');

    expect(city).toEqual(expect.objectContaining({ modernName: '张掖市' }));
    expect(capital).toEqual(expect.objectContaining({ validFrom: 397, validTo: 400, role: 'primary', status: 'formal', confidence: 'high' }));
    expect(event).toEqual(expect.objectContaining({ placeId: 'zhangye', year: 397 }));
    expect(eventDetail).toEqual(expect.objectContaining({ locationIds: expect.arrayContaining(['zhangye']), polityIds: expect.arrayContaining(['northern_liang']) }));
    expect(heritage).toEqual(expect.objectContaining({ placeId: 'zhangye', constructionFrom: 397, constructionTo: 400 }));
    expect(heritageDetail).toEqual(expect.objectContaining({ associatedPolities: expect.arrayContaining(['northern_liang']), associatedEvents: expect.arrayContaining(['northern-liang-founded']) }));
  });

  it('exposes the complete chain in both city study and history timeline views', () => {
    const study = buildCityStudyView('zhangye', Number.POSITIVE_INFINITY, data);
    const timeline = buildCityHistoryTimeline('zhangye', data);

    expect(study?.subject.modernName).toBe('张掖市');
    expect(study?.polities.map((item) => item.id)).toContain('northern_liang');
    expect(study?.events.map((item) => item.id)).toContain('northern-liang-founded');
    expect(study?.heritage.map((item) => item.id)).toContain('zhangye-northern-liang-city-layer');
    expect(timeline.missingData).not.toContain('暂无已收录遗产');
    expect(timeline.nodes.map((node) => node.entity)).toEqual(expect.arrayContaining([
      { type: 'place', id: 'zhangye' },
      { type: 'polity', id: 'northern_liang' },
      { type: 'event', id: 'northern-liang-founded' },
      { type: 'heritage', id: 'zhangye-northern-liang-city-layer' },
    ]));
  });
});
