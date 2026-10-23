import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polityDetails } from './polity-details';
import { sourceById } from './sources';

describe('永历政权终结的昆明—阿瓦分层闭环', () => {
  it('keeps Kunming as the city endpoint and Ava as a regional capture-stage reference', () => {
    const kunming = places.find((item) => item.id === 'kunming');
    const ava = places.find((item) => item.id === 'ava');
    const event = events.find((item) => item.id === 'yongli-regime-ended-1662');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const wuSangui = people.find((item) => item.id === 'wu-sangui');
    const zhuYoulang = personDetails.find((item) => item.personId === 'zhu-youlang');
    const southernMing = polityDetails.find((item) => item.polityId === 'ming_southern');

    expect(kunming).toMatchObject({ id: 'kunming', modernName: '昆明市', mappingStatus: 'exact', pointType: 'modern-city-centre' });
    expect(ava).toMatchObject({ id: 'ava', mappingStatus: 'regional', pointType: 'regional-reference' });
    expect(event).toMatchObject({ id: 'yongli-regime-ended-1662', year: 1662, placeId: 'kunming', datePrecision: 'year' });
    expect(event?.locationPrecision).toBe('approximate');
    expect(detail?.locationIds).toEqual(['ava', 'kunming']);
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'zhu-youlang', relationType: 'direct' }),
      expect.objectContaining({ personId: 'wu-sangui', relationType: 'direct' }),
    ]));
    expect(wuSangui).toMatchObject({ id: 'wu-sangui', polityIds: ['qing'] });
    expect(zhuYoulang?.keyEvents).toContain('yongli-regime-ended-1662');
    expect(southernMing?.eventIds).toContain('yongli-regime-ended-1662');
    expect(sourceById['southern-ming-yongli']).toBeDefined();
    expect(sourceById['ming-shi-vol120-southern-ming']).toBeDefined();
  });

  it('records both people as event participants without collapsing capture, transport, and termination into one exact place', () => {
    const eventClaims = claims.filter((claim) => claim.objectId === 'yongli-regime-ended-1662');

    expect(eventClaims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'zhu-youlang', predicate: 'participated-in', validFrom: 1662, validTo: 1662 }),
      expect.objectContaining({ subjectId: 'wu-sangui', predicate: 'participated-in', validFrom: 1662, validTo: 1662 }),
    ]));
    expect(people.find((item) => item.id === 'wu-sangui')?.polityIds).not.toContain('ming_southern');
    expect(eventDetails.filter((item) => item.eventId === 'yongli-regime-ended-1662')).toHaveLength(1);
    expect(eventDetails.find((item) => item.eventId === 'yongli-regime-ended-1662')?.uncertaintyNote)
      .toContain('具体');
  });
});
