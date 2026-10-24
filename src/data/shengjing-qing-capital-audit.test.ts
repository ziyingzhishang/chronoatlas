import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('盛京后金与清入关前城市视角历史链审计', () => {
  it('keeps the Later Jin relocation, Qing state phase and 1644 Beijing transition connected to modern Shenyang', () => {
    const asset = heritageAssets.find((candidate) => candidate.id === 'qing-shengjing-palace-city-site');
    const detail = getHeritageDetail('qing-shengjing-palace-city-site');
    const place = places.find((candidate) => candidate.id === 'shengjing');
    const laterJinCapital = capitalHistory.find((candidate) => candidate.polityId === 'later_jin' && candidate.placeId === 'shengjing');
    const qingCapital = capitalHistory.find((candidate) => candidate.polityId === 'qing' && candidate.placeId === 'shengjing');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '沈阳市', modernAdministrativeUnit: '辽宁省沈阳市' });
    expect(laterJinCapital).toMatchObject({ polityId: 'later_jin', placeId: 'shengjing', validFrom: 1626, validTo: 1636 });
    expect(qingCapital).toMatchObject({ polityId: 'qing', placeId: 'shengjing', validFrom: 1636, validTo: 1644 });
    expect(asset).toMatchObject({ placeId: 'shengjing', constructionFrom: 1625, constructionTo: 1644 });
    expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail).toBeDefined();
    expect(detail?.modernLocation).toContain('沈阳市');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['qing', 'later_jin']));
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['qing-founded', 'qing-enters-pass']));
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['hongtaiji', 'shunzhi']));
    expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
    expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
    expect(detail?.presentDayValue).toBeTruthy();
    for (const polityId of ['later_jin', 'qing']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['qing-founded', 'qing-enters-pass']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['hongtaiji', 'shunzhi']) expect(peopleIds.has(personId)).toBe(true);
  });
});
