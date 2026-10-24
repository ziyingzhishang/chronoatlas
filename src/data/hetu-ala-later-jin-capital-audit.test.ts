import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('赫图阿拉后金城市视角历史链审计', () => {
  it('keeps the Later Jin founding capital, Nurhaci and the 1625 relocation boundary connected to Xinbin', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'later-jin-hetu-ala-city-site');
    const detail = getHeritageDetail('later-jin-hetu-ala-city-site');
    const place = places.find((candidate) => candidate.id === 'heturnala');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'later_jin' && candidate.placeId === 'heturnala');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '赫图阿拉城遗址', modernAdministrativeUnit: '辽宁省抚顺市新宾满族自治县' });
    expect(capital).toMatchObject({ polityId: 'later_jin', placeId: 'heturnala', validFrom: 1616, validTo: 1625 });
    expect(asset).toMatchObject({ placeId: 'heturnala', constructionFrom: 1616, constructionTo: 1625 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('新宾满族自治县');
    expect(detail?.associatedPolities).toContain('later_jin');
    expect(detail?.associatedEvents).toContain('later-jin-founded');
    expect(detail?.associatedPeople).toContain('nurhaci');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('later_jin')).toBe(true);
    expect(eventIds.has('later-jin-founded')).toBe(true);
    expect(peopleIds.has('nurhaci')).toBe(true);
  });
});
