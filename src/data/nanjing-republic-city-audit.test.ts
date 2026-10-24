import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('南京中华民国城市视角历史链审计', () => {
  it('keeps the 1912 founding event, later Nanjing capital phase and wartime Chongqing distinction connected to modern Nanjing', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'republic-nanjing-presidential-palace-site');
    const detail = getHeritageDetail('republic-nanjing-presidential-palace-site');
    const place = places.find((candidate) => candidate.id === 'yingtian');
    const nanjingCapital = capitalHistory.find((candidate) => candidate.polityId === 'republic' && candidate.placeId === 'yingtian' && candidate.validFrom === 1928);
    const chongqingCenter = capitalHistory.find((candidate) => candidate.polityId === 'republic' && candidate.placeId === 'chongqing');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '南京市', modernAdministrativeUnit: '江苏省南京市' });
    expect(nanjingCapital).toMatchObject({ polityId: 'republic', placeId: 'yingtian', validFrom: 1928, validTo: 1937 });
    expect(chongqingCenter).toMatchObject({ polityId: 'republic', placeId: 'chongqing', validFrom: 1938, validTo: 1945, status: 'actual' });
    expect(asset).toMatchObject({ placeId: 'yingtian', constructionFrom: 1912, constructionTo: 1927 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('南京市玄武区');
    expect(detail?.associatedPolities).toContain('republic');
    expect(detail?.associatedEvents).toContain('republic-founded');
    expect(detail?.associatedPeople).toContain('sun-yat-sen');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('republic')).toBe(true);
    expect(eventIds.has('republic-founded')).toBe(true);
    expect(peopleIds.has('sun-yat-sen')).toBe(true);
  });
});
