import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polityDetails } from './polity-details';
import { polities } from './polities';
import { sourceById } from './sources';

const terminationEventId = 'turkic-ended-744';
const revivalEventId = 'turkic-restored-682';
const closureClaimIds = [
  'claim-turkic-ended-744',
  'claim-kutlug-ruled-turkic-second',
  'claim-bilge-ruled-turkic-second',
  'claim-ozmish-participated-turkic-ended-744',
  'claim-basmyl-succeeded-turkic-744',
  'claim-turkic-left-orkhon-heritage-744',
];

describe('Turkic khaganate termination closure', () => {
  it('separates the First Khaganate, interregnum, Second Khaganate and 744 upper bound', () => {
    const detail = polityDetails.find((item) => item.polityId === 'turkic');
    const polity = polities.find((item) => item.id === 'turkic');

    expect(polity).toMatchObject({ id: 'turkic', startYear: 552, endYear: 744 });
    expect(detail?.periods).toEqual([
      expect.objectContaining({ id: 'first-khaganate', startYear: 552, endYear: 630, datePrecision: 'year' }),
      expect.objectContaining({ id: 'interregnum', startYear: 631, endYear: 681, datePrecision: 'range' }),
      expect.objectContaining({ id: 'second-khaganate', startYear: 682, endYear: 744, datePrecision: 'year' }),
    ]);
    expect(detail?.eventIds).toEqual(expect.arrayContaining([revivalEventId, terminationEventId]));
    expect(detail?.turningPoints).toEqual(expect.arrayContaining([
      expect.objectContaining({ year: 630, eventId: 'turkic-first-ended-630' }),
      expect.objectContaining({ year: 682, eventId: revivalEventId }),
      expect.objectContaining({ year: 744, eventId: terminationEventId }),
    ]));
  });

  it('records year precision and explicit termination phases', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);
    const timing = eventTimeReview.find((item) => item.eventId === terminationEventId);

    expect(event).toMatchObject({ year: 744, endYear: 744, datePrecision: 'year', placeId: 'uhtuken' });
    expect(detail).toMatchObject({
      polityIds: expect.arrayContaining(['turkic']),
      locationIds: expect.arrayContaining(['uhtuken']),
      relatedEventIds: expect.arrayContaining([revivalEventId]),
    });
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '后突厥汗国末期危机', startYear: 736, endYear: 743 }),
      expect.objectContaining({ label: '后突厥汗国终止上限', startYear: 744, endYear: 744 }),
      expect.objectContaining({ label: '拔悉密—回鹘承接', startYear: 744, endYear: 745 }),
    ]));
    expect(timing).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('covers late people, details, relations, mobile court, heritage and sources', () => {
    const latePeople = ['kutlug-ilterish', 'qapaghan', 'bilge-khagan', 'kul-tegin', 'ozmish-khagan', 'bayanchur'];
    for (const personId of latePeople) {
      expect(people.find((person) => person.id === personId), personId).toBeDefined();
      expect(personDetails.find((detail) => detail.personId === personId), personId).toBeDefined();
    }

    expect(people.find((person) => person.id === 'ozmish-khagan')).toMatchObject({ deathYear: 744, polityIds: ['turkic'] });
    expect(personDetails.find((detail) => detail.personId === 'bilge-khagan')?.keyEvents).toContain(revivalEventId);
    expect(places.find((place) => place.id === 'uhtuken')).toMatchObject({ pointType: 'mobile-centre', modernAdministrativeUnit: '蒙古国中部' });
    expect(heritageAssets.find((item) => item.id === 'orkhon-turkic-inscriptions')).toMatchObject({ placeId: 'uhtuken' });
    expect(heritageDetails.find((detail) => detail.heritageId === 'orkhon-turkic-inscriptions')).toMatchObject({
      associatedEvents: expect.arrayContaining([revivalEventId, terminationEventId]),
      associatedPeople: expect.arrayContaining(['bilge-khagan', 'kul-tegin']),
      associatedPolities: expect.arrayContaining(['turkic']),
    });
  });

  it('keeps closure claims sourced, bounded and free of isolated references', () => {
    const entityIds = new Set([
      ...polities.map((item) => item.id), ...events.map((item) => item.id), ...people.map((item) => item.id),
      ...heritageAssets.map((item) => item.id), ...places.map((item) => item.id), ...Object.keys(sourceById),
    ]);
    const closureClaims = claims.filter((claim) => closureClaimIds.includes(claim.id));
    expect(closureClaims.map((claim) => claim.id)).toEqual(expect.arrayContaining(closureClaimIds));

    for (const claim of closureClaims) {
      expect(entityIds.has(claim.subjectId), claim.subjectId).toBe(true);
      if (claim.objectId) expect(entityIds.has(claim.objectId), claim.objectId).toBe(true);
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of claim.sourceIds) expect(sourceById[sourceId], sourceId).toBeDefined();
      if (claim.validFrom !== undefined && claim.validTo !== undefined) expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo);
    }

    expect(closureClaims.find((claim) => claim.id === 'claim-turkic-ended-744')).toMatchObject({ validFrom: 744, validTo: 744, datePrecision: 'year' });
    expect(closureClaims.find((claim) => claim.id === 'claim-turkic-left-orkhon-heritage-744')).toMatchObject({ validFrom: 732, validTo: 744, datePrecision: 'range' });
  });
});
