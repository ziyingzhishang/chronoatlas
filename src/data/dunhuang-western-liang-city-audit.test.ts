import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const stages = [
  { placeId: 'dunhuang', heritageId: 'dunhuang-western-liang-city-site', eventIds: ['western-liang-state-founded', 'western-liang-ended-421'], personIds: ['li-hao', 'li-xin'] },
  { placeId: 'jiuquan', heritageId: 'jiuquan-western-liang-city-site', eventIds: ['western-liang-state-founded', 'western-liang-ended-421'], personIds: ['li-hao', 'li-xin', 'juqu-mengxun'] },
] as const;

describe('西凉敦煌—酒泉城市视角历史链审计', () => {
  it('keeps the 400 formation and 405 relocation stages separated while preserving the modern city chain', () => {
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(places.find((place) => place.id === 'dunhuang')).toMatchObject({ modernName: '敦煌市' });
    expect(places.find((place) => place.id === 'jiuquan')).toMatchObject({ modernName: '酒泉市' });

    for (const stage of stages) {
      const asset = heritageAssets.find((candidate) => candidate.id === stage.heritageId);
      const detail = getHeritageDetail(stage.heritageId);

      expect(asset, stage.heritageId).toMatchObject({ placeId: stage.placeId });
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), stage.heritageId).toBe(true);
      expect(detail, stage.heritageId).toBeDefined();
      expect(detail?.modernLocation, stage.heritageId).toContain(stage.placeId === 'dunhuang' ? '敦煌' : '酒泉');
      expect(detail?.associatedPolities, stage.heritageId).toContain('western_liang');
      expect(detail?.associatedEvents, stage.heritageId).toEqual(expect.arrayContaining([...stage.eventIds]));
      expect(detail?.associatedPeople, stage.heritageId).toEqual(expect.arrayContaining([...stage.personIds]));
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), stage.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), stage.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site'), stage.heritageId).toBe(true);
      expect(detail?.historicalAssociations.length, stage.heritageId).toBeGreaterThan(1);
      expect(detail?.survivingFeatures.length, stage.heritageId).toBeGreaterThan(1);
      expect(detail?.presentDayValue, stage.heritageId).toBeTruthy();
      expect(polityIds.has('western_liang'), stage.heritageId).toBe(true);
      for (const personId of stage.personIds) expect(peopleIds.has(personId), `${stage.heritageId}:${personId}`).toBe(true);
      for (const eventId of stage.eventIds) expect(eventIds.has(eventId), `${stage.heritageId}:${eventId}`).toBe(true);
    }
  });
});
