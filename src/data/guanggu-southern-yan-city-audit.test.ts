import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('广固南燕城市视角历史链审计', () => {
  it('keeps the Southern Yan Guanggu phase, Murong lineage and 410 transition connected to modern Qingzhou', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'southern-yan-guanggu-city-site');
    const detail = getHeritageDetail('southern-yan-guanggu-city-site');
    const place = places.find((candidate) => candidate.id === 'guanggu');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'southern_yan' && candidate.placeId === 'guanggu');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '青州市一带', modernAdministrativeUnit: '山东省潍坊市青州市' });
    expect(capital).toMatchObject({ polityId: 'southern_yan', placeId: 'guanggu', validFrom: 398, validTo: 410 });
    expect(asset).toMatchObject({ placeId: 'guanggu', constructionFrom: 398, constructionTo: 410 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('青州市');
    expect(detail?.associatedPolities).toContain('southern_yan');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['southern-yan-founded', 'southern-yan-ended-410']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['murong-chui', 'murong-chao']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('southern_yan')).toBe(true);
    for (const eventId of ['southern-yan-founded', 'southern-yan-ended-410']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['murong-chui', 'murong-chao']) expect(peopleIds.has(personId)).toBe(true);
  });
});
