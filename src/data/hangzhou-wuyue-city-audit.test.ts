import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('杭州吴越城市视角历史链审计', () => {
  it('keeps the Wuyue capital, Qian royal mausoleum and 978 transition connected to modern Hangzhou', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'wuyue-qian-king-mausoleum');
    const detail = getHeritageDetail('wuyue-qian-king-mausoleum');
    const place = places.find((candidate) => candidate.id === 'hangzhou');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '杭州市', modernAdministrativeUnit: '浙江省杭州市' });
    expect(asset).toMatchObject({ placeId: 'hangzhou', constructionFrom: 932, constructionTo: 978 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('杭州市临安区');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['wuyue', 'song_northern']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['wuyue-founded', 'wuyue-ended-978']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['qian-liu', 'qian-chu']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['wuyue', 'song_northern']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['wuyue-founded', 'wuyue-ended-978']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['qian-liu', 'qian-chu']) expect(peopleIds.has(personId)).toBe(true);
  });
});
