import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('庆州—新罗王京城市审计', () => {
  it('串联金城徐罗伐首都史、庆州今地、王京遗址群与新罗历史叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'silla-gyeongju-capital-site');
    const detail = getHeritageDetail('silla-gyeongju-capital-site');
    const place = places.find((item) => item.id === 'jincheng_silla');
    const earlyCapital = capitalHistory.find(
      (item) => item.polityId === 'silla' && item.placeId === 'jincheng_silla',
    );
    const laterCapital = capitalHistory.find(
      (item) => item.polityId === 'silla' && item.placeId === 'wolseong_silla',
    );
    const polity = polities.find((item) => item.id === 'silla');
    const founded = events.find((item) => item.id === 'silla-founded');
    const ended = events.find((item) => item.id === 'silla-ended-935');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'jincheng_silla',
      historicalName: '金城／徐罗伐',
      modernName: '庆州市',
      modernAdministrativeUnit: '韩国庆尚北道庆州市',
      mappingStatus: 'approximate',
      confidence: 'medium',
    });
    expect(earlyCapital).toMatchObject({
      polityId: 'silla',
      placeId: 'jincheng_silla',
      validFrom: -57,
      validTo: 100,
      confidence: 'medium',
    });
    expect(laterCapital).toMatchObject({
      polityId: 'silla',
      placeId: 'wolseong_silla',
      validFrom: 101,
      validTo: 935,
      confidence: 'medium',
    });
    expect(asset).toMatchObject({
      placeId: 'jincheng_silla',
      constructionFrom: -57,
      constructionTo: 935,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('庆州市');
    expect(detail?.associatedPolities).toContain('silla');
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['silla-founded', 'silla-ended-935', 'silla-tang-war-670-676']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['park-hyeokgeose', 'kim-chunchu', 'kim-yushin', 'gyeongsun-silla']),
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
    expect(founded?.id).toBe('silla-founded');
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
