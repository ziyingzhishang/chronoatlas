import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { eventTimeReview } from './event-time-review';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Jingnan termination closure', () => {
  it('records the 963 surrender as the Jingnan termination event', () => {
    const event = events.find((item) => item.id === 'jingnan-ended-963');
    const detail = eventDetails.find((item) => item.eventId === 'jingnan-ended-963');
    const review = eventTimeReview.find((item) => item.eventId === 'jingnan-ended-963');

    expect(event).toMatchObject({
      id: 'jingnan-ended-963',
      year: 963,
      placeId: 'jiangling',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'jingnan-ended-963',
      polityIds: expect.arrayContaining(['jingnan', 'song_northern']),
      locationIds: ['jiangling'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'gao-jichong' }),
      expect.objectContaining({ personId: 'zhao-kuangyin' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['jingnan-founded']));
    expect(review).toMatchObject({
      eventId: 'jingnan-ended-963',
      status: 'confirmed',
      expectedPrecision: 'year',
      timelineStrategy: 'year-marker',
    });
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects the last ruler, capital city and heritage succession', () => {
    const polity = getPolityDetail('jingnan');
    const person = people.find((item) => item.id === 'gao-jichong');
    const personDetail = getPersonDetail('gao-jichong');
    const heritage = heritageAssets.find((item) => item.id === 'jingnan-jiangling-city-site');
    const heritageDetail = getHeritageDetail('jingnan-jiangling-city-site');

    expect(person).toMatchObject({
      polityIds: ['jingnan'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(personDetail).toMatchObject({
      personId: 'gao-jichong',
      keyEvents: expect.arrayContaining(['jingnan-ended-963']),
    });
    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['gao-jixing', 'gao-jichong']),
      eventIds: expect.arrayContaining(['jingnan-founded', 'jingnan-ended-963']),
      heritageIds: expect.arrayContaining(['jingnan-jiangling-city-site']),
    });
    expect(heritage).toMatchObject({ placeId: 'jiangling', constructionFrom: 924, constructionTo: 963 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['jingnan-founded', 'jingnan-ended-963']),
      associatedPeople: expect.arrayContaining(['gao-jixing', 'gao-jichong', 'zhao-kuangyin']),
      associatedPolities: expect.arrayContaining(['jingnan', 'song_northern']),
    });
  });

  it('exposes succession, kinship, governance and transition relationships', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-gao-jichong-ruled-jingnan' }),
      expect.objectContaining({ id: 'claim-gao-jichong-participated-jingnan-ended-963' }),
      expect.objectContaining({ id: 'claim-gao-jichong-submitted-to-zhao-kuangyin-termination-963' }),
      expect.objectContaining({ id: 'claim-gao-jichong-child-gao-baorong' }),
      expect.objectContaining({ id: 'claim-gao-jichong-sibling-gao-baoxu' }),
    ]));
  });
});
