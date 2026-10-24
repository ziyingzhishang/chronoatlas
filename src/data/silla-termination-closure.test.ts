import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const terminationEventId = 'silla-ended-935';
const closureClaimIds = [
  'claim-gyeongsun-participated-silla-ended',
  'claim-gyeongsun-submitted-to-goryeo-silla-termination-935',
];

describe('新罗政权终止闭环', () => {
  it('区分传统建国、统一新罗阶段与935年终局的时间边界', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);
    const review = eventTimeReview.find((item) => item.eventId === terminationEventId);
    const silla = polities.find((item) => item.id === 'silla');

    expect(event).toMatchObject({
      id: terminationEventId,
      year: 935,
      placeId: 'jincheng_silla',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: terminationEventId,
      polityIds: ['silla'],
      locationIds: ['jincheng_silla'],
    });
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '新罗归高丽', startYear: 935, endYear: 935 }),
      expect.objectContaining({ label: '高丽承接庆州王京与王族', startYear: 935, endYear: 978 }),
    ]));
    expect(review).toMatchObject({ eventId: terminationEventId, status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
    expect(silla).toMatchObject({ startYear: -57, endYear: 935 });
    expect(detail?.uncertaintyNote).toContain('不是庆州城市或新罗文化遗产的终止');
    expect(detail?.uncertaintyNote).toContain('前57年');
    expect(detail?.uncertaintyNote).toContain('统一新罗');
  });

  it('连接敬顺王、王建、后高丽与人物关系', () => {
    const lastRuler = people.find((item) => item.id === 'gyeongsun-silla');
    const personDetail = getPersonDetail('gyeongsun-silla');
    const sillaDetail = getPolityDetail('silla');

    expect(lastRuler).toMatchObject({ name: '敬顺王', deathYear: 978, polityIds: ['silla'] });
    expect(personDetail?.keyEvents).toContain(terminationEventId);
    expect(sillaDetail?.principalFigureIds).toContain('gyeongsun-silla');
    expect(sillaDetail?.eventIds).toContain(terminationEventId);
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-gyeongsun-participated-silla-ended', subjectId: 'gyeongsun-silla', objectId: terminationEventId }),
      expect.objectContaining({ id: 'claim-gyeongsun-submitted-to-goryeo-silla-termination-935', subjectId: 'gyeongsun-silla', predicate: 'submitted-to-goryeo' }),
    ]));
  });

  it('把庆州王京映射到今天地名与遗产，并保留终止后的城市连续性', () => {
    const place = places.find((item) => item.id === 'jincheng_silla');
    const heritage = heritageAssets.find((item) => item.id === 'silla-gyeongju-capital-site');
    const heritageDetail = getHeritageDetail('silla-gyeongju-capital-site');

    expect(place).toMatchObject({ historicalName: '金城／徐罗伐', modernName: '庆州市', modernAdministrativeUnit: '韩国庆尚北道庆州市' });
    expect(heritage).toMatchObject({ placeId: 'jincheng_silla', constructionFrom: -57, constructionTo: 935, modernStatus: 'archaeological-site' });
    expect(heritageDetail?.associatedEvents).toContain(terminationEventId);
    expect(heritageDetail?.uncertaintyNote).toContain('政权终止不等于城市遗产终止');
  });

  it('确保终止闭环的实体、来源、时间边界和引用没有孤立项', () => {
    const entityIds = new Set([
      ...polities.map((item) => item.id), ...events.map((item) => item.id), ...people.map((item) => item.id),
      ...heritageAssets.map((item) => item.id), ...places.map((item) => item.id), ...Object.keys(sourceById),
    ]);
    const closureClaims = claims.filter((claim) => closureClaimIds.includes(claim.id));

    expect(closureClaims.map((claim) => claim.id)).toEqual(expect.arrayContaining(closureClaimIds));
    for (const claim of closureClaims) {
      expect(entityIds.has(claim.subjectId), claim.id).toBe(true);
      if (claim.objectId) expect(entityIds.has(claim.objectId), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      for (const sourceId of claim.sourceIds) expect(sourceById[sourceId], `${claim.id}:${sourceId}`).toBeDefined();
      expect(claim.validFrom).toBe(935);
      expect(claim.validTo).toBe(935);
      expect(claim.datePrecision).toBe('year');
    }

    const event = events.find((item) => item.id === terminationEventId)!;
    const detail = eventDetails.find((item) => item.eventId === terminationEventId)!;
    for (const sourceId of [...event.sourceIds, ...detail.sourceIds]) expect(sourceById[sourceId], sourceId).toBeDefined();
    expect(detail.relatedEventIds).toEqual(expect.arrayContaining(['silla-founded', 'silla-tang-war-670-676']));
    expect(detail.relatedEventIds).not.toContain('goguryeo-moves-pyongyang');
  });
});
