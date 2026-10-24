import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('长安—西魏都城城市审计', () => {
  it('串联西魏长安首都史、西安今地、叠压城市遗产与北周承接叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'western-wei-changan-city-layer');
    const detail = getHeritageDetail('western-wei-changan-city-layer');
    const place = places.find((item) => item.id === 'changan');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'wei_western' && item.placeId === 'changan',
    );
    const polity = polities.find((item) => item.id === 'wei_western');
    const successor = polities.find((item) => item.id === 'zhou_northern');
    const founded = events.find((item) => item.id === 'western-wei-founded');
    const ended = events.find((item) => item.id === 'western-wei-ended-557');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'changan',
      historicalName: '长安',
      modernName: '西安市',
      modernAdministrativeUnit: '陕西省',
    });
    expect(capital).toMatchObject({
      polityId: 'wei_western',
      placeId: 'changan',
      validFrom: 535,
      validTo: 557,
    });
    expect(asset).toMatchObject({
      placeId: 'changan',
      constructionFrom: 535,
      constructionTo: 557,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('陕西省西安市');
    expect(detail?.associatedPolities).toEqual(
      expect.arrayContaining(['wei_western', 'zhou_northern']),
    );
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['western-wei-founded', 'western-wei-ended-557']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['yu-wen-tai', 'yuan-kuo', 'yuwen-jue']),
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

    expect(polity?.id).toBe('wei_western');
    expect(successor?.id).toBe('zhou_northern');
    expect(founded?.placeId).toBe('changan');
    expect(ended?.placeId).toBe('changan');
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
