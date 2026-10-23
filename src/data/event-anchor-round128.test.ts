import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { polityDetails } from './polity-details';
import { sourceNotes } from './sources';

describe('round 128 precise historical anchors', () => {
  it('registers the Modu accession as distinct from Xiongnu formation', () => {
    const event = events.find((item) => item.id === 'xiongnu-modu-assumes-chanyu');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const claim = claims.find((item) => item.id === 'claim-modu-participated-xiongnu-modu-assumes-chanyu');

    expect(event).toMatchObject({ year: -209, datePrecision: 'year', placeId: 'xiongnu_core' });
    expect(detail).toMatchObject({ polityIds: ['xiongnu'], locationIds: ['xiongnu_core'], relatedEventIds: ['xiongnu-founded'] });
    expect(detail?.participants).toEqual([expect.objectContaining({ personId: 'modu-chanyu', relationType: 'direct' })]);
    expect(claim).toMatchObject({ subjectId: 'modu-chanyu', objectId: event?.id, validFrom: -209, validTo: -209 });
  });

  it('keeps Western Liao formation, imperial title, and capital establishment separate', () => {
    const event = events.find((item) => item.id === 'western-liao-emperor-1132');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const polity = polityDetails.find((item) => item.polityId === 'western_liao');
    const claim = claims.find((item) => item.id === 'claim-yelu-dashi-participated-western-liao-emperor-1132');

    expect(event).toMatchObject({ year: 1132, datePrecision: 'approximate', verification: 'partial' });
    expect(event?.placeId).toBeUndefined();
    expect(detail).toMatchObject({ polityIds: ['western_liao'], relatedEventIds: ['western-liao-founded'], locationIds: ['balasagun'] });
    expect(detail?.uncertaintyNote).toMatch(/不是1132年.*称帝地点/);
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ startYear: 1132, endYear: 1132 }),
      expect.objectContaining({ startYear: 1134, endYear: 1134 }),
    ]));
    expect(polity?.eventIds).toEqual(expect.arrayContaining(['western-liao-founded', event?.id]));
    expect(claim).toMatchObject({ subjectId: 'yelu-dashi', objectId: event?.id, datePrecision: 'approximate' });
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? []), ...(claim?.sourceIds ?? [])]) {
      expect(sourceNotes.some((source) => source.id === sourceId), sourceId).toBe(true);
    }
  });
});
