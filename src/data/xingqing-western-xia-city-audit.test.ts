import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('兴庆府西夏城市视角历史链审计', () => {
  it('keeps the Western Xia capital, imperial tombs and 1227 transition connected to modern Yinchuan', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'western-xia-imperial-tombs');
    const detail = getHeritageDetail('western-xia-imperial-tombs');
    const place = places.find((candidate) => candidate.id === 'xingqing');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'western_xia' && candidate.placeId === 'xingqing');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '银川市城区一带', modernAdministrativeUnit: '宁夏回族自治区银川市' });
    expect(capital).toMatchObject({ polityId: 'western_xia', placeId: 'xingqing', validFrom: 1038, validTo: 1227 });
    expect(asset).toMatchObject({ placeId: 'xingqing', constructionFrom: 1038, constructionTo: 1227 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('银川市');
    expect(detail?.associatedPolities).toContain('western_xia');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['western-xia-founded', 'western-xia-ended-1227']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['li-yuanhao', 'li-xian-western-xia']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    expect(polityIds.has('western_xia')).toBe(true);
    for (const eventId of ['western-xia-founded', 'western-xia-ended-1227']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['li-yuanhao', 'li-xian-western-xia']) expect(peopleIds.has(personId)).toBe(true);
  });
});
