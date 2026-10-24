import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('金城—西秦前期阶段性中心城市审计', () => {
  it('串联金城实际中心史、兰州今地、苑川候选遗产与西秦多阶段叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'western-qin-yuanchuan-city-candidate');
    const detail = getHeritageDetail('western-qin-yuanchuan-city-candidate');
    const place = places.find((item) => item.id === 'jincheng');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'western_qin' && item.placeId === 'jincheng',
    );
    const polity = polities.find((item) => item.id === 'western_qin');
    const founded = events.find((item) => item.id === 'western-qin-founded');
    const surrendered = events.find((item) => item.id === 'western-qin-surrendered-later-qin-400');
    const restored = events.find((item) => item.id === 'western-qin-restored-409');
    const ended = events.find((item) => item.id === 'western-qin-ended-431');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'jincheng',
      historicalName: '金城',
      modernName: '兰州市一带',
      modernAdministrativeUnit: '甘肃省兰州市',
      mappingStatus: 'regional',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'western_qin',
      placeId: 'jincheng',
      validFrom: 385,
      validTo: 400,
      role: 'primary',
      status: 'actual',
      confidence: 'medium',
    });
    expect(asset).toMatchObject({
      placeId: 'jincheng',
      constructionFrom: 385,
      constructionTo: 431,
      modernStatus: 'uncertain',
    });
    expect(detail?.modernLocation).toContain('兰州');
    expect(detail?.associatedPolities).toEqual(
      expect.arrayContaining(['western_qin', 'later_qin', 'xia']),
    );
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining([
        'western-qin-founded',
        'western-qin-surrendered-later-qin-400',
        'western-qin-restored-409',
        'western-qin-ended-431',
      ]),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['qifu-gangui', 'qifu-mumo', 'yao-xing', 'helian-ding']),
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

    expect(polity?.id).toBe('western_qin');
    expect(founded?.id).toBe('western-qin-founded');
    expect(surrendered?.placeId).toBe('jincheng');
    expect(restored?.placeId).toBe('jincheng');
    expect(ended?.placeId).toBe('fuhan');
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
