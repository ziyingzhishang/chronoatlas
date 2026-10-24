import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('八剌沙衮西辽城市视角历史链审计', () => {
  it('keeps the Western Liao political-core phase, Balasagun heritage and Central Asian modern location connected', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'western-liao-balasagun-site');
    const detail = getHeritageDetail('western-liao-balasagun-site');
    const place = places.find((candidate) => candidate.id === 'balasagun');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'western_liao' && candidate.placeId === 'balasagun');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '布拉纳遗址附近', modernAdministrativeUnit: '吉尔吉斯斯坦楚河州托克马克附近（楚河谷）' });
    expect(capital).toMatchObject({ polityId: 'western_liao', placeId: 'balasagun', validFrom: 1134, validTo: 1218, status: 'actual', confidence: 'medium' });
    expect(asset).toMatchObject({ placeId: 'balasagun', constructionFrom: 1134, constructionTo: 1218 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('吉尔吉斯斯坦');
    expect(detail?.associatedPolities).toContain('western_liao');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['western-liao-founded', 'western-liao-ended-1218']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['yelu-dashi', 'kuchlug']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('western_liao')).toBe(true);
    for (const eventId of ['western-liao-founded', 'western-liao-ended-1218']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['yelu-dashi', 'kuchlug']) expect(peopleIds.has(personId)).toBe(true);
  });
});
