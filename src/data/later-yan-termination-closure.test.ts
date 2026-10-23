import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Later Yan termination closure', () => {
  test('records the 407 Longcheng succession as the Later Yan termination event', () => {
    const event = events.find((item) => item.id === 'later-yan-ended-407');
    const detail = eventDetails.find((item) => item.eventId === 'later-yan-ended-407');

    expect(event).toMatchObject({ year: 407, placeId: 'longcheng', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'later-yan-ended-407',
      polityIds: ['later_yan', 'northern_yan'],
      locationIds: ['longcheng'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'murong-xi' }),
      expect.objectContaining({ personId: 'gao-yun' }),
    ]));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  test('keeps the Later Yan Longcheng terminal layer distinct from Northern Yan heritage', () => {
    const polity = getPolityDetail('later_yan');
    const heritage = heritageAssets.find((item) => item.id === 'later-yan-longcheng-terminal-site');
    const detail = getHeritageDetail('later-yan-longcheng-terminal-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'longcheng', validFrom: 398, validTo: 407 }),
    ]));
    expect(polity?.eventIds).toContain('later-yan-ended-407');
    expect(polity?.heritageIds).toContain('later-yan-longcheng-terminal-site');
    expect(heritage).toMatchObject({ placeId: 'longcheng', constructionFrom: 398, constructionTo: 407 });
    expect(detail?.associatedEvents).toContain('later-yan-ended-407');
    expect(detail?.associatedPeople).toContain('murong-xi');
  });

  test('exposes Murong Xi as the last Later Yan ruler and Gao Yun as the transition figure', () => {
    expect(people.find((person) => person.id === 'murong-xi')).toMatchObject({ polityIds: ['later_yan'] });
    expect(getPersonDetail('murong-xi')).toMatchObject({
      personId: 'murong-xi',
      keyEvents: expect.arrayContaining(['later-yan-ended-407']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-murong-xi-ruled-later-yan' }),
      expect.objectContaining({ id: 'claim-murong-xi-participated-later-yan-ended-407' }),
      expect.objectContaining({ id: 'claim-murong-xi-enemy-gao-yun-termination-407' }),
    ]));
  });
});
