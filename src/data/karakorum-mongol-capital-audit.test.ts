import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('和林蒙古汗国城市视角历史链审计', () => {
  it('keeps the mobile-court phase distinct from the fixed Karakorum center and connects it to modern Mongolia', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'mongol-karakorum-city-site');
    const detail = getHeritageDetail('mongol-karakorum-city-site');
    const place = places.find((candidate) => candidate.id === 'mongol_karakorum');
    const capitals = capitalHistory.filter((candidate) => candidate.polityId === 'mongol' && candidate.placeId === 'mongol_karakorum');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '哈拉和林遗址', modernAdministrativeUnit: '蒙古国前杭爱省' });
    expect(capitals).toEqual(expect.arrayContaining([
      expect.objectContaining({ validFrom: 1206, validTo: 1234, status: 'actual', role: 'de_facto' }),
      expect.objectContaining({ validFrom: 1235, validTo: 1260, status: 'formal', role: 'primary' }),
    ]));
    expect(asset).toMatchObject({ placeId: 'mongol_karakorum', constructionFrom: 1220, constructionTo: 1271 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('蒙古国前杭爱省');
    expect(detail?.associatedPolities).toContain('mongol');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['mongol-founded', 'mongol-karakorum-fixed-center']));
    expect(detail?.associatedPeople).toContain('temujin');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('mongol')).toBe(true);
    for (const eventId of ['mongol-founded', 'mongol-karakorum-fixed-center']) expect(eventIds.has(eventId)).toBe(true);
    expect(peopleIds.has('temujin')).toBe(true);
  });
});
