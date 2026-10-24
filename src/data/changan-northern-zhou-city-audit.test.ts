import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('长安—北周都城城市审计', () => {
  it('串联北周长安首都史、西安今地、城市叠压遗产与隋承接叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'northern-zhou-changan-city-layer');
    const detail = getHeritageDetail('northern-zhou-changan-city-layer');
    const place = places.find((item) => item.id === 'changan');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'zhou_northern' && item.placeId === 'changan',
    );
    const polity = polities.find((item) => item.id === 'zhou_northern');
    const successor = polities.find((item) => item.id === 'sui');
    const ended = events.find((item) => item.id === 'northern-zhou-ended-581');
    const founded = events.find((item) => item.id === 'sui-founded');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'changan',
      historicalName: '长安',
      modernName: '西安市',
      modernAdministrativeUnit: '陕西省',
    });
    expect(capital).toMatchObject({
      polityId: 'zhou_northern',
      placeId: 'changan',
      validFrom: 557,
      validTo: 581,
    });
    expect(asset).toMatchObject({
      placeId: 'changan',
      constructionFrom: 557,
      constructionTo: 581,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('陕西省西安市');
    expect(detail?.associatedPolities).toEqual(
      expect.arrayContaining(['zhou_northern', 'sui']),
    );
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['northern-zhou-ended-581', 'sui-founded']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['yuwen-yong', 'yuwen-chan', 'yang-jian']),
    );
    expect(detail?.constructionHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'original' }),
        expect.objectContaining({ type: 'site' }),
      ]),
    );
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();

    expect(polity?.capitalPlaceId).toBe('changan');
    expect(successor?.id).toBe('sui');
    expect(ended?.placeId).toBe('changan');
    expect(founded?.placeId).toBe('changan');
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
