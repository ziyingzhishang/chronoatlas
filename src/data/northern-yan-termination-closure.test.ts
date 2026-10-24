import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const terminationEventId = 'northern-yan-ended-436';

describe('Northern Yan termination closure', () => {
  test('records the 436 Longcheng termination and Northern Wei succession', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);

    expect(event).toMatchObject({
      id: terminationEventId,
      year: 436,
      placeId: 'longcheng',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: terminationEventId,
      polityIds: expect.arrayContaining(['northern_yan', 'wei_northern']),
      locationIds: expect.arrayContaining(['longcheng']),
      relatedEventIds: expect.arrayContaining(['northern-yan-founded']),
      participants: expect.arrayContaining([
        expect.objectContaining({ personId: 'feng-hong' }),
        expect.objectContaining({ personId: 'tuoba-tao' }),
      ]),
    });
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ startYear: 407, endYear: 407 }),
      expect.objectContaining({ startYear: 409, endYear: 409 }),
      expect.objectContaining({ startYear: 436, endYear: 436 }),
    ]));
  });

  test('connects the last ruler, succession claims, Longcheng heritage, and modern place reference', () => {
    const polity = getPolityDetail('northern_yan');
    const heritage = heritageAssets.find((item) => item.id === 'northern-yan-longcheng-tomb');
    const heritageDetail = getHeritageDetail('northern-yan-longcheng-tomb');
    const place = places.find((item) => item.id === 'longcheng');

    expect(polity?.eventIds).toContain(terminationEventId);
    expect(polity?.turningPoints).toEqual(expect.arrayContaining([
      expect.objectContaining({ year: 436, eventId: terminationEventId }),
    ]));
    expect(getPersonDetail('feng-hong')).toMatchObject({
      personId: 'feng-hong',
      keyEvents: expect.arrayContaining([terminationEventId]),
    });
    expect(heritage).toMatchObject({ placeId: 'longcheng', constructionFrom: 407, constructionTo: 436 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining([terminationEventId]),
      associatedPeople: expect.arrayContaining(['feng-hong']),
      associatedPolities: expect.arrayContaining(['northern_yan', 'wei_northern']),
    });
    expect(place).toMatchObject({
      aliases: expect.arrayContaining(['和龙']),
      modernName: '朝阳及和龙一带',
      mappingStatus: 'regional',
    });
  });

  test('adds audited relationship and source coverage without orphan references or invented day precision', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);
    const sourceIds = [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])];

    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'claim-feng-hong-participated-northern-yan-ended-436',
        subjectId: 'feng-hong',
        predicate: 'participated-in',
        objectId: terminationEventId,
        validFrom: 436,
        validTo: 436,
        datePrecision: 'year',
      }),
      expect.objectContaining({
        id: 'claim-tuoba-tao-participated-northern-yan-ended-436',
        subjectId: 'tuoba-tao',
        predicate: 'participated-in',
        objectId: terminationEventId,
        validFrom: 436,
        validTo: 436,
        datePrecision: 'year',
      }),
      expect.objectContaining({
        id: 'claim-feng-hong-enemy-tuoba-tao-termination-436',
        subjectId: 'feng-hong',
        predicate: 'enemy-of',
        objectId: 'tuoba-tao',
        validFrom: 436,
        validTo: 436,
        datePrecision: 'year',
      }),
    ]));
    expect(sourceIds).toContain('zizhi-tongjian-vol123-northern-yan');
    expect(sourceIds.every((sourceId) => sourceNotes.some((source) => source.id === sourceId))).toBe(true);
    expect(event?.datePrecision).not.toBe('day');
    expect(detail?.sourceIds.every((sourceId) => sourceNotes.some((source) => source.id === sourceId))).toBe(true);
  });

  test('keeps all closure references resolvable and IDs unique', () => {
    const eventIds = new Set(events.map((item) => item.id));
    const polityIds = new Set(polities.map((item) => item.id));
    const personIds = new Set(people.map((item) => item.id));
    const placeIds = new Set(places.map((item) => item.id));
    const sourceIds = new Set(sourceNotes.map((item) => item.id));

    expect(eventIds.size).toBe(events.length);
    expect(new Set(claims.map((item) => item.id)).size).toBe(claims.length);
    expect(new Set(heritageAssets.map((item) => item.id)).size).toBe(heritageAssets.length);
    expect(eventIds.has(terminationEventId)).toBe(true);
    expect(['northern_yan', 'wei_northern'].every((id) => polityIds.has(id))).toBe(true);
    expect(['feng-hong', 'tuoba-tao'].every((id) => personIds.has(id))).toBe(true);
    expect(placeIds.has('longcheng')).toBe(true);
    expect(sourceIds.has('zizhi-tongjian-vol123-northern-yan')).toBe(true);
  });
});
