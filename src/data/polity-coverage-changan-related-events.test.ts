import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';

const expectedCityHistoryEvents = [
  'changan-han-capital',
  'daming-palace-built',
  'changan-gengshi',
  'changan-xin-founded',
  'changan-former-qin',
  'changan-later-qin',
  'tang-changan-end',
  'tang-founded-changan',
];

describe('polity coverage city-history related events', () => {
  it('catalogs every audited Chang’an related event with a complete city-history detail', () => {
    const eventById = new Map(events.map((event) => [event.id, event]));
    const detailById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    for (const eventId of expectedCityHistoryEvents) {
      const event = eventById.get(eventId);
      const detail = detailById.get(eventId);

      expect(event, eventId).toBeDefined();
      expect(event?.placeId, eventId).toBe('changan');
      expect(event?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail, eventId).toBeDefined();
      expect(detail?.locationIds, eventId).toContain('changan');
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThan(0);
      expect(detail?.consequences.length, eventId).toBeGreaterThan(0);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, eventId).toBeTruthy();
    }
  });

  it('removes the unresolved related-event gaps for the seven audited polities', () => {
    const report = auditPolityCoverage();
    const polityIds = ['han_western', 'xin', 'han_eastern', 'former_zhao', 'later_qin', 'tang', 'gengshi'];

    for (const polityId of polityIds) {
      expect(report.byPolity(polityId).gaps, polityId).not.toEqual(expect.arrayContaining([
        expect.objectContaining({ code: 'unresolved-event-reference' }),
      ]));
    }
  });

  it('keeps the Han palace expansion linked to a Han-era city node', () => {
    expect(eventDetails.find((detail) => detail.eventId === 'han-wudi-expands-changan')?.relatedEventIds)
      .not.toContain('daming-palace-built');
    expect(eventDetails.find((detail) => detail.eventId === 'han-wudi-expands-changan')?.relatedEventIds)
      .toContain('changan-han-capital');
  });
});
