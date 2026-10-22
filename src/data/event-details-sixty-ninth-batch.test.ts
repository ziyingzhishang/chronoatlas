import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'han-warring-founded-eighth-batch': { label: '韩国名义确认与迁都前整合', startYear: -403, endYear: -375 },
  'zhao-warring-founded-eighth-batch': { label: '赵国名义确认与邯郸迁都前整合', startYear: -403, endYear: -386 },
  'wei-warring-founded-eighth-batch': { label: '魏国名义确认与安邑经营', startYear: -403, endYear: -396 },
  'chu-warring-founded-eighth-batch': { label: '战国前期楚国网络承接', startYear: -403, endYear: -350 },
  'yan-warring-founded-eighth-batch': { label: '战国前期燕国北方网络承接', startYear: -403, endYear: -350 },
  'qi-warring-founded-eighth-batch': { label: '战国前期齐国沿海网络承接', startYear: -403, endYear: -350 },
} as const;

const targetConsequences = {
  'han-warring-founded-eighth-batch': '册命确认的是名义诸侯身份；韩氏从晋国卿族到韩国的整合仍需结合迁都与地方控制阶段观察。',
  'zhao-warring-founded-eighth-batch': '赵氏的周王室册命与北方军政资源承接属于连续过程，邯郸迁都不能回填为前403年册命现场。',
  'wei-warring-founded-eighth-batch': '魏由晋国卿族转为诸侯后的制度承认，与魏文侯时期改革、安邑至大梁迁移并非同一节点。',
  'chu-warring-founded-eighth-batch': '楚在前403年前已有独立王统，本条只标记战国分期，不把楚的起源压缩到周王室册命。',
  'yan-warring-founded-eighth-batch': '燕在前403年前已有王统，本条的战国分期不能证明燕山、辽西或后期北方范围已在当年完成整合。',
  'qi-warring-founded-eighth-batch': '齐的姜齐、田齐和战国后期强盛属于不同历史层次，前403年不应替代齐国更早起源或后期控制范围。',
} as const;

describe('event details sixty-ninth batch', () => {
  it('enriches six source-backed Warring States continuity phases without changing precision', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));

    Object.entries(targetPhases).forEach(([eventId, expectedPhase]) => {
      const event = eventsById.get(eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      const item = report.items.find((candidate) => candidate.eventId === eventId);

      expect(event, eventId).toBeDefined();
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(event?.verification, eventId).toBe('partial');
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
      expect(item?.sourceComplete, eventId).toBe(true);
      expect(item?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(3);
      expect(detail?.phases).toEqual(expect.arrayContaining([expect.objectContaining(expectedPhase)]));
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
    });
  });

  it('keeps the six continuity narratives separate from the traditional foundation year', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targetConsequences).forEach(([eventId, consequence]) => {
      expect(byId.get(eventId)?.consequences, eventId).toContain(consequence);
    });
  });
});
