import { describe, expect, it } from 'vitest';
import { getPolityDetail } from './polity-details';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { eventDetails } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { places } from './places';
import { sourceById } from './sources';

describe('round eighty-seventh navigable closure: Xianyang and Linzi', () => {
  it('connects Qin State to the Xianyang relocation event, capital phase, heritage and modern place', () => {
    const polity = getPolityDetail('qin_state');
    const event = events.find((item) => item.id === 'qin-xianyang-capital');
    const eventDetail = eventDetails.find((item) => item.eventId === event?.id);
    const capital = capitalHistory.find((item) => item.polityId === 'qin_state' && item.placeId === 'xianyang');
    const heritage = heritageAssets.find((item) => item.id === 'xianyang-qin-state-palace-site');
    const heritageDetail = getHeritageDetail('xianyang-qin-state-palace-site');
    const city = places.find((item) => item.id === 'xianyang');

    expect(polity?.eventIds).toContain(event?.id);
    expect(event).toEqual(expect.objectContaining({ year: -350, placeId: 'xianyang' }));
    expect(eventDetail?.polityIds).toContain('qin_state');
    expect(eventDetail?.locationIds).toContain('xianyang');
    expect(capital).toEqual(expect.objectContaining({ validFrom: -350, validTo: -222, role: 'primary', status: 'formal' }));
    expect(heritage?.placeId).toBe('xianyang');
    expect(heritageDetail?.associatedPolities).toContain('qin_state');
    expect(heritageDetail?.associatedEvents).toContain(event?.id);
    expect(city?.modernName).toBe('咸阳市');
  });

  it('connects Qi and Linzi to the foundation event, Qin conquest endpoint, heritage and modern place', () => {
    const polity = getPolityDetail('qi_warring');
    const foundationEvent = events.find((item) => item.id === 'qi-warring-founded-eighth-batch');
    const conquestEvent = events.find((item) => item.id === 'qin-unification');
    const conquestDetail = eventDetails.find((item) => item.eventId === conquestEvent?.id);
    const capital = capitalHistory.find((item) => item.polityId === 'qi_warring' && item.placeId === 'linzi');
    const heritage = heritageAssets.find((item) => item.id === 'qi-linzi-city-site');
    const heritageDetail = getHeritageDetail('qi-linzi-city-site');
    const city = places.find((item) => item.id === 'linzi');

    expect(polity?.eventIds).toEqual(expect.arrayContaining([foundationEvent?.id, conquestEvent?.id]));
    expect(foundationEvent?.sourceIds.length).toBeGreaterThan(0);
    expect(conquestDetail?.polityIds).toContain('qi_warring');
    expect(conquestDetail?.locationIds).toContain('linzi');
    expect(capital).toEqual(expect.objectContaining({ validFrom: -403, validTo: -221, role: 'primary', status: 'formal' }));
    expect(heritage?.placeId).toBe('linzi');
    expect(heritageDetail?.associatedPolities).toContain('qi_warring');
    expect(heritageDetail?.associatedEvents).toEqual(expect.arrayContaining([foundationEvent?.id, conquestEvent?.id]));
    expect(city?.modernName).toBe('临淄区');
  });

  it('keeps both closure event and heritage endpoints source-backed', () => {
    const endpointIds = [
      'qin-xianyang-capital',
      'qi-warring-founded-eighth-batch',
      'qin-unification',
    ];
    for (const eventId of endpointIds) {
      const event = events.find((item) => item.id === eventId);
      const detail = eventDetails.find((item) => item.eventId === eventId);
      expect(event?.references?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      for (const sourceId of [...event?.sourceIds ?? [], ...detail?.sourceIds ?? []]) {
        expect(sourceById[sourceId], `${eventId}: ${sourceId}`).toBeDefined();
      }
    }

    for (const heritageId of ['xianyang-qin-state-palace-site', 'qi-linzi-city-site']) {
      const detail = getHeritageDetail(heritageId);
      expect(detail?.sourceIds.length, heritageId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), heritageId).toBe(true);
    }
  });
});
