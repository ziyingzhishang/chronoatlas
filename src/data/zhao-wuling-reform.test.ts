import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { personDetails } from './person-details';
import { polityDetails } from './polity-details';

describe('赵武灵王胡服骑射事件链', () => {
  it('connects the reform to Zhao Wuling, Zhao polity, Handan and Zhao Wang city without replacing foundation', () => {
    const event = events.find((item) => item.id === 'zhao-wuling-reforms-307');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const person = personDetails.find((item) => item.personId === 'zhao-wuling');
    const polity = polityDetails.find((item) => item.polityId === 'zhao_warring');
    const heritage = heritageDetails.find((item) => item.heritageId === 'zhao-wang-city-site');
    const claim = claims.find((item) => item.id === 'claim-zhao-wuling-participated-zhao-wuling-reforms-307');

    expect(event).toMatchObject({ year: -307, datePrecision: 'approximate', placeId: 'handan', verification: 'partial' });
    expect(detail).toMatchObject({ polityIds: ['zhao_warring'], locationIds: ['handan'] });
    expect(detail?.participants).toEqual([
      expect.objectContaining({ personId: 'zhao-wuling', relationType: 'direct' }),
    ]);
    expect(person?.keyEvents).toContain('zhao-wuling-reforms-307');
    expect(polity?.eventIds).toEqual(expect.arrayContaining(['zhao-warring-founded-eighth-batch', 'zhao-wuling-reforms-307']));
    expect(polity?.eventIds).not.toEqual(['zhao-wuling-reforms-307']);
    expect(heritage?.associatedEvents).toContain('zhao-wuling-reforms-307');
    expect(claim).toMatchObject({ subjectId: 'zhao-wuling', predicate: 'participated-in', objectId: 'zhao-wuling-reforms-307', validFrom: -307, validTo: -307 });
  });
});
