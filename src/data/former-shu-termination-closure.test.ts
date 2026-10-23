import { describe, expect, test } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Former Shu termination closure', () => {
  test('records the 925 Chengdu loss as the Former Shu termination event', () => {
    const event = events.find((item) => item.id === 'former-shu-ended-925');
    const detail = eventDetails.find((item) => item.eventId === 'former-shu-ended-925');
    expect(event).toMatchObject({ year: 925, placeId: 'chengdu', datePrecision: 'year' });
    expect(detail).toMatchObject({ eventId: 'former-shu-ended-925', polityIds: ['former_shu', 'tang_later'], locationIds: ['chengdu'] });
    expect(detail?.participants).toEqual(expect.arrayContaining([expect.objectContaining({ personId: 'wang-yan' }), expect.objectContaining({ personId: 'li-cunxu' })]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['former-shu-founded', 'later-shu-founded']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) expect(sourceById[sourceId], sourceId).toBeDefined();
  });

  test('keeps Chengdu heritage linked to Former Shu termination without conflating Later Shu', () => {
    const polity = getPolityDetail('former_shu');
    const heritage = heritageAssets.find((item) => item.id === 'former-shu-yongling');
    const detail = getHeritageDetail('former-shu-yongling');
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([expect.objectContaining({ placeId: 'chengdu', validFrom: 907, validTo: 925 })]));
    expect(polity?.eventIds).toContain('former-shu-ended-925');
    expect(polity?.heritageIds).toContain('former-shu-yongling');
    expect(heritage).toMatchObject({ placeId: 'chengdu', constructionFrom: 918 });
    expect(detail?.associatedEvents).toContain('former-shu-ended-925');
    expect(detail?.associatedPolities).toEqual(['former_shu']);
  });

  test('exposes Wang Yan as the last Former Shu ruler and Li Cunxu as the transition figure', () => {
    expect(people.find((person) => person.id === 'wang-yan')).toMatchObject({ polityIds: ['former_shu'] });
    expect(getPersonDetail('wang-yan')).toMatchObject({ personId: 'wang-yan', keyEvents: expect.arrayContaining(['former-shu-ended-925']) });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-wang-yan-ruled-former-shu' }),
      expect.objectContaining({ id: 'claim-wang-yan-participated-former-shu-ended-925' }),
      expect.objectContaining({ id: 'claim-wang-yan-enemy-li-cunxu-termination-925' }),
    ]));
  });
});
