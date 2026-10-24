import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('新郑韩国城市视角历史链审计', () => {
  it('keeps the Warring States Han capital, Zhenghan archaeology and Qin transition connected to modern Xinzheng', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'han-xinzheng-city-site');
    const detail = getHeritageDetail('han-xinzheng-city-site');
    const place = places.find((candidate) => candidate.id === 'xinzheng');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'han_warring' && candidate.placeId === 'xinzheng');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '新郑市', modernAdministrativeUnit: '河南省郑州市新郑市' });
    expect(capital).toMatchObject({ polityId: 'han_warring', placeId: 'xinzheng', validFrom: -403, validTo: -230 });
    expect(asset).toMatchObject({ placeId: 'xinzheng', constructionFrom: -403, constructionTo: -230 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('郑州市新郑市');
    expect(detail?.associatedPolities).toContain('han_warring');
    expect(detail?.associatedEvents).toContain('han-warring-founded-eighth-batch');
    expect(detail?.associatedPeople).toContain('qin-shi-huang');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('han_warring')).toBe(true);
    expect(eventIds.has('han-warring-founded-eighth-batch')).toBe(true);
    expect(peopleIds.has('qin-shi-huang')).toBe(true);
  });
});
