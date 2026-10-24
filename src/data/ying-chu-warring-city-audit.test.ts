import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('郢—战国楚早期都城城市审计', () => {
  it('串联郢都资本史、纪南城今地、城址遗产与楚国历史叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'chu-ying-city-site');
    const detail = getHeritageDetail('chu-ying-city-site');
    const place = places.find((item) => item.id === 'ying');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'chu_warring' && item.placeId === 'ying',
    );
    const polity = polities.find((item) => item.id === 'chu_warring');
    const event = events.find((item) => item.id === 'chu-warring-founded-eighth-batch');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'ying',
      historicalName: '郢',
      modernName: '荆州纪南城遗址',
      modernAdministrativeUnit: '湖北省荆州市',
      mappingStatus: 'approximate',
      confidence: 'high',
    });
    expect(capital).toMatchObject({
      polityId: 'chu_warring',
      placeId: 'ying',
      validFrom: -403,
      validTo: -279,
    });
    expect(asset).toMatchObject({
      placeId: 'ying',
      constructionFrom: -403,
      constructionTo: -278,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('荆州市纪南城');
    expect(detail?.associatedPolities).toContain('chu_warring');
    expect(detail?.associatedEvents).toContain('chu-warring-founded-eighth-batch');
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

    expect(polity?.id).toBe('chu_warring');
    expect(event?.id).toBe('chu-warring-founded-eighth-batch');
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
