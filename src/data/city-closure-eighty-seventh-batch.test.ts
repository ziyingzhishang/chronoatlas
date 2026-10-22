import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { capitalHistory } from './capital-history';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const byId = <T extends { id: string }>(items: readonly T[], id: string) => items.find(item => item.id === id);

describe('eighty-seventh ancient-capital closures: Ji/Beijing and Pingcheng/Datong', () => {
  it('closes Yan Ji -> Beijing -> Warring States event -> heritage navigation', () => {
    const place = byId(places, 'ji');
    const polity = getPolityDetail('yan_warring');
    const event = byId(events, 'yan-warring-founded-eighth-batch');
    const detail = eventDetails.find(item => item.eventId === 'yan-warring-founded-eighth-batch');
    const heritage = byId(heritageAssets, 'yan-ji-city-site');
    const heritageDetail = getHeritageDetail('yan-ji-city-site');

    expect(place).toEqual(expect.objectContaining({ historicalName: '蓟', modernName: '北京市城区及周边', modernAdministrativeUnit: '北京市' }));
    expect(place?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(polity?.eventIds).toContain('yan-warring-founded-eighth-batch');
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'ji', validFrom: -403, validTo: -222 }),
    ]));
    expect(event).toEqual(expect.objectContaining({ placeId: 'ji', year: -403 }));
    expect(event?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(detail?.polityIds).toContain('yan_warring');
    expect(detail?.locationIds).toContain('ji');
    expect(detail?.participants.map(item => item.personId)).toContain('yan-zhaowang');
    expect(people.some(person => person.id === 'yan-zhaowang')).toBe(true);
    expect(heritage).toEqual(expect.objectContaining({ placeId: 'ji' }));
    expect(heritage?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(heritageDetail).toEqual(expect.objectContaining({
      associatedPolities: expect.arrayContaining(['yan_warring']),
      associatedEvents: expect.arrayContaining(['yan-warring-founded-eighth-batch']),
    }));
    expect(heritageDetail?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
  });

  it('closes Northern Wei Pingcheng -> Northern Wei foundation -> Yungang -> Datong', () => {
    const place = byId(places, 'pingcheng');
    const polity = getPolityDetail('wei_northern');
    const event = byId(events, 'northern-wei-founded');
    const detail = eventDetails.find(item => item.eventId === 'northern-wei-founded');
    const heritage = byId(heritageAssets, 'yungang-grottoes');
    const heritageDetail = getHeritageDetail('yungang-grottoes');

    expect(place).toEqual(expect.objectContaining({ historicalName: '平城', modernName: '大同市一带', modernAdministrativeUnit: '山西省大同市' }));
    expect(place?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(polity?.eventIds).toContain('northern-wei-founded');
    expect(polity?.heritageIds).toContain('yungang-grottoes');
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'pingcheng', validFrom: 386, validTo: 494 }),
    ]));
    expect(event).toEqual(expect.objectContaining({ placeId: 'pingcheng', year: 386 }));
    expect(event?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(detail?.polityIds).toContain('wei_northern');
    expect(detail?.locationIds).toContain('pingcheng');
    expect(detail?.participants.map(item => item.personId)).toContain('tuoba-gui');
    expect(people.some(person => person.id === 'tuoba-gui')).toBe(true);
    expect(heritage).toEqual(expect.objectContaining({ placeId: 'pingcheng' }));
    expect(heritage?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(heritageDetail).toEqual(expect.objectContaining({
      associatedPolities: expect.arrayContaining(['wei_northern']),
      associatedEvents: expect.arrayContaining(['northern-wei-founded']),
    }));
    expect(heritageDetail?.sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
  });
});
