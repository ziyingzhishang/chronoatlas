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
import { polities } from './polities';
import { places } from './places';
import { sourceById, sourceNotes } from './sources';

const terminationEventId = 'western-liang-ended-421';
const closureClaimIds = [
  'claim-li-xin-ruled-western-liang-closure',
  'claim-li-xin-participated-western-liang-ended-421',
  'claim-li-xin-enemy-juqu-mengxun-termination-421',
  'claim-juqu-mengxun-participated-western-liang-ended-421',
  'claim-northern-liang-succeeded-western-liang-421',
];

describe('Western Liang termination closure', () => {
  it('records the 421 Jiuquan termination and Northern Liang succession', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = getEventDetail(terminationEventId);
    const review = eventTimeReview.find((item) => item.eventId === terminationEventId);

    expect(event).toMatchObject({
      id: terminationEventId,
      year: 421,
      placeId: 'jiuquan',
      datePrecision: 'year',
    });
    expect(detail).toMatchObject({
      eventId: terminationEventId,
      polityIds: expect.arrayContaining(['western_liang', 'northern_liang']),
      locationIds: expect.arrayContaining(['jiuquan']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['li-xin', 'juqu-mengxun']),
    );
    expect(review).toMatchObject({
      eventId: terminationEventId,
      status: 'confirmed',
      expectedPrecision: 'year',
      timelineStrategy: 'year-marker',
    });
  });

  it('keeps the 400—404 Dunhuang and 405—421 Jiuquan capital phases distinct', () => {
    const capitals = capitalHistory.filter((record) => record.polityId === 'western_liang');
    expect(capitals).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'dunhuang', validFrom: 400, validTo: 404 }),
      expect.objectContaining({ placeId: 'jiuquan', validFrom: 405, validTo: 421 }),
    ]));
    expect(capitals).toHaveLength(2);
    expect(places.find((place) => place.id === 'dunhuang')).toMatchObject({ modernAdministrativeUnit: '甘肃省酒泉市敦煌市' });
    expect(places.find((place) => place.id === 'jiuquan')).toMatchObject({ modernAdministrativeUnit: '甘肃省酒泉市' });
    expect(getPolityDetail('western_liang')).toMatchObject({
      eventIds: expect.arrayContaining(['western-liang-state-founded', terminationEventId]),
      heritageIds: expect.arrayContaining(['dunhuang-western-liang-city-site', 'jiuquan-western-liang-city-site']),
      principalFigureIds: expect.arrayContaining(['li-hao', 'li-xin']),
    });
  });

  it('connects Li Hao, Li Xin, Juqu Mengxun, people details, heritage, and sources', () => {
    expect(people.find((person) => person.id === 'li-hao')).toMatchObject({ polityIds: ['western_liang'] });
    expect(people.find((person) => person.id === 'li-xin')).toMatchObject({
      name: '李歆',
      polityIds: ['western_liang'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(getPersonDetail('li-hao')?.keyEvents).toEqual(expect.arrayContaining(['western-liang-state-founded']));
    expect(getPersonDetail('li-xin')).toMatchObject({
      keyEvents: expect.arrayContaining([terminationEventId]),
      offices: expect.arrayContaining([
        expect.objectContaining({ polityId: 'western_liang', placeId: 'jiuquan', validFrom: 417, validTo: 421, datePrecision: 'range' }),
      ]),
    });

    const dunhuang = getHeritageDetail('dunhuang-western-liang-city-site');
    const jiuquan = getHeritageDetail('jiuquan-western-liang-city-site');
    expect(dunhuang?.associatedEvents).toEqual(expect.arrayContaining(['western-liang-state-founded', terminationEventId]));
    expect(jiuquan).toMatchObject({
      associatedPolities: expect.arrayContaining(['western_liang', 'northern_liang']),
      associatedEvents: expect.arrayContaining([terminationEventId]),
      associatedPeople: expect.arrayContaining(['li-xin', 'juqu-mengxun']),
    });
    expect(heritageAssets.find((asset) => asset.id === 'jiuquan-western-liang-city-site')).toMatchObject({
      placeId: 'jiuquan',
      constructionFrom: 405,
      constructionTo: 421,
    });
  });

  it('publishes bounded closure relations without conflating other Liang polities', () => {
    const closureClaims = closureClaimIds.map((id) => claims.find((claim) => claim.id === id));
    expect(closureClaims.every(Boolean)).toBe(true);
    expect(closureClaims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'li-xin', predicate: 'ruled', objectId: 'western_liang', validFrom: 417, validTo: 421 }),
      expect.objectContaining({ subjectId: 'li-xin', predicate: 'participated-in', objectId: terminationEventId, validFrom: 421, validTo: 421 }),
      expect.objectContaining({ subjectId: 'li-xin', predicate: 'enemy-of', objectId: 'juqu-mengxun', validFrom: 421, validTo: 421 }),
      expect.objectContaining({ subjectId: 'juqu-mengxun', predicate: 'participated-in', objectId: terminationEventId, validFrom: 421, validTo: 421 }),
      expect.objectContaining({ subjectId: 'northern_liang', predicate: 'succeeded', objectId: 'western_liang', validFrom: 421, validTo: 421 }),
    ]));
    expect(closureClaims.some((claim) => claim?.objectId === 'southern_liang' || claim?.objectId === 'former_liang')).toBe(false);
    expect(getPolityDetail('southern_liang')?.eventIds).not.toContain(terminationEventId);
    expect(getPolityDetail('former_liang')?.eventIds).not.toContain(terminationEventId);
  });

  it('has sourced, time-bounded, unique, and non-orphaned closure references', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = getEventDetail(terminationEventId);
    const entityIds = new Set([...people, ...events, ...polities].map((item) => item.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const closureClaims = claims.filter((claim) => closureClaimIds.includes(claim.id));
    expect(validateClaims(closureClaims, entityIds)).toEqual([]);
    expect(new Set(closureClaimIds).size).toBe(closureClaimIds.length);
    expect(closureClaims).toHaveLength(closureClaimIds.length);
    expect(event?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(detail?.relatedEventIds.every((eventId) => events.some((candidate) => candidate.id === eventId))).toBe(true);
    for (const claim of closureClaims) {
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.validFrom).toEqual(expect.any(Number));
      expect(claim.validTo).toEqual(expect.any(Number));
    }
    for (const assetId of ['dunhuang-western-liang-city-site', 'jiuquan-western-liang-city-site']) {
      const asset = heritageAssets.find((candidate) => candidate.id === assetId);
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), assetId).toBe(true);
    }
  });
});
