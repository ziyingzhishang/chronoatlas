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
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { sourceById } from './sources';

const terminationEventIds = [
  'xiongnu-southern-northern-split-48',
  'xiongnu-northern-central-defeat-91',
  'xiongnu-termination-upper-bound-93',
];

describe('匈奴三层终止链闭环', () => {
  it('区分48年分裂、91年北匈奴中央受击与93年总目录终止上限', () => {
    const polity = polities.find((item) => item.id === 'xiongnu');
    expect(polity).toMatchObject({ id: 'xiongnu', endYear: 93 });

    expect(events.filter((item) => terminationEventIds.includes(item.id)).map((item) => [item.id, item.year])).toEqual([
      ['xiongnu-southern-northern-split-48', 48],
      ['xiongnu-northern-central-defeat-91', 91],
      ['xiongnu-termination-upper-bound-93', 93],
    ]);
    expect(eventDetails.find((item) => item.eventId === terminationEventIds[0])?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '南北匈奴分裂', startYear: 48, endYear: 48 }),
    ]));
    expect(eventDetails.find((item) => item.eventId === terminationEventIds[1])?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '北匈奴中央单于体系遭重击并北迁', startYear: 91, endYear: 91 }),
    ]));
    expect(eventDetails.find((item) => item.eventId === terminationEventIds[2])?.uncertaintyNote).toContain('不等于所有匈奴部众消失');
    for (const eventId of terminationEventIds) {
      expect(eventTimeReview.find((item) => item.eventId === eventId), eventId).toBeDefined();
    }
  });

  it('覆盖末期人物、单于体系关系与后续匈奴刘氏承接', () => {
    const latePeople = ['huhanye', 'zhizhi-chanyu', 'xiongnu-northern-chanyu-91', 'xiongnu-southern-chanyu-48', 'liu-yuan'];
    for (const personId of latePeople) {
      expect(people.find((person) => person.id === personId), personId).toBeDefined();
      expect(personDetails.find((detail) => detail.personId === personId), personId).toBeDefined();
    }
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'xiongnu-southern-chanyu-48', predicate: 'succeeded', objectId: 'xiongnu' }),
      expect.objectContaining({ subjectId: 'xiongnu-northern-chanyu-91', predicate: 'participated-in', objectId: 'xiongnu-northern-central-defeat-91' }),
      expect.objectContaining({ subjectId: 'liu-yuan', predicate: 'related-to', objectId: 'xiongnu' }),
      expect.objectContaining({ subjectId: 'liu-yuan', predicate: 'participated-in', objectId: 'xiongnu-termination-upper-bound-93' }),
    ]));
  });

  it('连接关键地点现代地名、遗产、来源与政权详情且无孤立引用', () => {
    const polityDetail = getPolityDetail('xiongnu');
    expect(polityDetail?.eventIds).toEqual(expect.arrayContaining(terminationEventIds));
    expect(polityDetail?.principalFigureIds).toEqual(expect.arrayContaining(['zhizhi-chanyu', 'xiongnu-northern-chanyu-91', 'xiongnu-southern-chanyu-48']));
    expect(places.find((place) => place.id === 'xiongnu-jinwei-mountains')).toMatchObject({ modernName: '阿尔泰山及其东南缘区域' });
    expect(places.find((place) => place.id === 'xiongnu-southern-frontier')).toMatchObject({ modernAdministrativeUnit: '中国内蒙古自治区河套及鄂尔多斯一带' });
    const heritageIds = ['xiongnu-southern-frontier-network', 'xiongnu-northern-steppe-network'];
    for (const heritageId of heritageIds) {
      const heritage = heritageAssets.find((item) => item.id === heritageId);
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      expect(heritage, heritageId).toBeDefined();
      expect(detail, heritageId).toBeDefined();
      for (const sourceId of [...(heritage?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) expect(sourceById[sourceId], sourceId).toBeDefined();
    }

    const entityIds = new Set([
      ...polities.map((item) => item.id), ...events.map((item) => item.id), ...people.map((item) => item.id),
      ...heritageAssets.map((item) => item.id), ...places.map((item) => item.id), ...Object.keys(sourceById),
    ]);
    for (const claim of claims.filter((claim) => terminationEventIds.includes(claim.objectId ?? '') || terminationEventIds.includes(claim.subjectId))) {
      expect(entityIds.has(claim.subjectId), claim.id).toBe(true);
      if (claim.objectId) expect(entityIds.has(claim.objectId), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      for (const sourceId of claim.sourceIds) expect(sourceById[sourceId], `${claim.id}:${sourceId}`).toBeDefined();
      if (claim.validFrom !== undefined && claim.validTo !== undefined) expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo);
    }
  });
});
