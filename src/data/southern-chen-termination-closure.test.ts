import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { heritageAssets } from './heritage';
import { personDetails } from './person-details';
import { people } from './people';
import { polityDetails } from './polity-details';

describe('Southern Chen termination closure', () => {
  it('records an independent 589 Jiankang termination node', () => {
    const event = events.find((item) => item.id === 'southern-chen-ended-589');
    const detail = eventDetails.find((item) => item.eventId === 'southern-chen-ended-589');
    const review = eventTimeReview.find((item) => item.eventId === 'southern-chen-ended-589');

    expect(event).toMatchObject({ year: 589, placeId: 'jiankang', datePrecision: 'year' });
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['chen_southern', 'sui']));
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['chen-shubao', 'yang-jian']));
    expect(detail?.locationIds).toContain('jiankang');
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year' });
  });

  it('connects Chen Shubao, Jiankang heritage, and the polity perspective', () => {
    const polity = polityDetails.find((item) => item.polityId === 'chen_southern');
    const asset = heritageAssets.find((item) => item.id === 'jiankang-six-dynasties-city-site');
    const heritage = heritageDetails.find((item) => item.heritageId === 'jiankang-six-dynasties-city-site');

    expect(people.find((item) => item.id === 'chen-shubao')).toBeDefined();
    expect(personDetails.find((item) => item.personId === 'chen-shubao')?.keyEvents).toContain('southern-chen-ended-589');
    expect(asset?.placeId).toBe('jiankang');
    expect(heritage?.associatedPeople).toContain('chen-shubao');
    expect(heritage?.associatedEvents).toContain('southern-chen-ended-589');
    expect(polity?.eventIds).toContain('southern-chen-ended-589');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'chen-shubao', predicate: 'ruled', objectId: 'chen_southern' }),
      expect.objectContaining({ subjectId: 'chen-shubao', predicate: 'participated-in', objectId: 'southern-chen-ended-589' }),
      expect.objectContaining({ subjectId: 'chen-shubao', predicate: 'enemy-of', objectId: 'yang-jian' }),
    ]));
  });
});
