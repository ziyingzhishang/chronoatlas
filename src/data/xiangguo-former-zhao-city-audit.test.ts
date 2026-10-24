import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('襄国前赵城市视角历史链审计', () => {
  it('keeps the Xiangguo layer, Former Zhao late capital in Chang’an and multi-center uncertainty explicit', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'former-zhao-xiangguo-city-site');
    const detail = getHeritageDetail('former-zhao-xiangguo-city-site');
    const place = places.find((candidate) => candidate.id === 'xiangguo');
    const lateCapital = capitalHistory.find((candidate) => candidate.polityId === 'former_zhao' && candidate.placeId === 'changan');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '邢台市一带', modernAdministrativeUnit: '河北省邢台市', mappingStatus: 'approximate' });
    expect(lateCapital).toMatchObject({ polityId: 'former_zhao', placeId: 'changan', validFrom: 304, validTo: 329 });
    expect(asset).toMatchObject({ placeId: 'xiangguo', constructionFrom: 304, constructionTo: 329 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('邢台市');
    expect(detail?.associatedPolities).toContain('former_zhao');
    expect(detail?.associatedEvents).toContain('former-zhao-founded');
    expect(detail?.associatedPeople).toContain('liu-yao');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('former_zhao')).toBe(true);
    expect(eventIds.has('former-zhao-founded')).toBe(true);
    expect(peopleIds.has('liu-yao')).toBe(true);
  });
});
