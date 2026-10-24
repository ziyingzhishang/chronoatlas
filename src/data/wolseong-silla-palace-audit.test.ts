import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('月城—新罗后期王京宫城审计', () => {
  it('串联月城首都史、庆州月城今地、宫城遗址与统一新罗叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'silla-wolseong-palace-site');
    const detail = getHeritageDetail('silla-wolseong-palace-site');
    const place = places.find((item) => item.id === 'wolseong_silla');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'silla' && item.placeId === 'wolseong_silla',
    );
    const polity = polities.find((item) => item.id === 'silla');
    const war = events.find((item) => item.id === 'silla-tang-war-670-676');
    const ended = events.find((item) => item.id === 'silla-ended-935');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'wolseong_silla',
      historicalName: '月城',
      modernName: '庆州市月城遗址',
      modernAdministrativeUnit: '韩国庆尚北道庆州市',
      mappingStatus: 'approximate',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'silla',
      placeId: 'wolseong_silla',
      validFrom: 101,
      validTo: 935,
      confidence: 'medium',
    });
    expect(asset).toMatchObject({
      placeId: 'wolseong_silla',
      constructionFrom: 101,
      constructionTo: 935,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('庆州市月城遗址');
    expect(detail?.associatedPolities).toContain('silla');
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['silla-tang-war-670-676', 'silla-ended-935']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['munmu-silla', 'gyeongsun-silla']),
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

    expect(polity?.id).toBe('silla');
    expect(war?.placeId).toBe('jincheng_silla');
    expect(ended?.placeId).toBe('jincheng_silla');
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
