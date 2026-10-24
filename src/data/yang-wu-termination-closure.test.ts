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

describe('Yang Wu termination closure', () => {
  test('separates the Southern Tang abdication from the Yangzhou local transfer', () => {
    const abdication = events.find((item) => item.id === 'yang-wu-ended-937');
    const localTransfer = events.find((item) => item.id === 'yang-wu-yangzhou-transferred-937');
    const abdicationDetail = eventDetails.find((item) => item.eventId === 'yang-wu-ended-937');
    const localTransferDetail = eventDetails.find((item) => item.eventId === 'yang-wu-yangzhou-transferred-937');

    expect(abdication).toMatchObject({ id: 'yang-wu-ended-937', year: 937, placeId: 'jiankang', datePrecision: 'year' });
    expect(localTransfer).toMatchObject({ id: 'yang-wu-yangzhou-transferred-937', year: 937, placeId: 'yangzhou', datePrecision: 'year' });
    expect(abdicationDetail).toMatchObject({
      eventId: 'yang-wu-ended-937',
      polityIds: ['wu_ten', 'southern_tang'],
      locationIds: ['jiankang'],
      relatedEventIds: expect.arrayContaining(['yang-wu-founded', 'yang-wu-yangzhou-transferred-937']),
    });
    expect(localTransferDetail).toMatchObject({
      eventId: 'yang-wu-yangzhou-transferred-937',
      polityIds: ['wu_ten', 'southern_tang'],
      locationIds: ['yangzhou'],
      relatedEventIds: expect.arrayContaining(['yang-wu-ended-937']),
    });
    expect(abdicationDetail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'yang-pu' }),
      expect.objectContaining({ personId: 'li-bian' }),
    ]));
    for (const sourceId of [...(abdication?.sourceIds ?? []), ...(localTransfer?.sourceIds ?? []), ...(abdicationDetail?.sourceIds ?? []), ...(localTransferDetail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  test('keeps Yangzhou capital and heritage continuous across the Southern Tang handover', () => {
    const polity = getPolityDetail('wu_ten');
    const heritage = heritageAssets.find((item) => item.id === 'yang-wu-yangzhou-city-site');
    const detail = getHeritageDetail('yang-wu-yangzhou-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'yangzhou', validFrom: 902, validTo: 937 }),
    ]));
    expect(polity?.eventIds).toEqual(expect.arrayContaining(['yang-wu-founded', 'yang-wu-ended-937', 'yang-wu-yangzhou-transferred-937']));
    expect(polity?.heritageIds).toContain('yang-wu-yangzhou-city-site');
    expect(heritage).toMatchObject({ placeId: 'yangzhou', constructionFrom: 902, constructionTo: 937 });
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['yang-wu-founded', 'yang-wu-ended-937', 'yang-wu-yangzhou-transferred-937']));
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['wu_ten', 'southern_tang']));
  });

  test('exposes Yang Pu as the final ruler and preserves the handover relationship graph', () => {
    expect(people.find((person) => person.id === 'yang-pu')).toMatchObject({ polityIds: ['wu_ten'] });
    expect(getPersonDetail('yang-pu')).toMatchObject({
      personId: 'yang-pu',
      keyEvents: expect.arrayContaining(['yang-wu-ended-937']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-yang-pu-ruled-yang-wu' }),
      expect.objectContaining({ id: 'claim-yang-pu-participated-yang-wu-ended-937' }),
      expect.objectContaining({ id: 'claim-yang-pu-enemy-li-bian-termination-937' }),
      expect.objectContaining({ id: 'claim-li-bian-participated-yang-wu-ended-937' }),
      expect.objectContaining({ id: 'claim-li-bian-received-yangzhou-937' }),
    ]));
  });
});
