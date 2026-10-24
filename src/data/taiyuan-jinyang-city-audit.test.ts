import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('晋阳／太原城市视角历史链审计', () => {
  it('keeps the Northern Han capital and 979 transition connected to today\'s Taiyuan', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'jinyang-ancient-city-site');
    const detail = getHeritageDetail('jinyang-ancient-city-site');
    const place = places.find((candidate) => candidate.id === 'taiyuan');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '太原市', modernAdministrativeUnit: '山西省太原市' });
    expect(asset).toMatchObject({ placeId: 'taiyuan', constructionFrom: 550 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('太原市晋源区');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['northern_han', 'han_later', 'song_northern']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['northern-han-founded', 'northern-han-ended-979', 'northern-song-founded']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['liu-zhiyuan', 'liu-min', 'liu-jiyuan', 'taizong-song']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['northern_han', 'han_later', 'song_northern']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['northern-han-founded', 'northern-han-ended-979', 'northern-song-founded']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['liu-zhiyuan', 'liu-min', 'liu-jiyuan', 'taizong-song']) expect(peopleIds.has(personId)).toBe(true);
  });
});
