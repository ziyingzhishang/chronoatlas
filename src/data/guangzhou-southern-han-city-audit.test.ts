import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('广州南汉城市视角历史链审计', () => {
  it('keeps the Southern Han capital, royal mausoleums and 971 transition connected to modern Guangzhou', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'southern-han-king-mausoleum');
    const detail = getHeritageDetail('southern-han-king-mausoleum');
    const place = places.find((candidate) => candidate.id === 'guangzhou');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '广州市', modernAdministrativeUnit: '广东省广州市' });
    expect(asset).toMatchObject({ placeId: 'guangzhou', constructionFrom: 917, constructionTo: 943 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('广州市番禺区');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['southern_han', 'song_northern']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['southern-han-founded', 'southern-han-ended-971']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['liu-yin', 'liu-yan', 'liu-chang']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['southern_han', 'song_northern']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['southern-han-founded', 'southern-han-ended-971']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['liu-yin', 'liu-yan', 'liu-chang']) expect(peopleIds.has(personId)).toBe(true);
  });
});
