import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const layers = [
  {
    heritageId: 'ye-city-site',
    polityIds: ['later_zhao', 'former_yan', 'wei_eastern', 'qi_northern'],
    eventIds: ['later-zhao-moves-ye', 'former-yan-founded', 'eastern-wei-founded', 'northern-qi-founded'],
  },
  {
    heritageId: 'later-yan-ye-city-site',
    polityIds: ['later_yan'],
    eventIds: ['later-yan-founded'],
  },
] as const;

describe('邺城多政权城市视角历史链审计', () => {
  it('keeps the Ye city layers connected to modern place, polities, events, people and sources', () => {
    const place = places.find((candidate) => candidate.id === 'ye');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '临漳县一带', modernAdministrativeUnit: '河北省' });

    for (const layer of layers) {
      const asset = heritageAssets.find((candidate) => candidate.id === layer.heritageId);
      const detail = getHeritageDetail(layer.heritageId);

      expect(asset, layer.heritageId).toMatchObject({ placeId: 'ye' });
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), layer.heritageId).toBe(true);
      expect(detail, layer.heritageId).toBeDefined();
      expect(detail?.modernLocation, layer.heritageId).toContain('临漳');
      expect(detail?.associatedPolities, layer.heritageId).toEqual(expect.arrayContaining([...layer.polityIds]));
      expect(detail?.associatedEvents, layer.heritageId).toEqual(expect.arrayContaining([...layer.eventIds]));
      expect(detail?.associatedPeople?.every((personId) => peopleIds.has(personId)), layer.heritageId).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), layer.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), layer.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site'), layer.heritageId).toBe(true);
      expect(detail?.historicalAssociations.length, layer.heritageId).toBeGreaterThan(1);
      expect(detail?.survivingFeatures.length, layer.heritageId).toBeGreaterThan(1);
      expect(detail?.presentDayValue, layer.heritageId).toBeTruthy();
      for (const polityId of layer.polityIds) expect(polityIds.has(polityId), `${layer.heritageId}:${polityId}`).toBe(true);
      for (const eventId of layer.eventIds) expect(eventIds.has(eventId), `${layer.heritageId}:${eventId}`).toBe(true);
    }
  });
});
