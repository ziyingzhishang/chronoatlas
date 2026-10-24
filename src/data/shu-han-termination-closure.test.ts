import { describe, expect, test } from 'vitest';
import { eventTimeReview } from './event-time-review';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const terminationEventId = 'shu-han-ended-263';
const heritageId = 'shu-han-chengdu-city-site';

describe('Shu Han termination closure', () => {
  test('records the 263 Chengdu termination with a year-level uncertainty boundary', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);
    const review = eventTimeReview.find((item) => item.eventId === terminationEventId);

    expect(event).toMatchObject({
      year: 263,
      placeId: 'chengdu',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: terminationEventId,
      polityIds: ['shu_three', 'wei_three'],
      locationIds: ['chengdu'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-chan' }),
      expect.objectContaining({ personId: 'deng-ai' }),
      expect.objectContaining({ personId: 'zhong-hui' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['shu-han-founded', 'three-kingdoms']));
    expect(review).toMatchObject({
      eventId: terminationEventId,
      status: 'confirmed',
      expectedPrecision: 'year',
      timelineStrategy: 'year-marker',
    });
    expect(detail?.uncertaintyNote).toContain('263');
    expect(detail?.uncertaintyNote).toContain('不等于');
  });

  test('links Liu Shan, Cao Wei succession, Chengdu capital, and heritage without conflating city continuity', () => {
    const polity = getPolityDetail('shu_three');
    const heritage = heritageAssets.find((item) => item.id === heritageId);
    const heritageDetail = getHeritageDetail(heritageId);

    expect(polity?.principalFigureIds).toEqual(expect.arrayContaining(['liu-bei', 'liu-chan']));
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 221, validTo: 263, role: 'primary', status: 'formal' }),
    ]));
    expect(polity?.eventIds).toContain(terminationEventId);
    expect(polity?.heritageIds).toContain(heritageId);
    expect(heritage).toMatchObject({ placeId: 'chengdu', constructionFrom: 221, constructionTo: 263 });
    expect(heritageDetail?.associatedEvents).toEqual(expect.arrayContaining(['shu-han-founded', terminationEventId]));
    expect(heritageDetail?.associatedPolities).toContain('shu_three');
    expect(heritageDetail?.uncertaintyNote).toContain('不等于');
  });

  test('exposes the last ruler and transition participants through person details and claims', () => {
    expect(people.find((person) => person.id === 'liu-chan')).toMatchObject({
      name: '刘禅',
      polityIds: expect.arrayContaining(['shu_three']),
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(getPersonDetail('liu-chan')).toMatchObject({
      personId: 'liu-chan',
      keyEvents: expect.arrayContaining([terminationEventId]),
    });
    expect(getPersonDetail('deng-ai')?.keyEvents).toContain(terminationEventId);
    expect(getPersonDetail('zhong-hui')?.keyEvents).toContain(terminationEventId);
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-liu-chan-ruled-shu-three' }),
      expect.objectContaining({ id: 'claim-liu-chan-participated-shu-han-ended-263', predicate: 'participated-in', objectId: terminationEventId }),
      expect.objectContaining({ id: 'claim-liu-chan-submitted-to-deng-ai-shu-han-termination-263', predicate: 'submitted-to', objectId: 'deng-ai' }),
      expect.objectContaining({ id: 'claim-deng-ai-participated-shu-han-ended-263', predicate: 'participated-in', objectId: terminationEventId }),
      expect.objectContaining({ id: 'claim-zhong-hui-participated-shu-han-ended-263', predicate: 'participated-in', objectId: terminationEventId }),
      expect.objectContaining({ id: 'claim-wei-three-succeeded-shu-three-263', subjectId: 'wei_three', predicate: 'succeeded', objectId: 'shu_three' }),
    ]));
  });

  test('keeps every Shu Han termination closure reference resolvable and sourced', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);
    const polity = getPolityDetail('shu_three');
    const heritageDetail = getHeritageDetail(heritageId);
    const linkedClaims = claims.filter((claim) => polity?.claimIds.includes(claim.id));
    const eventIds = new Set(events.map((item) => item.id));
    const personIds = new Set(people.map((item) => item.id));
    const polityIds = new Set(polities.map((item) => item.id));
    const placeIds = new Set(places.map((item) => item.id));
    const heritageIds = new Set(heritageAssets.map((item) => item.id));

    expect(event).toBeDefined();
    expect(detail).toBeDefined();
    expect(heritageDetail).toBeDefined();
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? []), ...(heritageDetail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
    for (const participant of detail?.participants ?? []) expect(personIds.has(participant.personId), participant.personId).toBe(true);
    for (const relatedEventId of detail?.relatedEventIds ?? []) expect(eventIds.has(relatedEventId), relatedEventId).toBe(true);
    for (const linkedPolityId of detail?.polityIds ?? []) expect(polityIds.has(linkedPolityId), linkedPolityId).toBe(true);
    for (const locationId of detail?.locationIds ?? []) expect(placeIds.has(locationId), locationId).toBe(true);
    for (const linkedEventId of heritageDetail?.associatedEvents ?? []) expect(eventIds.has(linkedEventId), linkedEventId).toBe(true);
    for (const linkedPolityId of heritageDetail?.associatedPolities ?? []) expect(polityIds.has(linkedPolityId), linkedPolityId).toBe(true);
    for (const linkedPersonId of heritageDetail?.associatedPeople ?? []) expect(personIds.has(linkedPersonId), linkedPersonId).toBe(true);
    for (const claim of linkedClaims) {
      expect(sourceById[claim.sourceIds[0]], claim.id).toBeDefined();
      expect(personIds.has(claim.subjectId) || polityIds.has(claim.subjectId), claim.id).toBe(true);
      if (claim.objectId) expect(eventIds.has(claim.objectId) || personIds.has(claim.objectId) || polityIds.has(claim.objectId) || heritageIds.has(claim.objectId), claim.id).toBe(true);
    }
  });
});
