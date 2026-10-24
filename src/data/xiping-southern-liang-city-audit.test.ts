import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('西平—南凉早期政治中心城市审计', () => {
  it('串联西平资本史、河湟今地、候选历史层与南凉迁都叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'southern-liang-xiping-city-layer');
    const detail = getHeritageDetail('southern-liang-xiping-city-layer');
    const place = places.find((item) => item.id === 'xiping');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'southern_liang' && item.placeId === 'xiping',
    );
    const polity = polities.find((item) => item.id === 'southern_liang');
    const event = events.find((item) => item.id === 'southern-liang-founded-397');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'xiping',
      historicalName: '西平',
      modernName: '西宁市一带',
      modernAdministrativeUnit: '青海省西宁市',
      mappingStatus: 'regional',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'southern_liang',
      placeId: 'xiping',
      validFrom: 397,
      validTo: 401,
    });
    expect(asset).toMatchObject({
      placeId: 'xiping',
      constructionFrom: 397,
      constructionTo: 401,
      modernStatus: 'uncertain',
    });
    expect(detail?.modernLocation).toContain('西宁市');
    expect(detail?.associatedPolities).toContain('southern_liang');
    expect(detail?.associatedEvents).toContain('southern-liang-founded-397');
    expect(detail?.associatedPeople).toContain('tufa-wugu');
    expect(detail?.constructionHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'original' }),
        expect.objectContaining({ type: 'site' }),
      ]),
    );
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();

    expect(polity?.id).toBe('southern_liang');
    expect(event?.placeId).toBe('xiping');
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
