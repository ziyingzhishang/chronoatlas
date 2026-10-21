import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';
import { sourceNotes } from './sources';

const targets = [
  { polityId: 'wei_eastern', eventId: 'eastern-wei-founded', year: 534 },
  { polityId: 'wei_western', eventId: 'western-wei-founded', year: 535 },
  { polityId: 'liang_southern', eventId: 'southern-liang-founded', year: 502 },
  { polityId: 'song_northern', eventId: 'northern-song-founded', year: 960 },
  { polityId: 'song_south', eventId: 'southern-song-founded', year: 1127 },
  { polityId: 'jin_jurchen', eventId: 'jurchen-jin-founded', year: 1115 },
  { polityId: 'western_xia', eventId: 'western-xia-founded', year: 1038 },
  { polityId: 'former_liang', eventId: 'former-liang-founded', year: 314 },
  { polityId: 'former_zhao', eventId: 'former-zhao-founded', year: 304 },
  { polityId: 'later_zhao', eventId: 'later-zhao-founded', year: 319 },
] as const;

describe('政权建政事件第三批', () => {
  it('为第三批目标建立唯一、带来源且不依赖起止年的建政事件', () => {
    const eventById = new Map(events.map((event) => [event.id, event]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const target of targets) {
      const event = eventById.get(target.eventId);

      expect(event, target.eventId).toBeDefined();
      expect(event?.year, target.eventId).toBe(target.year);
      expect(event?.endYear, target.eventId).toBeUndefined();
      expect(event?.category, target.eventId).toBe('政权建立／更替');
      expect(event?.sourceIds.length, target.eventId).toBeGreaterThan(0);
      expect(event?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.eventId).toBe(true);
      expect(event?.background, target.eventId).toBeTruthy();
      expect(event?.process, target.eventId).toBeTruthy();
      expect(event?.impact, target.eventId).toBeTruthy();
      expect(event?.mapNote, target.eventId).toBeTruthy();
      expect(event?.references?.length, target.eventId).toBeGreaterThan(0);
    }

    expect(new Set(targets.map((target) => target.eventId)).size).toBe(targets.length);
  });

  it('为每个第三批建政事件提供完整详情并明确关联政权', () => {
    const detailById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const target of targets) {
      const detail = detailById.get(target.eventId);

      expect(detail, target.eventId).toBeDefined();
      expect(detail?.polityIds, target.eventId).toContain(target.polityId);
      expect(detail?.causes.length, target.eventId).toBeGreaterThan(0);
      expect(detail?.phases?.length, target.eventId).toBeGreaterThan(0);
      expect(detail?.consequences.length, target.eventId).toBeGreaterThan(0);
      expect(detail?.locationIds, target.eventId).toBeDefined();
      expect(detail?.sourceIds.length, target.eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim().length, target.eventId).toBeGreaterThan(0);
    }
  });

  it('使第三批目标政权获得建政与已核人物关系覆盖', () => {
    const report = auditPolityCoverage();

    for (const target of targets) {
      expect(report.byPolity(target.polityId), target.polityId).toMatchObject({
        hasEstablishmentNode: true,
      });
      expect(report.byPolity(target.polityId).establishmentEventIds, target.polityId)
        .toContain(target.eventId);
    }

    expect(report.byPolity('wei_eastern').gaps).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-associated-person' }),
    ]));
  });
});
