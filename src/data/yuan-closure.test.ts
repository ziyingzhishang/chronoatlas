import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { heritageAssets } from './heritage';
import { personDetails } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('元两都与元北转换闭环', () => {
  it('periodizes Shangdu and Dadu instead of using one blended capital range', () => {
    expect(capitalHistory.filter((item) => item.polityId === 'yuan').map(({ placeId, validFrom, validTo, status }) => ({ placeId, validFrom, validTo, status }))).toEqual([
      { placeId: 'shangdu', validFrom: 1271, validTo: 1273, status: 'formal' },
      { placeId: 'shangdu', validFrom: 1274, validTo: 1364, status: 'seasonal' },
      { placeId: 'dadu', validFrom: 1271, validTo: 1271, status: 'actual' },
      { placeId: 'dadu', validFrom: 1272, validTo: 1368, status: 'formal' },
    ]);
  });

  it('anchors Kublai and Liu Bingzhong to the Dadu construction phase', () => {
    for (const personId of ['kublai', 'liu-bingzhong']) {
      const detail = personDetails.find((item) => item.personId === personId);
      expect(detail?.offices.some((office) => office.placeId === 'dadu' && office.validFrom === 1267)).toBe(true);
      expect(detail?.keyEvents).toContain('yuan-dadu-built');
    }
  });

  it('keeps the Dadu heritage and event detail source-backed', () => {
    const asset = heritageAssets.find((item) => item.id === 'yuan-dadu-site');
    const detail = heritageDetails.find((item) => item.heritageId === 'yuan-dadu-site');
    const event = events.find((item) => item.id === 'yuan-dadu-built');
    const eventDetail = eventDetails.find((item) => item.eventId === 'yuan-dadu-built');
    expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(detail?.associatedEvents).toContain('yuan-dadu-built');
    expect(event?.placeId).toBe('dadu');
    expect(eventDetail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
  });

  it('splits Toghon Temur between Yuan and Northern Yuan', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-toghon-temur-ruled-yuan', validFrom: 1333, validTo: 1368 }),
      expect.objectContaining({ id: 'claim-toghon-temur-ruled-northern-yuan-ninetythird', validFrom: 1368, validTo: 1370 }),
    ]));
    const detail = personDetails.find((item) => item.personId === 'toghon-temur');
    expect(detail?.offices.map((office) => office.polityId)).toEqual(['yuan', 'northern_yuan']);
  });

  it('publishes the Yuan closure from the polity detail', () => {
    const detail = getPolityDetail('yuan');
    expect(detail?.heritageIds).toContain('yuan-dadu-site');
    expect(detail?.eventIds).toContain('yuan-dadu-built');
    expect(detail?.claimIds).toContain('claim-toghon-temur-ruled-yuan');
  });
});
