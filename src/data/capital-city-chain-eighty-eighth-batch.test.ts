import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { polityDetails } from './polity-details';
import { places } from './places';
import { sourceById } from './sources';

const chains = [
  {
    name: '统万城',
    polityId: 'xia',
    eventId: 'xia-capital-tongwan-established',
    placeId: 'zhitong',
    heritageId: 'tongwan-city-site',
    personId: 'heliAN-bobo',
    phase: { validFrom: 413, validTo: 431 },
  },
  {
    name: '姑臧',
    polityId: 'northern_liang',
    eventId: 'northern-liang-moved-guzang',
    placeId: 'guzang',
    heritageId: 'guzang-ancient-city-site',
    personId: 'juqu-mengxun',
    phase: { validFrom: 401, validTo: 439 },
  },
] as const;

describe('第88轮古都闭环：姑臧与统万城', () => {
  it('连接政权、迁都或都城营建事件、首都阶段、遗产和现代地名', () => {
    for (const chain of chains) {
      const polity = polityDetails.find((detail) => detail.polityId === chain.polityId);
      const event = events.find((candidate) => candidate.id === chain.eventId);
      const eventDetail = eventDetails.find((detail) => detail.eventId === chain.eventId);
      const phase = capitalHistory.find((record) => record.polityId === chain.polityId && record.placeId === chain.placeId);
      const asset = heritageAssets.find((candidate) => candidate.id === chain.heritageId);
      const heritageDetail = getHeritageDetail(chain.heritageId);
      const place = places.find((candidate) => candidate.id === chain.placeId);

      expect(polity?.eventIds, chain.name).toContain(chain.eventId);
      expect(polity?.capitalPhases, chain.name).toEqual(expect.arrayContaining([
        expect.objectContaining({ placeId: chain.placeId, ...chain.phase }),
      ]));
      expect(event?.placeId, chain.name).toBe(chain.placeId);
      expect(event?.sourceIds.length, chain.name).toBeGreaterThan(0);
      expect(event?.references?.length, chain.name).toBeGreaterThan(0);
      expect(eventDetail?.polityIds, chain.name).toContain(chain.polityId);
      expect(eventDetail?.locationIds, chain.name).toContain(chain.placeId);
      expect(eventDetail?.participants.map(({ personId }) => personId), chain.name).toContain(chain.personId);
      expect(phase, chain.name).toEqual(expect.objectContaining({ placeId: chain.placeId, ...chain.phase }));
      expect(asset?.placeId, chain.name).toBe(chain.placeId);
      expect(heritageDetail?.associatedPolities, chain.name).toContain(chain.polityId);
      expect(heritageDetail?.associatedEvents, chain.name).toContain(chain.eventId);
      expect(place?.modernName, chain.name).toBeTruthy();
      expect(place?.modernAdministrativeUnit, chain.name).toBeTruthy();
      expect(place?.mappingStatus, chain.name).not.toBe('debated');
      expect([...new Set([
        ...(event?.sourceIds ?? []),
        ...(eventDetail?.sourceIds ?? []),
        ...(heritageDetail?.sourceIds ?? []),
        ...(phase?.sourceIds ?? []),
      ])].every((sourceId) => sourceById[sourceId]), chain.name).toBe(true);
    }
  });

  it('不把两座古都的不同阶段合并成政权建立当日', () => {
    expect(events.find((event) => event.id === 'xia-capital-tongwan-established')?.year).toBe(413);
    expect(events.find((event) => event.id === 'northern-liang-moved-guzang')?.year).toBe(401);
    expect(events.find((event) => event.id === 'xia-sixteen-states-founded-eighth-batch')?.year).toBe(407);
    expect(events.find((event) => event.id === 'northern-liang-founded')?.year).toBe(397);
  });
});
