import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'tuyuhun-founded': { label: '河湟政权与北方秩序承接', startYear: 316, endYear: 350 },
  'western-liao-founded': { label: '西行后的中亚立足', startYear: 1124, endYear: 1131 },
  'dali-founded': { label: '南诏之后地方秩序承接', startYear: 902, endYear: 937 },
  'southern-ming-founded': { label: '弘光覆亡与多中心转移', startYear: 1645, endYear: 1646 },
  'xiongnu-founded': { label: '汉匈首次边疆交涉', startYear: -200, endYear: -198 },
  'eastern-zhou-founded-eighth-batch': { label: '王室名义与诸侯分立', startYear: -403, endYear: -256 },
} as const;

describe('event details sixty-eighth batch', () => {
  it('enriches six untouched needs-review events with source-backed continuity phases', () => {
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
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases).toEqual(expect.arrayContaining([expect.objectContaining(expectedPhase)]));
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
    });
  });

  it('keeps the new continuity notes bounded by existing entities and uncertainty', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    expect(byId.get('tuyuhun-founded')?.consequences).toContain(
      '吐谷浑在西晋末年及十六国秩序重组中承接河湟、青海的区域网络，但这不等于313年已经形成固定疆界。',
    );
    expect(byId.get('western-liao-founded')?.causes).toContain(
      '耶律大石的西行把辽亡后的契丹政治资源带入新的中亚交通与绿洲网络。',
    );
    expect(byId.get('dali-founded')?.consequences).toContain(
      '南诏之后的洱海地方网络由段氏王权继续承接，后续大理范围不能回填为937年的直接控制。',
    );
    expect(byId.get('southern-ming-founded')?.consequences).toContain(
      '弘光南京朝廷与扬州前线承担不同功能，南明后续政权的转移不能还原为单一首都连续线。',
    );
    expect(byId.get('xiongnu-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '汉匈首次边疆交涉', startYear: -200, endYear: -198 }),
    ]));
    expect(byId.get('eastern-zhou-founded-eighth-batch')?.consequences).toContain(
      '三家分晋后，周王室保留名义与礼制位置，但诸侯分立使王室实际支配范围继续收缩。',
    );
  });
});
