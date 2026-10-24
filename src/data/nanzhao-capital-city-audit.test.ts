import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('南诏阶段性都城城市审计', () => {
  it('串联太和城738—778年早期都城、今大理地点与南诏建政', () => {
    const asset = heritageAssets.find((item) => item.id === 'nanzhao-taihe-city-site');
    const detail = getHeritageDetail('nanzhao-taihe-city-site');
    const place = places.find((item) => item.id === 'taihe');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'nanzhao' && item.placeId === 'taihe',
    );
    const event = events.find((item) => item.id === 'nanzhao-founded');

    expect(asset).toMatchObject({
      placeId: 'taihe',
      constructionFrom: 738,
      constructionTo: 779,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('大理市');
    expect(place).toMatchObject({
      id: 'taihe',
      modernName: '太和城遗址',
      modernAdministrativeUnit: '云南省大理市',
      mappingStatus: 'exact',
      confidence: 'high',
    });
    expect(capital).toMatchObject({ polityId: 'nanzhao', placeId: 'taihe', validFrom: 738, validTo: 778 });
    expect(detail?.associatedPolities).toContain('nanzhao');
    expect(detail?.associatedEvents).toContain('nanzhao-founded');
    expect(detail?.associatedPeople).toContain('li-longji');
    expect(detail?.constructionHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'original' }),
        expect.objectContaining({ type: 'site' }),
      ]),
    );
    expect(detail?.presentDayValue).toBeTruthy();
    expect(event?.id).toBe('nanzhao-founded');
    expect(polities.some((item) => item.id === 'nanzhao')).toBe(true);
    for (const sourceId of asset?.sourceIds ?? []) expect(sourceById[sourceId]).toBeDefined();
    for (const id of [...(detail?.associatedEvents ?? []), ...(detail?.associatedPeople ?? [])]) {
      expect(events.some((item) => item.id === id) || people.some((item) => item.id === id)).toBe(true);
    }
  });

  it('串联羊苴咩城779—902年后期都城、现代大理古城与政权承接', () => {
    const asset = heritageAssets.find((item) => item.id === 'nanzhao-yangjumei-city-site');
    const detail = getHeritageDetail('nanzhao-yangjumei-city-site');
    const place = places.find((item) => item.id === 'yangjumei');
    const capital = capitalHistory.find(
      (item) => item.polityId === 'nanzhao' && item.placeId === 'yangjumei',
    );
    const ended = events.find((item) => item.id === 'nanzhao-ended-902');

    expect(asset).toMatchObject({
      placeId: 'yangjumei',
      constructionFrom: 779,
      constructionTo: 902,
      modernStatus: 'archaeological-site',
    });
    expect(detail?.modernLocation).toContain('大理古城');
    expect(place).toMatchObject({
      id: 'yangjumei',
      modernName: '大理古城一带',
      modernAdministrativeUnit: '云南省大理市',
      mappingStatus: 'approximate',
      confidence: 'high',
    });
    expect(capital).toMatchObject({ polityId: 'nanzhao', placeId: 'yangjumei', validFrom: 779, validTo: 902 });
    expect(detail?.associatedEvents).toContain('nanzhao-ended-902');
    expect(detail?.associatedPolities).toContain('nanzhao');
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(ended?.placeId).toBe('yangjumei');
    for (const sourceId of asset?.sourceIds ?? []) expect(sourceById[sourceId]).toBeDefined();
  });
});
