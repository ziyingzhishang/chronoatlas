import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('龙城北燕城市视角历史链审计', () => {
  it('keeps the regional Longcheng capital reference, Northern Yan tomb uncertainty and 436 transition connected', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'northern-yan-longcheng-tomb');
    const detail = getHeritageDetail('northern-yan-longcheng-tomb');
    const place = places.find((candidate) => candidate.id === 'longcheng');
    const capital = capitalHistory.find((candidate) => candidate.polityId === 'northern_yan' && candidate.placeId === 'longcheng');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '朝阳及和龙一带', modernAdministrativeUnit: '辽宁省朝阳市／吉林省和龙市', mappingStatus: 'regional' });
    expect(capital).toMatchObject({ polityId: 'northern_yan', placeId: 'longcheng', validFrom: 407, validTo: 436 });
    expect(asset).toMatchObject({ placeId: 'longcheng', constructionFrom: 407, constructionTo: 436 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('朝阳市');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['northern_yan', 'wei_northern']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['northern-yan-founded', 'northern-yan-ended-436']));
    expect(detail?.associatedPeople).toContain('feng-hong');
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['northern_yan', 'wei_northern']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['northern-yan-founded', 'northern-yan-ended-436']) expect(eventIds.has(eventId)).toBe(true);
    expect(peopleIds.has('feng-hong')).toBe(true);
  });
});
