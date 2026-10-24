import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('会宁府金上京城市视角历史链审计', () => {
  it('keeps the early Jin capital, Jurchen founding event and Acheng archaeological site connected', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'jin-huining-city-site');
    const detail = getHeritageDetail('jin-huining-city-site');
    const place = places.find((candidate) => candidate.id === 'huining');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'jin_jurchen' && candidate.placeId === 'huining');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '阿城区白城遗址一带', modernAdministrativeUnit: '黑龙江省哈尔滨市阿城区' });
    expect(capital).toMatchObject({ polityId: 'jin_jurchen', placeId: 'huining', validFrom: 1115, validTo: 1153 });
    expect(asset).toMatchObject({ placeId: 'huining', constructionFrom: 1115, constructionTo: 1153 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('哈尔滨市阿城区');
    expect(detail?.associatedPolities).toContain('jin_jurchen');
    expect(detail?.associatedEvents).toContain('jurchen-jin-founded');
    expect(detail?.associatedPeople).toContain('wanyan-aguda');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('jin_jurchen')).toBe(true);
    expect(eventIds.has('jurchen-jin-founded')).toBe(true);
    expect(peopleIds.has('wanyan-aguda')).toBe(true);
  });
});
