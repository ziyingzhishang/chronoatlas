import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const stages = [
  { heritageId: 'guzang-ancient-city-site', polityIds: ['former_liang', 'later_liang', 'northern_liang'], eventIds: ['former-liang-founded', 'later-liang-founded', 'northern-liang-moved-guzang', 'northern-liang-ended-439'] },
  { heritageId: 'guzang-baita-temple-site', polityIds: ['former_liang', 'later_liang', 'northern_liang'], eventIds: ['former-liang-founded'] },
] as const;

describe('姑臧／武威城市视角历史链审计', () => {
  it('keeps Hexi polity layers connected to the modern Wuwei reference and learning details', () => {
    const place = places.find((candidate) => candidate.id === 'guzang');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '武威市城区一带', modernAdministrativeUnit: '甘肃省武威市' });

    for (const stage of stages) {
      const asset = heritageAssets.find((candidate) => candidate.id === stage.heritageId);
      const detail = getHeritageDetail(stage.heritageId);

      expect(asset, stage.heritageId).toMatchObject({ placeId: 'guzang' });
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), stage.heritageId).toBe(true);
      expect(detail, stage.heritageId).toBeDefined();
      expect(detail?.modernLocation, stage.heritageId).toContain('武威');
      expect(detail?.associatedPolities, stage.heritageId).toEqual(expect.arrayContaining([...stage.polityIds]));
      expect(detail?.associatedEvents, stage.heritageId).toEqual(expect.arrayContaining([...stage.eventIds]));
      expect(detail?.associatedPeople?.every((personId) => peopleIds.has(personId)), stage.heritageId).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), stage.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), stage.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site'), stage.heritageId).toBe(true);
      expect(detail?.historicalAssociations.length, stage.heritageId).toBeGreaterThan(1);
      expect(detail?.survivingFeatures.length, stage.heritageId).toBeGreaterThan(1);
      expect(detail?.presentDayValue, stage.heritageId).toBeTruthy();
      for (const polityId of stage.polityIds) expect(polityIds.has(polityId), `${stage.heritageId}:${polityId}`).toBe(true);
      for (const eventId of stage.eventIds) expect(eventIds.has(eventId), `${stage.heritageId}:${eventId}`).toBe(true);
    }
  });
});
