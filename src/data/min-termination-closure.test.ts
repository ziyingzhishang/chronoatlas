import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Min termination closure', () => {
  it('records the 945 Southern Tang conquest as the Min termination event', () => {
    const event = events.find((item) => item.id === 'min-ended-945');
    const detail = eventDetails.find((item) => item.eventId === 'min-ended-945');

    expect(event).toMatchObject({
      id: 'min-ended-945',
      year: 945,
      placeId: 'fuzhou',
      datePrecision: 'approximate',
    });
    expect(detail).toMatchObject({
      eventId: 'min-ended-945',
      polityIds: expect.arrayContaining(['min', 'southern_tang']),
      locationIds: ['fuzhou'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'wang-yanzheng' }),
      expect.objectContaining({ personId: 'li-jing' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['min-founded', 'southern-tang-conquers-min']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects the last ruler and Fuzhou heritage succession', () => {
    const polity = getPolityDetail('min');
    const person = people.find((item) => item.id === 'wang-yanzheng');
    const personDetail = getPersonDetail('wang-yanzheng');
    const heritage = heritageAssets.find((item) => item.id === 'min-wang-mausoleum');
    const heritageDetail = getHeritageDetail('min-wang-mausoleum');

    expect(person).toMatchObject({
      polityIds: ['min'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(personDetail).toMatchObject({
      personId: 'wang-yanzheng',
      keyEvents: expect.arrayContaining(['min-ended-945']),
    });
    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['wang-shenzhi', 'wang-yanzheng']),
      eventIds: expect.arrayContaining(['min-ended-945']),
      heritageIds: expect.arrayContaining(['min-wang-mausoleum']),
    });
    expect(heritage).toMatchObject({ placeId: 'fuzhou', constructionFrom: 925 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['min-founded', 'min-ended-945']),
      associatedPeople: expect.arrayContaining(['wang-shenzhi', 'wang-yanzheng', 'li-jing']),
      associatedPolities: expect.arrayContaining(['min', 'southern_tang']),
    });
  });

  it('exposes the last-ruler governance, kinship, and transition relationships', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-wang-yanzheng-ruled-min' }),
      expect.objectContaining({ id: 'claim-wang-yanzheng-participated-min-ended-945' }),
      expect.objectContaining({ id: 'claim-wang-yanzheng-enemy-li-jing-termination-945' }),
      expect.objectContaining({ id: 'claim-wang-yanzheng-sibling-wang-yenxi' }),
    ]));
  });
});
