import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'zhou-conquest': { label: '商周更替后的王室承接', startYear: -1046, endYear: -1000 },
  'eastern-zhou-founded-eighth-batch': { label: '东迁后的春秋战国入口', startYear: -770, endYear: -403 },
  'silla-founded': { label: '六部联盟与城邑国家', startYear: -57, endYear: -57 },
} as const;

const targetConsequences = {
  'xia-early-founded-eighth-batch': '二里头遗址是夏商周断代工程与中华文明探源工程的关键遗址，可用于观察早期都邑与王权形成；考古遗址仍不等于夏代唯一都城或确定国界。',
  'shang-founded-eighth-batch': '迁都殷后商代王权与都邑体系进入繁荣阶段；这一晚商窗口不能回填为约前1600年的建政现场。',
  'western-zhou-founded-eighth-batch': '“宜侯夨”铭文所见土地、城邑、人口等赏赐，说明早期封邦秩序通过具体册封与资源分配展开；铭文仍不等于连续行政边界。',
  'silla-founded': '新罗早期先在庆州平原的六部联盟基础上形成城邑国家，再逐步整合辰韩同伴国家；这一路径不能压缩为前57年已经完成的统一国家。',
} as const;

describe('event details seventieth batch', () => {
  it('enriches six source-backed early-state narratives without changing precision', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));

    [...Object.keys(targetConsequences), ...Object.keys(targetPhases)].filter((eventId, index, ids) => ids.indexOf(eventId) === index).forEach((eventId) => {
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
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
    });
  });

  it('keeps the six additions tied to existing evidence and approximate dating', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targetConsequences).forEach(([eventId, consequence]) => {
      expect(byId.get(eventId)?.consequences, eventId).toContain(consequence);
    });
    Object.entries(targetPhases).forEach(([eventId, expectedPhase]) => {
      expect(byId.get(eventId)?.phases, eventId).toEqual(expect.arrayContaining([expect.objectContaining(expectedPhase)]));
    });
  });
});
