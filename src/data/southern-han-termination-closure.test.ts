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

describe('Southern Han termination closure', () => {
  it('records the 971 Guangzhou termination and Song succession', () => {
    const event = events.find((item) => item.id === 'southern-han-ended-971');
    const detail = eventDetails.find((item) => item.eventId === 'southern-han-ended-971');

    expect(event).toMatchObject({
      id: 'southern-han-ended-971',
      year: 971,
      placeId: 'guangzhou',
      datePrecision: 'year',
    });
    expect(detail).toMatchObject({
      eventId: 'southern-han-ended-971',
      polityIds: expect.arrayContaining(['southern_han', 'song_northern']),
      locationIds: ['guangzhou'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-chang' }),
      expect.objectContaining({ personId: 'zhao-kuangyin' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['southern-han-founded']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects the last ruler, Guangzhou capital, and heritage succession', () => {
    const polity = getPolityDetail('southern_han');
    const person = people.find((item) => item.id === 'liu-chang');
    const personDetail = getPersonDetail('liu-chang');
    const heritage = heritageAssets.find((item) => item.id === 'southern-han-king-mausoleum');
    const heritageDetail = getHeritageDetail('southern-han-king-mausoleum');

    expect(person).toMatchObject({
      polityIds: ['southern_han'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(personDetail).toMatchObject({
      personId: 'liu-chang',
      keyEvents: expect.arrayContaining(['southern-han-ended-971']),
    });
    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['liu-yan', 'liu-chang']),
      eventIds: expect.arrayContaining(['southern-han-ended-971']),
      heritageIds: expect.arrayContaining(['southern-han-king-mausoleum']),
    });
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'guangzhou', validFrom: 917, validTo: 971 }),
    ]));
    expect(heritage).toMatchObject({ placeId: 'guangzhou', constructionFrom: 917 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['southern-han-founded', 'southern-han-ended-971']),
      associatedPeople: expect.arrayContaining(['liu-yan', 'liu-chang']),
      associatedPolities: expect.arrayContaining(['southern_han', 'song_northern']),
    });
  });

  it('exposes governance, kinship, and opponent relationships for the terminal phase', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-liu-chang-ruled-southern-han' }),
      expect.objectContaining({ id: 'claim-liu-chang-participated-southern-han-ended-971' }),
      expect.objectContaining({ id: 'claim-liu-chang-enemy-zhao-kuangyin-termination-971' }),
      expect.objectContaining({ id: 'claim-liu-sheng-parent-liu-chang' }),
      expect.objectContaining({ id: 'claim-liu-chang-child-liu-sheng' }),
      expect.objectContaining({ id: 'claim-liu-yan-grandparent-liu-chang' }),
    ]));
  });
});
