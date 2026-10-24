import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('安邑—战国魏早期都城城市审计', () => {
  it('串联安邑资本史、夏县今地、城址遗产与魏国历史叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'wei-anyi-city-site');
    const detail = getHeritageDetail('wei-anyi-city-site');
    const place = places.find((item) => item.id === 'anyi');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'wei_warring' && item.placeId === 'anyi',
    );
    const polity = polities.find((item) => item.id === 'wei_warring');
    const event = events.find((item) => item.id === 'wei-warring-founded-eighth-batch');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'anyi',
      modernName: '夏县一带',
      modernAdministrativeUnit: '山西省运城市夏县',
      mappingStatus: 'approximate',
    });
    expect(capital).toMatchObject({
      polityId: 'wei_warring',
      placeId: 'anyi',
      validFrom: -403,
      validTo: -344,
    });
    expect(asset).toMatchObject({
      placeId: 'anyi',
      constructionFrom: -403,
      constructionTo: -364,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('夏县');
    expect(detail?.associatedPolities).toContain('wei_warring');
    expect(detail?.associatedEvents).toContain('wei-warring-founded-eighth-batch');
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

    expect(polity?.id).toBe('wei_warring');
    expect(event?.placeId).toBe('anyi');
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
