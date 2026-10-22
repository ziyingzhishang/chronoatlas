import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'chu-warring-founded-eighth-batch': {
    label: '战国分期与楚国既有王统并行',
    startYear: -403,
    endYear: -350,
  },
  'han-warring-founded-eighth-batch': {
    label: '册命名义与韩国整合并行',
    startYear: -403,
    endYear: -375,
  },
  'qi-warring-founded-eighth-batch': {
    label: '战国分期与齐国既有层次并行',
    startYear: -403,
    endYear: -350,
  },
  'wei-warring-founded-eighth-batch': {
    label: '册命名义与魏国经营并行',
    startYear: -403,
    endYear: -396,
  },
  'yan-warring-founded-eighth-batch': {
    label: '战国分期与燕国北方网络并行',
    startYear: -403,
    endYear: -350,
  },
  'zhao-warring-founded-eighth-batch': {
    label: '册命名义与赵国北方承接并行',
    startYear: -403,
    endYear: -386,
  },
} as const;

const targetConsequences = {
  'chu-warring-founded-eighth-batch': '前403年只标记战国编年入口；楚的早期王统、江汉江淮网络与后续强国化仍需分阶段观察，不能由该约年推出楚国绝对起点或完整边界。',
  'han-warring-founded-eighth-batch': '前403年册命确认韩的诸侯名义，但韩国由晋国卿族资源转为稳定国家仍经历迁都与地方整合；新郑及后续控制范围不能回填到册命节点。',
  'qi-warring-founded-eighth-batch': '前403年是战国分期入口而非齐国起源；姜齐、田齐、临淄及后续东方强国化属于不同历史层次，不能用后期齐国范围反推该约年。',
  'wei-warring-founded-eighth-batch': '前403年册命确认魏的诸侯名义，但安邑经营、改革和后续大梁迁都分属不同阶段；制度承认不等于当年已完成稳定国家边界。',
  'yan-warring-founded-eighth-batch': '前403年只标记战国分期入口；燕的既有王统、蓟及燕山—辽西网络仍在后续整合，不能把后期北方范围前推为当年直接控制。',
  'zhao-warring-founded-eighth-batch': '前403年册命确认赵的诸侯名义，但赵氏北方军政资源、邯郸迁都和边疆整合跨越后续阶段；邯郸与后期范围不能回填到册命节点。',
} as const;

const targetParticipantNotes = {
  'chu-warring-founded-eighth-batch': { personId: 'chu-we-wang', note: '楚威王仅代表前403年之后的战国中期强国阶段，不代表楚早期王统、战国分期入口或楚国全部参与者。' },
  'han-warring-founded-eighth-batch': { personId: 'han-qian', note: '韩虔对应前403年册命的君主端点，不代表韩国由晋卿族到稳定国家的全部整合阶段或后续新郑政治中心。' },
  'qi-warring-founded-eighth-batch': { personId: 'qi-we-wang', note: '齐威王仅代表战国中期齐国强盛阶段，不代表前403年分期入口、姜齐／田齐全部历史层次或齐国后期范围。' },
  'wei-warring-founded-eighth-batch': { personId: 'wei-wenhou', note: '魏斯对应册命前后魏氏政治资源承接的君主端点，不代表魏国改革、安邑至大梁迁移或全部地方控制。' },
  'yan-warring-founded-eighth-batch': { personId: 'yan-zhaowang', note: '燕昭王仅代表战国中期燕国重建与北方网络整合的后续阶段，不代表前403年分期入口或燕国全部早期王统。' },
  'zhao-warring-founded-eighth-batch': { personId: 'zhao-liehou', note: '赵籍对应前403年册命的君主端点，不代表赵氏北方资源承接、邯郸迁都或后续边疆整合的全部参与者。' },
} as const;

describe('event details seventy-fifth batch', () => {
  it('adds source-backed warring-states phases without upgrading approximate dating', () => {
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

  it('keeps impact statements and participant scopes bounded by existing evidence', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targetConsequences).forEach(([eventId, consequence]) => {
      expect(byId.get(eventId)?.consequences, eventId).toContain(consequence);
    });

    Object.entries(targetParticipantNotes).forEach(([eventId, expectedParticipant]) => {
      expect(byId.get(eventId)?.participants, eventId).toEqual(expect.arrayContaining([
        expect.objectContaining({
          personId: expectedParticipant.personId,
          note: expect.stringContaining(expectedParticipant.note),
        }),
      ]));
    });
  });
});
