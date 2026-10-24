import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

describe('元代上都与大都双都城市视角历史链审计', () => {
  it('keeps the seasonal Shangdu and primary Dadu phases distinct while connecting both to Yuan people and events', () => {
    const shangduAsset = heritageAssets.find((candidate) => candidate.id === 'yuan-shangdu-site');
    const daduAsset = heritageAssets.find((candidate) => candidate.id === 'yuan-dadu-site');
    const shangduDetail = getHeritageDetail('yuan-shangdu-site');
    const daduDetail = getHeritageDetail('yuan-dadu-site');
    const shangdu = places.find((candidate) => candidate.id === 'shangdu');
    const dadu = places.find((candidate) => candidate.id === 'dadu');
    const yuanCapitals = capitalHistory.filter((candidate) => candidate.polityId === 'yuan');
    const sourceIds = new Set(Object.keys(sourceById));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));

    expect(shangdu).toMatchObject({ modernName: '元上都遗址', modernAdministrativeUnit: '内蒙古自治区锡林郭勒盟正蓝旗' });
    expect(dadu).toMatchObject({ modernName: '北京市', modernAdministrativeUnit: '北京市' });
    expect(yuanCapitals).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'shangdu', role: 'secondary', status: 'seasonal', validFrom: 1274, validTo: 1364 }),
      expect.objectContaining({ placeId: 'dadu', role: 'primary', status: 'formal', validFrom: 1272, validTo: 1368 }),
    ]));
    expect(shangduAsset).toMatchObject({ placeId: 'shangdu', constructionFrom: 1256, constructionTo: 1368 });
    expect(daduAsset).toMatchObject({ placeId: 'dadu', constructionFrom: 1267, constructionTo: 1368 });
    for (const asset of [shangduAsset, daduAsset]) expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    expect(shangduDetail?.modernLocation).toContain('正蓝旗');
    expect(daduDetail?.modernLocation).toContain('北京市');
    expect(shangduDetail?.associatedPolities).toContain('yuan');
    expect(daduDetail?.associatedPolities).toContain('yuan');
    expect(shangduDetail?.associatedEvents).toEqual(expect.arrayContaining(['yuan-founded', 'yuan-shangdu-built']));
    expect(daduDetail?.associatedEvents).toEqual(expect.arrayContaining(['yuan-founded', 'yuan-dadu-built']));
    expect(shangduDetail?.associatedPeople).toContain('kublai');
    expect(daduDetail?.associatedPeople).toEqual(expect.arrayContaining(['kublai', 'liu-bingzhong']));
    for (const detail of [shangduDetail, daduDetail]) {
      expect(detail).toBeDefined();
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
      expect(detail?.historicalAssociations.length).toBeGreaterThan(1);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(1);
      expect(detail?.presentDayValue).toBeTruthy();
    }
    expect(polityIds.has('yuan')).toBe(true);
    for (const eventId of ['yuan-founded', 'yuan-shangdu-built', 'yuan-dadu-built']) expect(eventIds.has(eventId)).toBe(true);
    for (const personId of ['kublai', 'liu-bingzhong']) expect(peopleIds.has(personId)).toBe(true);
  });
});
