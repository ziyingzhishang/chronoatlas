import { describe, expect, it } from 'vitest';

import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const stages = [
  { heritageId: 'shu-han-chengdu-city-site', polityId: 'shu_three', eventIds: ['shu-han-founded', 'shu-han-ended-263'], personIds: ['liu-bei', 'liu-chan'] },
  { heritageId: 'cheng-han-chengdu-site', polityId: 'cheng_han', eventIds: ['cheng-han-founded', 'cheng-han-ended-347'], personIds: ['li-xiong', 'li-shi'] },
  { heritageId: 'former-shu-yongling', polityId: 'former_shu', eventIds: ['former-shu-founded', 'former-shu-ended-925'], personIds: ['wang-jian', 'wang-yan'] },
  { heritageId: 'later-shu-chengdu-city-site', polityId: 'later_shu', eventIds: ['later-shu-founded', 'later-shu-ended-965'], personIds: ['meng-zhixiang', 'meng-chang'] },
] as const;

describe('成都城市视角历史链审计', () => {
  it('keeps each high-confidence Chengdu stage connected to today, polity, event, people and sources', () => {
    expect(places.find((place) => place.id === 'chengdu')).toMatchObject({ modernName: '成都市' });

    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventById = new Map(events.map((event) => [event.id, event]));
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(Object.keys(sourceById));

    for (const stage of stages) {
      const asset = heritageAssets.find((item) => item.id === stage.heritageId);
      const detail = getHeritageDetail(stage.heritageId);

      expect(asset, stage.heritageId).toMatchObject({ placeId: 'chengdu' });
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), stage.heritageId).toBe(true);
      expect(detail, stage.heritageId).toBeDefined();
      expect(detail?.modernLocation, stage.heritageId).toContain('成都');
      expect(detail?.associatedPolities, stage.heritageId).toContain(stage.polityId);
      expect(detail?.associatedEvents, stage.heritageId).toEqual(expect.arrayContaining([...stage.eventIds]));
      expect(detail?.associatedPeople, stage.heritageId).toEqual(expect.arrayContaining([...stage.personIds]));
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), stage.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), stage.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site'), stage.heritageId).toBe(true);
      expect(detail?.historicalAssociations.length, stage.heritageId).toBeGreaterThan(0);
      expect(detail?.survivingFeatures.length, stage.heritageId).toBeGreaterThan(0);
      expect(detail?.presentDayValue, stage.heritageId).toBeTruthy();
      expect(polityIds.has(stage.polityId), stage.heritageId).toBe(true);
      for (const personId of stage.personIds) expect(peopleIds.has(personId), `${stage.heritageId}:${personId}`).toBe(true);
      for (const eventId of stage.eventIds) {
        expect(eventById.get(eventId), `${stage.heritageId}:${eventId}`).toMatchObject({ placeId: 'chengdu' });
        expect(eventById.get(eventId)?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${stage.heritageId}:${eventId}`).toBe(true);
      }
    }
  });
});
