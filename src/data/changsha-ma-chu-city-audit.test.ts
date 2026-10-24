import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('长沙马楚城市视角历史链审计', () => {
  it('keeps the Ma Chu capital, city-site layers and 951 Southern Tang transition connected to modern Changsha', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'ma-chu-tan-zhou-city-site');
    const detail = getHeritageDetail('ma-chu-tan-zhou-city-site');
    const place = places.find((candidate) => candidate.id === 'changsha');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '长沙市', modernAdministrativeUnit: '湖南省长沙市' });
    expect(asset).toMatchObject({ placeId: 'changsha', constructionFrom: 907, constructionTo: 951 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('长沙市');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['chu_ten', 'southern_tang']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['ma-chu-founded', 'ma-chu-ended-951']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['ma-yin', 'ma-xiguang', 'ma-xie', 'ma-xichong', 'li-jing']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['chu_ten', 'southern_tang']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['ma-chu-founded', 'ma-chu-ended-951']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['ma-yin', 'ma-xiguang', 'ma-xie', 'ma-xichong', 'li-jing']) expect(peopleIds.has(personId)).toBe(true);
  });
});
