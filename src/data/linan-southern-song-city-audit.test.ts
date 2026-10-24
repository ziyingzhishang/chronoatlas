import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('临安南宋城市视角历史链审计', () => {
  it('keeps the Southern Song political-center phase, imperial city heritage and Hangzhou continuity connected', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'linan-southern-song-imperial-city-site');
    const detail = getHeritageDetail('linan-southern-song-imperial-city-site');
    const place = places.find((candidate) => candidate.id === 'linan');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'song_south' && candidate.placeId === 'linan');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '杭州市', modernAdministrativeUnit: '浙江省杭州市' });
    expect(capital).toMatchObject({ polityId: 'song_south', placeId: 'linan', validFrom: 1127, validTo: 1279, status: 'actual' });
    expect(asset).toMatchObject({ placeId: 'linan', constructionFrom: 1127, constructionTo: 1279 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('杭州市上城区');
    expect(detail?.associatedPolities).toContain('song_south');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['southern-song-founded', 'song-southward', 'song-linan-center-formed']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['zhao-gou', 'yue-fei']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('song_south')).toBe(true);
    for (const eventId of ['southern-song-founded', 'song-southward', 'song-linan-center-formed']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['zhao-gou', 'yue-fei']) expect(peopleIds.has(personId)).toBe(true);
  });
});
