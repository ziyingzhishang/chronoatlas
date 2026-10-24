import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('逻些吐蕃城市视角历史链审计', () => {
  it('keeps the Yalong-to-Lhasa capital transition, heritage layers and 842 dissolution connected to modern Lhasa', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'tibetan-lhasa-city-site');
    const detail = getHeritageDetail('tibetan-lhasa-city-site');
    const place = places.find((candidate) => candidate.id === 'luosie');
    const capitals = capitalHistory.filter((candidate) => candidate.polityId === 'tibetan_empire');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '拉萨市', modernAdministrativeUnit: '西藏自治区拉萨市' });
    expect(capitals).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'yalong', validFrom: 618, validTo: 629, status: 'actual' }),
      expect.objectContaining({ placeId: 'luosie', validFrom: 630, validTo: 842 }),
    ]));
    expect(asset).toMatchObject({ placeId: 'luosie', constructionFrom: 618, constructionTo: 842 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('拉萨市');
    expect(detail?.associatedPolities).toContain('tibetan_empire');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['tibetan-founded', 'tibetan-ended-842']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['li-shimin', 'langdarma']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('tibetan_empire')).toBe(true);
    for (const eventId of ['tibetan-founded', 'tibetan-ended-842']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['li-shimin', 'langdarma']) expect(peopleIds.has(personId)).toBe(true);
  });
});
