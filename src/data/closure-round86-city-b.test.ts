import { describe, expect, it } from 'vitest';
import { getPolityDetail } from './polity-details';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { eventDetails } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { sourceById } from './sources';

describe('round eighty-six navigable closure: Chengdu and Ye', () => {
  it('connects Chengdu to the Shu Han foundation, Liu Bei, capital history and heritage', () => {
    const polity = getPolityDetail('shu_three');
    const event = events.find((item) => item.id === 'shu-han-founded');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const person = people.find((item) => item.id === 'liu-bei');
    const capital = capitalHistory.find((item) => item.polityId === 'shu_three' && item.placeId === 'chengdu');
    const heritage = heritageAssets.find((item) => item.id === 'shu-han-chengdu-city-site');
    const heritageDetail = getHeritageDetail('shu-han-chengdu-city-site');
    const city = places.find((item) => item.id === 'chengdu');

    expect(polity?.eventIds).toContain(event?.id);
    expect(polity?.principalFigureIds).toContain(person?.id);
    expect(event?.placeId).toBe('chengdu');
    expect(detail?.polityIds).toContain('shu_three');
    expect(detail?.participants.map((participant) => participant.personId)).toContain('liu-bei');
    expect(detail?.locationIds).toContain('chengdu');
    expect(capital).toEqual(expect.objectContaining({ validFrom: 221, validTo: 263, role: 'primary', status: 'formal' }));
    expect(heritage?.placeId).toBe('chengdu');
    expect(heritageDetail?.associatedPolities).toContain('shu_three');
    expect(heritageDetail?.associatedEvents).toContain(event?.id);
    expect(city?.modernName).toBe('成都市');
  });

  it('connects Ye to the Later Zhao capital transfer and its existing heritage layer', () => {
    const polity = getPolityDetail('later_zhao');
    const event = events.find((item) => item.id === 'later-zhao-moves-ye');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const person = people.find((item) => item.id === 'shi-hu');
    const capital = capitalHistory.find((item) => item.polityId === 'later_zhao' && item.placeId === 'ye');
    const heritage = heritageAssets.find((item) => item.id === 'ye-city-site');
    const heritageDetail = getHeritageDetail('ye-city-site');
    const city = places.find((item) => item.id === 'ye');

    expect(polity?.eventIds).toContain(event?.id);
    expect(polity?.principalFigureIds).toContain(person?.id);
    expect(event).toEqual(expect.objectContaining({ year: 335, placeId: 'ye' }));
    expect(detail?.polityIds).toContain('later_zhao');
    expect(detail?.participants.map((participant) => participant.personId)).toContain('shi-hu');
    expect(detail?.locationIds).toContain('ye');
    expect(capital).toEqual(expect.objectContaining({ validFrom: 335, validTo: 351, role: 'primary', status: 'formal' }));
    expect(heritage?.placeId).toBe('ye');
    expect(heritageDetail?.associatedPolities).toContain('later_zhao');
    expect(heritageDetail?.associatedEvents).toContain(event?.id);
    expect(city?.modernName).toBe('临漳县一带');
  });

  it('keeps both new city endpoints backed by registered sources', () => {
    for (const eventId of ['shu-han-founded', 'later-zhao-moves-ye']) {
      const event = events.find((item) => item.id === eventId);
      const detail = eventDetails.find((item) => item.eventId === eventId);
      expect(event?.references?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      for (const sourceId of [...event?.sourceIds ?? [], ...detail?.sourceIds ?? []]) {
        expect(sourceById[sourceId], `${eventId}: ${sourceId}`).toBeDefined();
      }
    }
  });
});
