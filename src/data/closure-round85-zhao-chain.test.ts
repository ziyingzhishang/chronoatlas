import { describe, expect, it } from 'vitest';
import { getPolityDetail } from './polity-details';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { eventDetails } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { places } from './places';
import { sourceById } from './sources';

describe('round eighty-fifth navigable closure: Zhao and Handan', () => {
  it('connects polity, foundation event, capital city, city-history location and heritage', () => {
    const polity = getPolityDetail('zhao_warring');
    const event = events.find((item) => item.id === 'zhao-warring-founded-eighth-batch');
    const eventDetail = eventDetails.find((item) => item.eventId === event?.id);
    const heritage = heritageAssets.find((item) => item.id === 'zhao-wang-city-site');
    const heritageDetail = getHeritageDetail('zhao-wang-city-site');
    const handan = places.find((item) => item.id === 'handan');
    const capital = capitalHistory.find((item) => item.polityId === 'zhao_warring' && item.placeId === 'handan');

    expect(polity?.eventIds).toContain(event?.id);
    expect(polity?.heritageIds).toContain(heritage?.id);
    expect(event?.placeId).toBe('handan');
    expect(eventDetail?.polityIds).toContain('zhao_warring');
    expect(eventDetail?.locationIds).toContain('handan');
    expect(capital?.placeId).toBe('handan');
    expect(heritage?.placeId).toBe('handan');
    expect(heritageDetail?.associatedPolities).toContain('zhao_warring');
    expect(heritageDetail?.associatedEvents).toEqual(expect.arrayContaining([event?.id, 'qin-unification']));
    expect(handan?.modernName).toBe('邯郸市');
  });

  it('keeps every newly traversable endpoint source-backed', () => {
    const event = events.find((item) => item.id === 'zhao-warring-founded-eighth-batch');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const heritageDetail = getHeritageDetail('zhao-wang-city-site');
    const sourceIds = new Set([...event?.sourceIds ?? [], ...detail?.sourceIds ?? [], ...heritageDetail?.sourceIds ?? []]);

    expect(sourceIds.size).toBeGreaterThan(0);
    expect([...sourceIds].every((sourceId) => sourceById[sourceId])).toBe(true);
  });
});
