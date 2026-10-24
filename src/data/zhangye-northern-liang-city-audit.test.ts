import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('张掖—北凉早期都城城市审计', () => {
  it('串联张掖资本史、甘州今地、城市历史层与北凉建政叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'zhangye-northern-liang-city-layer');
    const detail = getHeritageDetail('zhangye-northern-liang-city-layer');
    const place = places.find((item) => item.id === 'zhangye');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'northern_liang' && item.placeId === 'zhangye',
    );
    const polity = polities.find((item) => item.id === 'northern_liang');
    const event = events.find((item) => item.id === 'northern-liang-founded');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'zhangye',
      historicalName: '张掖',
      modernName: '张掖市',
      modernAdministrativeUnit: '甘肃省张掖市',
      mappingStatus: 'approximate',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'northern_liang',
      placeId: 'zhangye',
      validFrom: 397,
      validTo: 400,
    });
    expect(asset).toMatchObject({
      placeId: 'zhangye',
      constructionFrom: 397,
      constructionTo: 400,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('甘肃省张掖市');
    expect(detail?.associatedPolities).toContain('northern_liang');
    expect(detail?.associatedEvents).toContain('northern-liang-founded');
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['duan-ye', 'juqu-mengxun']),
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

    expect(polity?.capitalPlaceId).toBe('guzang');
    expect(event?.placeId).toBe('zhangye');
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
