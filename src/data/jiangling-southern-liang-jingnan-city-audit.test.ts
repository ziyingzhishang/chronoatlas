import { describe, expect, it } from 'vitest';

import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('江陵南梁与荆南城市视角历史链审计', () => {
  it('keeps the Southern Liang and Jingnan city layers connected to modern Jingzhou', () => {
    const southernLiangAsset = heritageAssets.find((candidate) => candidate.id === 'southern-liang-jiangling-city-site');
    const jingnanAsset = heritageAssets.find((candidate) => candidate.id === 'jingnan-jiangling-city-site');
    const southernLiangDetail = getHeritageDetail('southern-liang-jiangling-city-site');
    const jingnanDetail = getHeritageDetail('jingnan-jiangling-city-site');
    const place = places.find((candidate) => candidate.id === 'jiangling');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(place).toMatchObject({ modernName: '荆州市', modernAdministrativeUnit: '湖北省荆州市' });
    expect(southernLiangAsset).toMatchObject({ placeId: 'jiangling', constructionFrom: 552, constructionTo: 557 });
    expect(jingnanAsset).toMatchObject({ placeId: 'jiangling', constructionFrom: 924, constructionTo: 963 });
    expect(southernLiangAsset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(jingnanAsset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(southernLiangDetail?.modernLocation).toContain('荆州市');
    expect(jingnanDetail?.modernLocation).toContain('荆州市');
    expect(southernLiangDetail?.associatedPolities).toContain('liang_southern');
    expect(jingnanDetail?.associatedPolities).toEqual(expect.arrayContaining(['jingnan', 'song_northern']));
    expect(southernLiangDetail?.associatedEvents).toContain('southern-liang-founded');
    expect(jingnanDetail?.associatedEvents).toEqual(expect.arrayContaining(['jingnan-founded', 'jingnan-ended-963']));
    expect(southernLiangDetail?.associatedPeople).toContain('xiao-yan');
    expect(jingnanDetail?.associatedPeople).toEqual(expect.arrayContaining(['gao-jixing', 'gao-baorong', 'gao-baoxu', 'gao-jichong', 'zhao-kuangyin']));

    for (const detail of [southernLiangDetail, jingnanDetail]) {
      expect(detail).toBeDefined();
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
      expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
      expect(detail?.presentDayValue).toBeTruthy();
    }
    for (const polityId of ['liang_southern', 'jingnan', 'song_northern']) expect(polityIds.has(polityId)).toBe(true);
    for (const eventId of ['southern-liang-founded', 'jingnan-founded', 'jingnan-ended-963']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['xiao-yan', 'gao-jixing', 'gao-baorong', 'gao-baoxu', 'gao-jichong', 'zhao-kuangyin']) expect(peopleIds.has(personId)).toBe(true);
  });
});
