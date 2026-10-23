import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { sourceById } from './sources';

const byId = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id);

describe('round eighty-eighth navigable closure: Luosie and Dali', () => {
  it('connects Tibetan formation, the Luosie capital phase, heritage and modern Lhasa', () => {
    const polity = getPolityDetail('tibetan_empire');
    const event = byId(events, 'tibetan-founded');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const capital = capitalHistory.find((item) => item.polityId === 'tibetan_empire' && item.placeId === 'luosie');
    const heritage = byId(heritageAssets, 'tibetan-lhasa-city-site');
    const heritageDetail = getHeritageDetail('tibetan-lhasa-city-site');
    const city = byId(places, 'luosie');

    expect(polity?.eventIds).toContain(event?.id);
    expect(event).toEqual(expect.objectContaining({ placeId: 'luosie', year: 618 }));
    expect(detail?.locationIds).toContain('luosie');
    expect(capital).toEqual(expect.objectContaining({ placeId: 'luosie', validFrom: 630, validTo: 842 }));
    expect(heritage?.placeId).toBe('luosie');
    expect(heritageDetail?.associatedPolities).toContain('tibetan_empire');
    expect(heritageDetail?.associatedEvents).toContain(event?.id);
    expect(city?.modernName).toBe('拉萨市');
  });

  it('exposes the early Yalong political-center phase as its own city event', () => {
    const polity = getPolityDetail('tibetan_empire');
    const event = byId(events, 'tibetan-yalong-center');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const city = byId(places, 'yalong');

    expect(polity?.eventIds).toContain('tibetan-yalong-center');
    expect(event).toEqual(expect.objectContaining({ placeId: 'yalong', datePrecision: 'range' }));
    expect(detail?.locationIds).toContain('yalong');
    expect(city?.modernName).toBe('山南市一带');
  });

  it('connects Dali formation, the Dali capital phase, heritage and modern Dali', () => {
    const polity = getPolityDetail('dali');
    const event = byId(events, 'dali-founded');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const capital = capitalHistory.find((item) => item.polityId === 'dali' && item.placeId === 'yangjumei');
    const heritage = byId(heritageAssets, 'dali-city-site');
    const heritageDetail = getHeritageDetail('dali-city-site');
    const city = byId(places, 'dali_city');

    expect(polity?.eventIds).toContain(event?.id);
    expect(event).toEqual(expect.objectContaining({ placeId: 'dali_city', year: 937 }));
    expect(detail?.locationIds).toContain('dali_city');
    expect(capital).toEqual(expect.objectContaining({ placeId: 'yangjumei', validFrom: 937, validTo: 1253 }));
    expect(heritage?.placeId).toBe('dali_city');
    expect(heritageDetail?.associatedPolities).toContain('dali');
    expect(heritageDetail?.associatedEvents).toContain(event?.id);
    expect(city?.modernName).toBe('大理古城');
  });

  it('keeps the existing Nanzhao Taihe chain source-backed', () => {
    const event = byId(events, 'nanzhao-founded');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const capital = capitalHistory.find((item) => item.polityId === 'nanzhao' && item.placeId === 'taihe');
    const heritage = byId(heritageAssets, 'nanzhao-taihe-city-site');
    const heritageDetail = getHeritageDetail('nanzhao-taihe-city-site');
    const city = byId(places, 'taihe');

    expect(detail?.locationIds).toContain('taihe');
    expect(capital).toEqual(expect.objectContaining({ placeId: 'taihe', validFrom: 738, validTo: 778 }));
    expect(heritage?.placeId).toBe('taihe');
    expect(heritageDetail?.associatedEvents).toContain(event?.id);
    expect(city?.modernAdministrativeUnit).toBe('云南省大理市');
  });

  it('requires source records for both newly navigable event endpoints', () => {
    for (const eventId of ['tibetan-founded', 'dali-founded']) {
      const event = byId(events, eventId);
      expect(event?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
    }
  });
});
