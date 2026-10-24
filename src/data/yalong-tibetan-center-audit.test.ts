import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('雅砻—吐蕃早期政治中心城市审计', () => {
  it('串联雅砻阶段性中心史、山南今地、区域历史层与逻些承接叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'tibetan-yalong-political-center-layer');
    const detail = getHeritageDetail('tibetan-yalong-political-center-layer');
    const place = places.find((item) => item.id === 'yalong');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'tibetan_empire' && item.placeId === 'yalong',
    );
    const polity = polities.find((item) => item.id === 'tibetan_empire');
    const founded = events.find((item) => item.id === 'tibetan-founded');
    const center = events.find((item) => item.id === 'tibetan-yalong-center');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'yalong',
      historicalName: '雅砻',
      modernName: '山南市一带',
      modernAdministrativeUnit: '西藏自治区山南市',
      mappingStatus: 'regional',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'tibetan_empire',
      placeId: 'yalong',
      validFrom: 618,
      validTo: 629,
      role: 'de_facto',
      status: 'actual',
    });
    expect(asset).toMatchObject({
      placeId: 'yalong',
      constructionFrom: 618,
      constructionTo: 629,
      modernStatus: 'uncertain',
    });
    expect(detail?.modernLocation).toContain('山南市');
    expect(detail?.associatedPolities).toContain('tibetan_empire');
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['tibetan-founded', 'tibetan-yalong-center']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['songtsen-gampo', 'namri-songtsen']),
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

    expect(polity?.id).toBe('tibetan_empire');
    expect(founded?.placeId).toBe('luosie');
    expect(center?.placeId).toBe('yalong');
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
