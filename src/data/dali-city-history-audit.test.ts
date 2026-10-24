import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('大理政权城市视角历史链审计', () => {
  it('keeps the Dali capital, Nanzhao spatial inheritance and 1253 transition connected to modern Dali', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'dali-city-site');
    const detail = getHeritageDetail('dali-city-site');
    const place = places.find((candidate) => candidate.id === 'dali_city');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'dali' && candidate.placeId === 'yangjumei');
    const relatedPlace = places.find((candidate) => candidate.id === 'yangjumei');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '大理古城', modernAdministrativeUnit: '云南省大理市' });
    expect(relatedPlace).toMatchObject({ modernAdministrativeUnit: '云南省大理市' });
    expect(capital).toMatchObject({ polityId: 'dali', placeId: 'yangjumei', validFrom: 937, validTo: 1253 });
    expect(asset).toMatchObject({ placeId: 'dali_city', constructionFrom: 937, constructionTo: 1253 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('大理市');
    expect(detail?.associatedPolities).toContain('dali');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['dali-founded', 'dali-ended-1253']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['duan-siping', 'duan-xingzhi']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('dali')).toBe(true);
    for (const eventId of ['dali-founded', 'dali-ended-1253']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['duan-siping', 'duan-xingzhi']) expect(peopleIds.has(personId)).toBe(true);
  });
});
