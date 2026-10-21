import { expect, test } from 'vitest';
import { events } from './events';
import { getEventDetail } from './event-details';
import { sourceById } from './sources';

const foundationCases = [
  { polityId: 'han_eastern', eventId: 'han-eastern-founded', year: 25 },
  { polityId: 'sui', eventId: 'sui-founded', year: 581 },
  { polityId: 'tang_later', eventId: 'tang-later-founded', year: 923 },
  { polityId: 'jin_later', eventId: 'jin-later-founded', year: 936 },
  { polityId: 'han_later', eventId: 'han-later-founded', year: 947 },
  { polityId: 'zhou_later', eventId: 'zhou-later-founded', year: 951 },
  { polityId: 'wu_zhou', eventId: 'wu-zhou-founded', year: 690 },
  { polityId: 'yuan', eventId: 'yuan-founded', year: 1271 },
  { polityId: 'ming', eventId: 'ming-founded', year: 1368 },
  { polityId: 'qing', eventId: 'qing-founded', year: 1636 },
  { polityId: 'republic', eventId: 'republic-founded', year: 1912 },
  { polityId: 'prc', eventId: 'prc-founded', year: 1949 },
] as const;

test('curates one explicit, source-marked foundation event for every priority polity', () => {
  for (const expected of foundationCases) {
    const event = events.find(item => item.id === expected.eventId);

    expect(event, expected.eventId).toBeDefined();
    expect(event?.year, expected.eventId).toBe(expected.year);
    expect(event?.summary, expected.eventId).toEqual(expect.any(String));
    expect(event?.summary?.trim().length, expected.eventId).toBeGreaterThan(0);
    expect(event?.sourceIds.length, expected.eventId).toBeGreaterThan(0);
    expect(event?.verification, expected.eventId).toMatch(/^(checked|partial)$/);
    expect(event?.references?.length, expected.eventId).toBeGreaterThan(0);

    for (const sourceId of event?.sourceIds ?? []) {
      expect(sourceById[sourceId], `${expected.eventId}: ${sourceId}`).toBeDefined();
    }
  }
});

test('foundation events have complete formation details without invented precision', () => {
  for (const expected of foundationCases) {
    const detail = getEventDetail(expected.eventId);
    expect(detail, expected.eventId).toBeDefined();
    expect(detail?.polityIds, expected.eventId).toContain(expected.polityId);
    expect(detail?.causes.length, expected.eventId).toBeGreaterThan(0);
    expect(detail?.phases?.length, expected.eventId).toBeGreaterThan(0);
    expect(detail?.consequences.length, expected.eventId).toBeGreaterThan(0);
    expect(detail?.sourceIds.length, expected.eventId).toBeGreaterThan(0);
    expect(detail?.uncertaintyNote?.trim().length, expected.eventId).toBeGreaterThan(0);
    expect(detail?.locationIds, expected.eventId).toBeDefined();

    for (const sourceId of detail?.sourceIds ?? []) {
      expect(sourceById[sourceId], `${expected.eventId}: ${sourceId}`).toBeDefined();
    }
  }
});
