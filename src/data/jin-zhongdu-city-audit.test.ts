import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('金中都城市视角历史链审计', () => {
  it('keeps the 1153 Jin capital relocation, Zhongdu archaeological layer and later Beijing overlays distinct', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'jin-zhongdu-city-site');
    const detail = getHeritageDetail('jin-zhongdu-city-site');
    const place = places.find((candidate) => candidate.id === 'jin_zhongdu');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'jin_jurchen' && candidate.placeId === 'jin_zhongdu');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '北京市', modernAdministrativeUnit: '北京市', mappingStatus: 'regional' });
    expect(capital).toMatchObject({ polityId: 'jin_jurchen', placeId: 'jin_zhongdu', validFrom: 1153, validTo: 1214 });
    expect(asset).toMatchObject({ placeId: 'jin_zhongdu', constructionFrom: 1151, constructionTo: 1155 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('北京市西南部');
    expect(detail?.associatedPolities).toContain('jin_jurchen');
    expect(detail?.associatedEvents).toContain('jurchen-jin-moves-zhongdu');
    expect(detail?.associatedPeople).toContain('wanyan-liang');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('jin_jurchen')).toBe(true);
    expect(eventIds.has('jurchen-jin-moves-zhongdu')).toBe(true);
    expect(peopleIds.has('wanyan-liang')).toBe(true);
  });
});
