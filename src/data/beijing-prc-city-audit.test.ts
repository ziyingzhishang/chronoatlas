import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('北京中华人民共和国城市视角历史链审计', () => {
  it('keeps the 1949 founding ceremony, formal capital phase and modern Tiananmen heritage connected to Beijing', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'prc-tiananmen-ceremony-site');
    const detail = getHeritageDetail('prc-tiananmen-ceremony-site');
    const place = places.find((candidate) => candidate.id === 'beijing');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'prc' && candidate.placeId === 'beijing');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '北京市', modernAdministrativeUnit: '北京市' });
    expect(capital).toMatchObject({ polityId: 'prc', placeId: 'beijing', validFrom: 1949, role: 'primary', status: 'formal' });
    expect(asset).toMatchObject({ placeId: 'beijing', constructionFrom: 1949 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('北京市东城区');
    expect(detail?.associatedPolities).toContain('prc');
    expect(detail?.associatedEvents).toContain('prc-founded');
    expect(detail?.associatedPeople).toContain('mao-zedong');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('prc')).toBe(true);
    expect(eventIds.has('prc-founded')).toBe(true);
    expect(peopleIds.has('mao-zedong')).toBe(true);
  });
});
