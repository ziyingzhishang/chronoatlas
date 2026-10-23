import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { personDetails } from './person-details';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { sourceById } from './sources';

describe('新罗统一战争与庆州王京闭环', () => {
  it('periodizes the Jinseong–Wolseong capital record', () => {
    expect(capitalHistory.filter((item) => item.polityId === 'silla').map(({ placeId, validFrom, validTo }) => ({ placeId, validFrom, validTo }))).toEqual([
      { placeId: 'jincheng_silla', validFrom: -57, validTo: 100 },
      { placeId: 'wolseong_silla', validFrom: 101, validTo: 935 },
    ]);
    expect(places.find((place) => place.id === 'jincheng_silla')).toEqual(expect.objectContaining({
      mappingStatus: 'approximate',
      confidence: 'medium',
      modernName: '庆州市',
    }));
  });

  it('connects the core people to the event chain and relationship graph', () => {
    expect(people.filter((person) => person.polityIds?.includes('silla')).map((person) => person.id)).toEqual(expect.arrayContaining([
      'seondeok-silla', 'jindeok-silla', 'kim-chunchu', 'kim-yushin', 'munmu-silla', 'sinmun-silla', 'gyeongsun-silla',
    ]));
    expect(personDetails.find((detail) => detail.personId === 'kim-yushin')?.keyEvents).toEqual(expect.arrayContaining([
      'silla-tang-baekje-660', 'silla-tang-goguryeo-668', 'silla-tang-war-670-676',
    ]));
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'kim-chunchu', predicate: 'parent-of', objectId: 'munmu-silla' }),
      expect.objectContaining({ subjectId: 'kim-yushin', predicate: 'ally-of', objectId: 'kim-chunchu' }),
      expect.objectContaining({ subjectId: 'gyeongsun-silla', predicate: 'ruled', objectId: 'silla' }),
    ]));
  });

  it('exposes the alliance, unification-war, and termination events with source-backed details', () => {
    const ids = ['silla-tang-alliance-648', 'silla-tang-baekje-660', 'silla-tang-goguryeo-668', 'silla-tang-war-670-676', 'silla-ended-935'];
    for (const id of ids) {
      const event = events.find((item) => item.id === id);
      const detail = eventDetails.find((item) => item.eventId === id);
      expect(event, id).toBeDefined();
      expect(detail?.polityIds, id).toContain('silla');
      expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), id).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), id).toBe(true);
    }
  });

  it('keeps the heritage as a city-scale historical layer without the false Li Shimin edge', () => {
    const asset = heritageAssets.find((item) => item.id === 'silla-gyeongju-capital-site');
    const detail = heritageDetails.find((item) => item.heritageId === 'silla-gyeongju-capital-site');
    expect(asset?.sourceIds).toContain('silla-gyeongju-unesco');
    expect(detail?.associatedPeople).not.toContain('li-shimin');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['silla-tang-war-670-676', 'silla-ended-935']));
    expect(detail?.sourceIds).toContain('silla-gyeongju-unesco');
  });

  it('publishes the complete Silla closure from the polity detail', () => {
    const detail = getPolityDetail('silla');
    expect(detail?.principalFigureIds).toEqual(expect.arrayContaining(['kim-chunchu', 'kim-yushin', 'munmu-silla', 'gyeongsun-silla']));
    expect(detail?.eventIds).toContain('silla-ended-935');
    expect(detail?.heritageIds).toContain('silla-gyeongju-capital-site');
    expect(detail?.claimIds).toContain('claim-munmu-ruled-silla');
  });
});
