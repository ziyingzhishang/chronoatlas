import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('纥升骨城高句丽城市视角历史链审计', () => {
  it('keeps the traditional founding phase, early mountain-capital heritage and later Guonei transition connected to Huanren', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'wunvshan-goguryeo-early-capital-site');
    const detail = getHeritageDetail('wunvshan-goguryeo-early-capital-site');
    const place = places.find((candidate) => candidate.id === 'wunvshan');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'goguryeo' && candidate.placeId === 'wunvshan');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '五女山城遗址', modernAdministrativeUnit: '辽宁省本溪市桓仁县' });
    expect(capital).toMatchObject({ polityId: 'goguryeo', placeId: 'wunvshan', validFrom: -37, validTo: 2 });
    expect(asset).toMatchObject({ placeId: 'wunvshan', constructionFrom: -37, constructionTo: 2 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('桓仁满族自治县');
    expect(detail?.associatedPolities).toContain('goguryeo');
    expect(detail?.associatedEvents).toContain('goguryeo-founded');
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['jumong', 'yuri-goguryeo']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('goguryeo')).toBe(true);
    expect(eventIds.has('goguryeo-founded')).toBe(true);
    for (const personId of ['jumong', 'yuri-goguryeo']) expect(peopleIds.has(personId)).toBe(true);
  });
});
