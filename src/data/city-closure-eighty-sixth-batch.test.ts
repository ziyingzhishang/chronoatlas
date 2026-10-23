import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { capitalHistory } from './capital-history';
import { getPolityDetail } from './polity-details';

const byId = <T extends { id: string }>(items: readonly T[], id: string) => items.find(item => item.id === id);

describe('eighty-sixth city closure: Jiankang and Kaifeng', () => {
  it('closes the Jiankang -> Wu -> foundation event -> Sun Quan -> heritage -> Nanjing chain', () => {
    const place = byId(places, 'jiankang');
    const polity = getPolityDetail('wu_three');
    const event = byId(events, 'wu-three-founded');
    const detail = eventDetails.find(item => item.eventId === 'wu-three-founded');
    const heritage = byId(heritageAssets, 'jiankang-six-dynasties-city-site');
    const heritageDetail = getHeritageDetail('jiankang-six-dynasties-city-site');

    expect(place?.historicalName).toBe('建康');
    expect(place?.aliases).toEqual(expect.arrayContaining(['建业']));
    expect(place?.modernName).toBe('南京市');
    expect(capitalHistory).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'wu_three', placeId: 'jiankang', validFrom: 222, validTo: 280 }),
    ]));
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 222, validTo: 280 }),
    ]));
    expect(polity?.eventIds).toContain('wu-three-founded');
    expect(event).toEqual(expect.objectContaining({ placeId: 'jiankang', year: 229, verification: 'checked' }));
    expect(detail?.polityIds).toContain('wu_three');
    expect(detail?.locationIds).toContain('jiankang');
    expect(detail?.participants.map(item => item.personId)).toContain('sun-quan');
    expect(people.some(person => person.id === 'sun-quan')).toBe(true);
    expect(heritage?.placeId).toBe('jiankang');
    expect(heritageDetail?.associatedPolities).toContain('wu_three');
    expect(heritageDetail?.associatedEvents).toContain('wu-three-founded');
    expect(heritageDetail?.sourceIds.length).toBeGreaterThan(0);
  });

  it('closes the Kaifeng -> Later Liang -> foundation event -> Zhu Wen -> city heritage -> Kaifeng chain', () => {
    const place = byId(places, 'kaifeng');
    const polity = getPolityDetail('liang_later');
    const event = byId(events, 'later-liang-five-dynasties-founded');
    const detail = eventDetails.find(item => item.eventId === 'later-liang-five-dynasties-founded');
    const heritage = byId(heritageAssets, 'kaifeng-northern-song-city-site');
    const heritageDetail = getHeritageDetail('kaifeng-northern-song-city-site');

    expect(place?.historicalName).toBe('开封');
    expect(place?.aliases).toEqual(expect.arrayContaining(['大梁', '汴州']));
    expect(place?.modernName).toBe('开封市');
    expect(capitalHistory).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'liang_later', placeId: 'kaifeng', validFrom: 907, validTo: 923, confidence: 'high' }),
    ]));
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'kaifeng', validFrom: 907, validTo: 923 }),
    ]));
    expect(polity?.eventIds).toEqual(['later-liang-five-dynasties-founded', 'later-liang-ended-923']);
    expect(event).toEqual(expect.objectContaining({ placeId: 'kaifeng', year: 907, verification: 'checked' }));
    expect(detail?.polityIds).toEqual(['liang_later']);
    expect(detail?.locationIds).toEqual(['kaifeng']);
    expect(detail?.participants.map(item => item.personId)).toContain('zhu-wen');
    expect(people.some(person => person.id === 'zhu-wen')).toBe(true);
    expect(heritage?.placeId).toBe('kaifeng');
    expect(heritageDetail?.associatedPolities).toContain('liang_later');
    expect(heritageDetail?.associatedEvents).toContain('later-liang-five-dynasties-founded');
    expect(heritageDetail?.sourceIds.length).toBeGreaterThan(0);
  });
});
