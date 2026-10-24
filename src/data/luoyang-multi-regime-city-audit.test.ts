import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('洛阳多政权城市视角历史链审计', () => {
  it('keeps Sui-Tang-Wuzhou and Later Tang layers connected to modern Luoyang without collapsing them', () => {
    const suiTangAsset = heritageAssets.find((candidate) => candidate.id === 'luoyang-sui-tang-city-site');
    const laterTangAsset = heritageAssets.find((candidate) => candidate.id === 'later-tang-luoyang-city-site');
    const suiTangDetail = getHeritageDetail('luoyang-sui-tang-city-site');
    const laterTangDetail = getHeritageDetail('later-tang-luoyang-city-site');
    const place = places.find((candidate) => candidate.id === 'luoyang');
    const capitalTerms = capitalHistory.filter((candidate) => candidate.placeId === 'luoyang' && ['sui', 'wu_zhou', 'tang_later'].includes(candidate.polityId));
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '洛阳市', modernAdministrativeUnit: '河南省' });
    expect(capitalTerms).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'sui', validFrom: 605, validTo: 618 }),
      expect.objectContaining({ polityId: 'wu_zhou', validFrom: 690, validTo: 705 }),
      expect.objectContaining({ polityId: 'tang_later', validFrom: 923, validTo: 936 }),
    ]));
    expect(suiTangAsset).toMatchObject({ placeId: 'luoyang', constructionFrom: 605, constructionTo: 907 });
    expect(laterTangAsset).toMatchObject({ placeId: 'luoyang', constructionFrom: 923, constructionTo: 936 });
    for (const asset of [suiTangAsset, laterTangAsset]) {
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    }
    expect(suiTangDetail?.modernLocation).toContain('洛阳市');
    expect(laterTangDetail?.modernLocation).toContain('洛阳市');
    expect(suiTangDetail?.associatedPolities).toEqual(expect.arrayContaining(['sui', 'tang', 'wu_zhou']));
    expect(laterTangDetail?.associatedPolities).toEqual(expect.arrayContaining(['tang_later', 'jin_later']));
    expect(suiTangDetail?.associatedEvents).toEqual(expect.arrayContaining(['sui-founded', 'tang-founded', 'wu-zhou-founded']));
    expect(laterTangDetail?.associatedEvents).toEqual(expect.arrayContaining(['tang-later-founded', 'later-tang-ended-936', 'jin-later-founded']));
    expect(suiTangDetail?.associatedPeople).toEqual(expect.arrayContaining(['yang-jian', 'li-yuan', 'li-shimin', 'wu-zhao']));
    expect(laterTangDetail?.associatedPeople).toEqual(expect.arrayContaining(['li-cunxu', 'li-congke', 'shi-jingtang']));
    for (const detail of [suiTangDetail, laterTangDetail]) {
      expect(detail).toBeDefined();
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
      expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
      expect(detail?.presentDayValue).toBeTruthy();
    }
    for (const polityId of ['sui', 'tang', 'wu_zhou', 'tang_later', 'jin_later']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['sui-founded', 'tang-founded', 'wu-zhou-founded', 'tang-later-founded', 'later-tang-ended-936', 'jin-later-founded']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['yang-jian', 'li-yuan', 'li-shimin', 'wu-zhao', 'li-cunxu', 'li-congke', 'shi-jingtang']) expect(peopleIds.has(personId)).toBe(true);
  });
});
