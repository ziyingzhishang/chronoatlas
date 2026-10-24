import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('酒泉—西凉后期都城城市审计', () => {
  it('串联酒泉资本史、今酒泉市、西凉城市层与北凉承接叙事', () => {
    const asset = heritageAssets.find((item) => item.id === 'jiuquan-western-liang-city-site');
    const detail = getHeritageDetail('jiuquan-western-liang-city-site');
    const place = places.find((item) => item.id === 'jiuquan');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'western_liang' && item.placeId === 'jiuquan',
    );
    const polity = polities.find((item) => item.id === 'western_liang');
    const successor = polities.find((item) => item.id === 'northern_liang');
    const founded = events.find((item) => item.id === 'western-liang-state-founded');
    const ended = events.find((item) => item.id === 'western-liang-ended-421');

    expect(asset).toBeDefined();
    expect(detail).toBeDefined();
    expect(place).toMatchObject({
      id: 'jiuquan',
      historicalName: '酒泉',
      modernName: '酒泉市',
      modernAdministrativeUnit: '甘肃省酒泉市',
      mappingStatus: 'exact',
      confidence: 'medium',
    });
    expect(capital).toMatchObject({
      polityId: 'western_liang',
      placeId: 'jiuquan',
      validFrom: 405,
      validTo: 421,
    });
    expect(asset).toMatchObject({
      placeId: 'jiuquan',
      constructionFrom: 405,
      constructionTo: 421,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('甘肃省酒泉市');
    expect(detail?.associatedPolities).toEqual(
      expect.arrayContaining(['western_liang', 'northern_liang']),
    );
    expect(detail?.associatedEvents).toEqual(
      expect.arrayContaining(['western-liang-state-founded', 'western-liang-ended-421']),
    );
    expect(detail?.associatedPeople).toEqual(
      expect.arrayContaining(['li-hao', 'li-xin', 'juqu-mengxun']),
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

    expect(polity?.id).toBe('western_liang');
    expect(successor?.id).toBe('northern_liang');
    expect(founded?.placeId).toBe('dunhuang');
    expect(ended?.placeId).toBe('jiuquan');
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
