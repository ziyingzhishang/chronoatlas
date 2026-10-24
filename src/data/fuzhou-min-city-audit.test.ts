import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('福州闽政权城市视角历史链审计', () => {
  it('keeps the Min capital, royal mausoleum and 945 Southern Tang transition connected to modern Fuzhou', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'min-wang-mausoleum');
    const detail = getHeritageDetail('min-wang-mausoleum');
    const place = places.find((candidate) => candidate.id === 'fuzhou');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '福州市', modernAdministrativeUnit: '福建省福州市' });
    expect(asset).toMatchObject({ placeId: 'fuzhou', constructionFrom: 925 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('福州市');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['min', 'southern_tang']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['min-founded', 'min-ended-945']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['wang-shenzhi', 'wang-yanzheng', 'li-jing']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['min', 'southern_tang']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['min-founded', 'min-ended-945']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['wang-shenzhi', 'wang-yanzheng', 'li-jing']) expect(peopleIds.has(personId)).toBe(true);
  });
});
