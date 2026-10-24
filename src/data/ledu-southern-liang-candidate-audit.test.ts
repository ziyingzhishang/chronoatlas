import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('乐都南凉候选城市视角历史链审计', () => {
  it('keeps the Xiping-to-Ledu transition and archaeological uncertainty explicit', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'southern-liang-ledu-city-site');
    const detail = getHeritageDetail('southern-liang-ledu-city-site');
    const place = places.find((candidate) => candidate.id === 'ledu');
    const capitals = capitalHistory.filter((candidate) => candidate.polityId === 'southern_liang');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '乐都区', modernAdministrativeUnit: '青海省海东市乐都区', confidence: 'medium', mappingStatus: 'exact' });
    expect(capitals).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'xiping', validFrom: 397, validTo: 401 }),
      expect.objectContaining({ placeId: 'ledu', validFrom: 402, validTo: 414 }),
    ]));
    expect(asset).toMatchObject({ placeId: 'ledu', constructionFrom: 399, constructionTo: 414, modernStatus: 'uncertain' });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('海东市乐都区');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['southern_liang', 'western_qin']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['southern-liang-founded-397', 'southern-liang-moves-ledu', 'southern-liang-ended-414']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['tufa-wugu', 'tufa-rutan', 'qifu-chipan']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('southern_liang')).toBe(true);
    expect(polityIds.has('western_qin')).toBe(true);
    for (const eventId of ['southern-liang-founded-397', 'southern-liang-moves-ledu', 'southern-liang-ended-414']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['tufa-wugu', 'tufa-rutan', 'qifu-chipan']) expect(peopleIds.has(personId)).toBe(true);
  });
});
