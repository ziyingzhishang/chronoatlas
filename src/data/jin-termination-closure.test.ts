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

describe('Jin termination closure', () => {
  it('connects the 1234 termination event to its people, city and sources', () => {
    const event = events.find((item) => item.id === 'jin-ended-1234');
    const detail = eventDetails.find((item) => item.eventId === 'jin-ended-1234');
    const review = eventTimeReview.find((item) => item.eventId === 'jin-ended-1234');

    expect(event).toMatchObject({ year: 1234, placeId: 'kaifeng', datePrecision: 'approximate' });
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['jin_jurchen', 'mongol']));
    expect(detail?.locationIds).toContain('kaifeng');
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['wanyan-shouxu', 'ogedei']));
    expect(review).toMatchObject({ status: 'approximate', expectedPrecision: 'approximate', timelineStrategy: 'approximate-marker' });
  });

  it('keeps Jin capitals and Kaifeng heritage layered after polity termination', () => {
    const polity = polityDetails.find((item) => item.polityId === 'jin_jurchen');
    const asset = heritageAssets.find((item) => item.id === 'jin-kaifeng-city-layer');
    const heritage = heritageDetails.find((item) => item.heritageId === 'jin-kaifeng-city-layer');

    expect(polity?.principalFigureIds).toContain('wanyan-shouxu');
    expect(polity?.eventIds).toContain('jin-ended-1234');
    expect(polity?.capitalPhases.find((phase) => phase.placeId === 'kaifeng')).toMatchObject({ validFrom: 1214, validTo: 1234, role: 'primary', status: 'actual' });
    expect(polity?.heritageIds).toContain('jin-kaifeng-city-layer');
    expect(asset).toMatchObject({ placeId: 'kaifeng', constructionFrom: 1214, constructionTo: 1234 });
    expect(heritage?.associatedPeople).toContain('wanyan-shouxu');
    expect(heritage?.associatedEvents).toContain('jin-ended-1234');
  });

  it('adds the late Jin people and relation edges without attributing the whole conquest to one person', () => {
    expect(people.find((item) => item.id === 'wanyan-shouxu')).toBeDefined();
    expect(people.find((item) => item.id === 'ogedei')).toBeDefined();
    expect(personDetails.find((item) => item.personId === 'wanyan-shouxu')?.keyEvents).toContain('jin-ended-1234');
    expect(personDetails.find((item) => item.personId === 'ogedei')?.keyEvents).toContain('jin-ended-1234');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'wanyan-shouxu', predicate: 'ruled', objectId: 'jin_jurchen' }),
      expect.objectContaining({ subjectId: 'wanyan-shouxu', predicate: 'participated-in', objectId: 'jin-ended-1234' }),
      expect.objectContaining({ subjectId: 'wanyan-shouxu', predicate: 'enemy-of', objectId: 'ogedei' }),
    ]));
  });
});
