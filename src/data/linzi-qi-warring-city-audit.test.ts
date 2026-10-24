import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('临淄—战国齐都城城市审计', () => {
  it('串联临淄资本史、齐都镇今地、城址遗产与齐国历史叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'qi-linzi-city-site');
    const detail = getHeritageDetail('qi-linzi-city-site');
    const place = places.find((item) => item.id === 'linzi');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'qi_warring' && item.placeId === 'linzi',
    );
    const polity = polities.find((item) => item.id === 'qi_warring');
    const event = events.find((item) => item.id === 'qi-warring-founded-eighth-batch');
    const unification = events.find((item) => item.id === 'qin-unification');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'linzi',
      historicalName: '临淄',
      modernName: '临淄区',
      modernAdministrativeUnit: '山东省淄博市临淄区',
      mappingStatus: 'exact',
      confidence: 'high',
    });
    expect(capital).toMatchObject({
      polityId: 'qi_warring',
      placeId: 'linzi',
      validFrom: -403,
      validTo: -221,
    });
    expect(asset).toMatchObject({
      placeId: 'linzi',
      constructionFrom: -403,
      constructionTo: -221,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('淄博市临淄区');
    expect(detail?.associatedPolities).toContain('qi_warring');
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['qi-warring-founded-eighth-batch', 'qin-unification']),
    );
    expect(detail?.associatedPeople).toContain('qin-shi-huang');
    expect(detail?.constructionHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'original' }),
        expect.objectContaining({ type: 'site' }),
      ]),
    );
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();

    expect(polity?.id).toBe('qi_warring');
    expect(event?.id).toBe('qi-warring-founded-eighth-batch');
    expect(unification?.id).toBe('qin-unification');
    for (const sourceId of asset?.sourceIds ?? []) {
      expect(sourceById[sourceId]).toBeDefined();
    }
    for (const id of [
      ...(detail?.associatedPolities ?? []),
      ...(detail?.associatedEvents ?? []),
      ...(detail?.associatedPeople ?? []),
    ]) {
      expect(
        polities.some((item) => item.id === id) ||
          events.some((item) => item.id === id) ||
          people.some((item) => item.id === id),
      ).toBe(true);
    }
  });
});
