import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails, getEventDetail } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { polities } from './polities';
import { sourceById, sourceNotes } from './sources';

const terminationEvents = [
  { id: 'western-qin-surrendered-later-qin-400', year: 400, placeId: 'jincheng' },
  { id: 'western-qin-restored-409', year: 409, placeId: 'jincheng' },
  { id: 'western-qin-ended-431', year: 431, placeId: 'fuhan' },
] as const;

describe('Western Qin termination closure', () => {
  it('keeps surrender, restoration, and final destruction as separate sourced year events', () => {
    for (const expected of terminationEvents) {
      const event = events.find((item) => item.id === expected.id);
      const detail = getEventDetail(expected.id);
      const review = eventTimeReview.find((item) => item.eventId === expected.id);

      expect(event).toMatchObject({
        id: expected.id,
        year: expected.year,
        placeId: expected.placeId,
        datePrecision: 'year',
      });
      expect(detail).toMatchObject({
        eventId: expected.id,
        polityIds: expect.arrayContaining(['western_qin']),
        locationIds: expect.arrayContaining([expected.placeId]),
      });
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(review).toMatchObject({ eventId: expected.id, status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
    }

    expect(events.filter((event) => event.id.startsWith('western-qin-') && [400, 409, 431].includes(event.year))).toHaveLength(3);
    expect(new Set(terminationEvents.map(({ id }) => id)).size).toBe(terminationEvents.length);
  });

  it('connects Later Qin and Xia succession without merging Western Qin stages', () => {
    expect(getEventDetail('western-qin-surrendered-later-qin-400')?.polityIds).toEqual(expect.arrayContaining(['western_qin', 'later_qin']));
    expect(getEventDetail('western-qin-restored-409')?.relatedEventIds).toEqual(expect.arrayContaining(['western-qin-surrendered-later-qin-400']));
    expect(getEventDetail('western-qin-ended-431')?.polityIds).toEqual(expect.arrayContaining(['western_qin', 'xia']));
    expect(getEventDetail('western-qin-ended-431')?.relatedEventIds).toEqual(expect.arrayContaining(['western-qin-restored-409']));

    const polity = getPolityDetail('western_qin');
    expect(polity).toMatchObject({
      eventIds: expect.arrayContaining([
        'western-qin-founded',
        'western-qin-surrendered-later-qin-400',
        'western-qin-restored-409',
        'western-qin-ended-431',
      ]),
      heritageIds: expect.arrayContaining(['western-qin-yuanchuan-city-candidate']),
    });
    expect(polity?.turningPoints.map((point) => point.year)).toEqual(expect.arrayContaining([385, 400, 409, 431]));
  });

  it('records the last ruler, transition figures, offices, and person-event relations', () => {
    expect(people.find((person) => person.id === 'qifu-mumo')).toMatchObject({
      name: '乞伏暮末',
      polityIds: ['western_qin'],
      roles: expect.arrayContaining(['末代统治者']),
    });
    expect(people.find((person) => person.id === 'helian-ding')).toMatchObject({ polityIds: ['xia'] });
    expect(getPersonDetail('qifu-mumo')).toMatchObject({
      personId: 'qifu-mumo',
      keyEvents: expect.arrayContaining(['western-qin-ended-431']),
      offices: expect.arrayContaining([expect.objectContaining({ validFrom: 428, validTo: 431, datePrecision: 'range' })]),
    });
    expect(getPersonDetail('helian-ding')?.keyEvents).toContain('western-qin-ended-431');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-qifu-gangui-participated-western-qin-surrendered-later-qin-400' }),
      expect.objectContaining({ id: 'claim-qifu-gangui-enemy-yao-xing-western-qin-surrender-400' }),
      expect.objectContaining({ id: 'claim-qifu-gangui-participated-western-qin-restored-409' }),
      expect.objectContaining({ id: 'claim-qifu-mumo-ruled-western-qin-termination-431' }),
      expect.objectContaining({ id: 'claim-qifu-mumo-participated-western-qin-ended-431' }),
      expect.objectContaining({ id: 'claim-qifu-mumo-enemy-helian-ding-termination-431' }),
    ]));
  });

  it('keeps capital stages and the Yuanchuan/Jincheng heritage reference modern-place traceable', () => {
    const capitals = capitalHistory.filter((record) => record.polityId === 'western_qin');
    expect(capitals).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'jincheng', validFrom: 385, validTo: 400 }),
      expect.objectContaining({ placeId: 'guzang', validFrom: 409, validTo: 431 }),
    ]));
    for (const capital of capitals) {
      expect(places.some((place) => place.id === capital.placeId), capital.placeId).toBe(true);
      expect(capital.sourceIds.every((sourceId) => sourceById[sourceId]), capital.placeId).toBe(true);
      expect(capital.notes).toContain('现代');
    }

    const heritage = heritageAssets.find((asset) => asset.id === 'western-qin-yuanchuan-city-candidate');
    const detail = getHeritageDetail('western-qin-yuanchuan-city-candidate');
    expect(heritage).toMatchObject({ placeId: 'jincheng', modernStatus: 'uncertain', constructionFrom: 385, constructionTo: 431 });
    expect(detail).toMatchObject({
      associatedPolities: expect.arrayContaining(['western_qin', 'later_qin', 'xia']),
      associatedEvents: expect.arrayContaining([
        'western-qin-founded',
        'western-qin-surrendered-later-qin-400',
        'western-qin-restored-409',
        'western-qin-ended-431',
      ]),
      associatedPeople: expect.arrayContaining(['qifu-gangui', 'qifu-mumo', 'yao-xing', 'helian-ding']),
    });
  });

  it('has no duplicate IDs or orphaned closure references', () => {
    const entityIds = new Set([...people, ...events, ...polities].map((item) => item.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const closureClaims = claims.filter((claim) => claim.id.includes('western-qin') || claim.subjectId === 'qifu-mumo');

    expect(validateClaims(closureClaims, entityIds)).toEqual([]);
    expect(new Set(terminationEvents.map(({ id }) => id)).size).toBe(terminationEvents.length);
    expect(new Set(terminationEvents.flatMap(({ id }) => [id])).size).toBe(terminationEvents.length);
    for (const event of events.filter((item) => terminationEvents.some(({ id }) => id === item.id))) {
      expect(event.sourceIds.every((sourceId) => sourceIds.has(sourceId)), event.id).toBe(true);
      expect(eventDetails.some((detail) => detail.eventId === event.id), event.id).toBe(true);
    }
    for (const claim of closureClaims) {
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(entityIds.has(claim.subjectId), claim.id).toBe(true);
      if (claim.objectId) expect(entityIds.has(claim.objectId), `${claim.id} -> ${claim.objectId}`).toBe(true);
      expect(claim.validFrom).toEqual(expect.any(Number));
      expect(claim.validTo).toEqual(expect.any(Number));
    }
  });
});
