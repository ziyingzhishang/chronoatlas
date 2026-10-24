import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('蓟—战国燕都城城市审计', () => {
  it('串联蓟都资本史、北京今地、城址遗产与燕国历史叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'yan-ji-city-site');
    const detail = getHeritageDetail('yan-ji-city-site');
    const place = places.find((item) => item.id === 'ji');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'yan_warring' && item.placeId === 'ji',
    );
    const polity = polities.find((item) => item.id === 'yan_warring');
    const event = events.find((item) => item.id === 'yan-warring-founded-eighth-batch');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'ji',
      historicalName: '蓟',
      modernName: '北京市城区及周边',
      modernAdministrativeUnit: '北京市',
      mappingStatus: 'regional',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'yan_warring',
      placeId: 'ji',
      validFrom: -403,
      validTo: -222,
    });
    expect(asset).toMatchObject({
      placeId: 'ji',
      constructionFrom: -403,
      constructionTo: -222,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('北京市');
    expect(detail?.associatedPolities).toContain('yan_warring');
    expect(detail?.associatedEvents).toContain('yan-warring-founded-eighth-batch');
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

    expect(polity?.id).toBe('yan_warring');
    expect(event?.placeId).toBe('ji');
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
