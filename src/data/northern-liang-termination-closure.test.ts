import { describe, expect, test } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Northern Liang termination closure', () => {
  test('records the 439 termination as a Northern Wei conquest process', () => {
    const event = events.find((item) => item.id === 'northern-liang-ended-439');
    const detail = eventDetails.find((item) => item.eventId === 'northern-liang-ended-439');

    expect(event).toMatchObject({ year: 439, placeId: 'guzang', datePrecision: 'approximate' });
    expect(detail).toMatchObject({
      eventId: 'northern-liang-ended-439',
      polityIds: ['northern_liang', 'wei_northern'],
      locationIds: expect.arrayContaining(['guzang']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['juqu-mujian', 'tuoba-tao']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'northern-liang-ended-439')).toMatchObject({
      status: 'approximate',
      expectedPrecision: 'approximate',
    });
  });

  test('keeps the姑臧 capital and city heritage continuous after Northern Liang ends', () => {
    const detail = getPolityDetail('northern_liang');
    const heritage = heritageAssets.find((asset) => asset.id === 'guzang-ancient-city-site');
    const heritageDetail = getHeritageDetail('guzang-ancient-city-site');

    expect(detail?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'guzang', validFrom: 401, validTo: 439 }),
    ]));
    expect(detail?.eventIds).toContain('northern-liang-ended-439');
    expect(detail?.heritageIds).toContain('guzang-ancient-city-site');
    expect(heritage).toMatchObject({ placeId: 'guzang' });
    expect(heritageDetail?.associatedEvents).toContain('northern-liang-ended-439');
  });

  test('exposes the final ruler and the Northern Liang–Northern Wei relationship', () => {
    expect(people.find((person) => person.id === 'juqu-mujian')).toMatchObject({
      polityIds: ['northern_liang'],
    });
    expect(getPersonDetail('juqu-mujian')?.keyEvents).toContain('northern-liang-ended-439');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-juqu-mujian-ruled-northern-liang', predicate: 'ruled', objectId: 'northern_liang' }),
      expect.objectContaining({ id: 'claim-juqu-mujian-participated-northern-liang-ended-439', predicate: 'participated-in', objectId: 'northern-liang-ended-439' }),
      expect.objectContaining({ id: 'claim-juqu-mujian-enemy-tuoba-tao', predicate: 'enemy-of', objectId: 'tuoba-tao' }),
    ]));
  });
});
