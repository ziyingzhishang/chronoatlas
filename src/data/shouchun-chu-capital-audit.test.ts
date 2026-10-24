import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('寿春楚国晚期城市视角历史链审计', () => {
  it('keeps the late Chu capital phase, Ying-to-Shouchun distinction and modern Shouxian heritage connected', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'chu-shouchun-city-site');
    const detail = getHeritageDetail('chu-shouchun-city-site');
    const place = places.find((candidate) => candidate.id === 'shouchun');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'chu_warring' && candidate.placeId === 'shouchun');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '寿县', modernAdministrativeUnit: '安徽省淮南市寿县' });
    expect(capital).toMatchObject({ polityId: 'chu_warring', placeId: 'shouchun', validFrom: -278, validTo: -223 });
    expect(asset).toMatchObject({ placeId: 'shouchun', constructionFrom: -278, constructionTo: -223 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('寿县');
    expect(detail?.associatedPolities).toContain('chu_warring');
    expect(detail?.associatedEvents).toContain('chu-warring-founded-eighth-batch');
    expect(detail?.associatedPeople).toContain('chu-we-wang');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('chu_warring')).toBe(true);
    expect(eventIds.has('chu-warring-founded-eighth-batch')).toBe(true);
    expect(peopleIds.has('chu-we-wang')).toBe(true);
  });
});
