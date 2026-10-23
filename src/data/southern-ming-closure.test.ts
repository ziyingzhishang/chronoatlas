import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { eventTimeReview } from './event-time-review';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { personDetails } from './person-details';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const stages = [
  { eventId: 'hongguang-nanjing-founded', placeId: 'yingtian', heritageId: 'nanming-yingtian-imperial-city', personIds: ['zhu-yousong', 'shi-kefa'] },
  { eventId: 'longwu-fuzhou-founded', placeId: 'fuzhou', heritageId: 'nanming-fuzhou-xinggong-site', personIds: ['zhu-yujian', 'zheng-zhi-long', 'huang-daozhou'] },
  { eventId: 'shaowu-guangzhou-founded', placeId: 'guangzhou', heritageId: 'shaowu-junchen-tomb', personIds: ['zhu-yuyue', 'su-guansheng'] },
  { eventId: 'yongli-zhaoqing-founded', placeId: 'zhaoqing', heritageId: 'nanming-yongli-zhaoqing-palace', personIds: ['zhu-youlang', 'qu-shisi'] },
] as const;

describe('Southern Ming stage closure', () => {
  it('keeps the composite 1644 node approximate while exposing four dated stage events', () => {
    const composite = events.find((event) => event.id === 'southern-ming-founded');

    expect(composite).toMatchObject({ year: 1644, datePrecision: 'approximate', verification: 'partial' });
    expect(composite?.process).toContain('不虚构一个统一的南明建国日');
    expect(composite?.sourceIds).toEqual(expect.arrayContaining(['southern-ming-overview']));

    for (const stage of stages) {
      const event = events.find((candidate) => candidate.id === stage.eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === stage.eventId);
      const review = eventTimeReview.find((candidate) => candidate.eventId === stage.eventId);

      expect(event, stage.eventId).toMatchObject({
        datePrecision: 'year',
        verification: 'checked',
        sourceIds: expect.arrayContaining(['southern-ming-overview']),
      });
      expect(detail, stage.eventId).toMatchObject({
        polityIds: ['ming_southern'],
        locationIds: expect.arrayContaining([stage.placeId]),
        sourceIds: expect.arrayContaining(['southern-ming-overview']),
      });
      expect(detail?.participants.length, stage.eventId).toBeGreaterThan(0);
      expect(review, stage.eventId).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
    }
  });

  it('connects every stage to a modern capital place, heritage detail, people, claims and resolvable sources', () => {
    const stageEventIds = new Set(stages.map((stage) => stage.eventId));
    const stagePersonIds = new Set(stages.flatMap((stage) => stage.personIds));
    const stageHeritageIds = new Set(stages.map((stage) => stage.heritageId));
    const polity = getPolityDetail('ming_southern');

    expect(polities.some((polityItem) => polityItem.id === 'ming_southern')).toBe(true);
    expect(polity?.eventIds).toEqual(expect.arrayContaining([...stageEventIds]));
    expect(polity?.heritageIds).toEqual(expect.arrayContaining([...stageHeritageIds]));

    for (const stage of stages) {
      const place = places.find((candidate) => candidate.id === stage.placeId);
      const capital = capitalHistory.find((candidate) => candidate.polityId === 'ming_southern' && candidate.placeId === stage.placeId);
      const heritage = heritageAssets.find((candidate) => candidate.id === stage.heritageId);
      const heritageDetail = getHeritageDetail(stage.heritageId);

      expect(place, stage.placeId).toMatchObject({ modernName: expect.any(String), modernAdministrativeUnit: expect.any(String), mappingStatus: 'exact' });
      expect(capital, stage.placeId).toMatchObject({ polityId: 'ming_southern', placeId: stage.placeId, status: 'actual' });
      expect(heritage, stage.heritageId).toMatchObject({ placeId: stage.placeId, sourceIds: expect.arrayContaining(['southern-ming-overview']) });
      expect(heritageDetail, stage.heritageId).toMatchObject({
        associatedPolities: expect.arrayContaining(['ming_southern']),
        associatedEvents: expect.arrayContaining([stage.eventId]),
        sourceIds: expect.arrayContaining(['southern-ming-overview']),
      });
      for (const personId of stage.personIds) {
        expect(people.find((person) => person.id === personId), personId).toBeDefined();
        expect(personDetails.find((detail) => detail.personId === personId), personId).toBeDefined();
        expect(claims.some((claim) => claim.subjectId === personId && claim.objectId === stage.eventId), `${personId} -> ${stage.eventId}`).toBe(true);
      }
      for (const sourceId of [...(events.find((event) => event.id === stage.eventId)?.sourceIds ?? []), ...(eventDetails.find((detail) => detail.eventId === stage.eventId)?.sourceIds ?? [])]) {
        expect(sourceById[sourceId], sourceId).toBeDefined();
      }
    }
  });
});
