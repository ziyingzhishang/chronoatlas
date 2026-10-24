import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('伏俟城—吐谷浑后期王都城市审计', () => {
  it('串联伏俟城首都候选史、共和县今地、考古候选遗址与政权终止叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'tuyuhun-fuqisi-city-candidate');
    const detail = getHeritageDetail('tuyuhun-fuqisi-city-candidate');
    const place = places.find((item) => item.id === 'tuyuhun_core');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'tuyuhun' && item.placeId === 'tuyuhun_core',
    );
    const polity = polities.find((item) => item.id === 'tuyuhun');
    const founded = events.find((item) => item.id === 'tuyuhun-founded');
    const ended = events.find((item) => item.id === 'tuyuhun-ended-663');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'tuyuhun_core',
      historicalName: '伏俟城',
      modernName: '青海省海南藏族自治州共和县石乃亥镇铁卜加村一带',
      modernAdministrativeUnit: '青海省海南藏族自治州共和县',
      mappingStatus: 'debated',
      confidence: 'low',
    });
    expect(capital).toMatchObject({
      polityId: 'tuyuhun',
      placeId: 'tuyuhun_core',
      validFrom: 313,
      validTo: 663,
      confidence: 'low',
    });
    expect(asset).toMatchObject({
      placeId: 'tuyuhun_core',
      constructionFrom: 540,
      constructionTo: 663,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('共和县');
    expect(detail?.associatedPolities).toEqual(
      expect.arrayContaining(['tuyuhun', 'tibetan_empire']),
    );
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['tuyuhun-founded', 'tuyuhun-ended-663']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['murong-nuohebo', 'lushangzan']),
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

    expect(polity?.id).toBe('tuyuhun');
    expect(founded?.id).toBe('tuyuhun-founded');
    expect(ended?.placeId).toBe('tuyuhun_core');
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
