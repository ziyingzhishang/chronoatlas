import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'cheng-han-founded': { label: '成汉与东晋并立', startYear: 317, endYear: 347 },
  'goguryeo-founded': { label: '五女山—国内城中心承接', startYear: -37, endYear: 100 },
  'tibetan-founded': { label: '雅砻核心与逻些承接', startYear: 618, endYear: 650 },
  'silla-founded': { label: '三国竞争中的王权整合', startYear: 356, endYear: 382 },
  'western-zhou-founded-eighth-batch': { label: '王室册命与封国承接', startYear: -1046, endYear: -1000 },
  'zhou-conquest': { label: '牧野之后的东国秩序重组', startYear: -1046, endYear: -1000 },
} as const;

const targetConsequences = {
  'cheng-han-founded': '成汉形成后，巴蜀成为西晋瓦解后相对独立的区域政治中心；成都中心的稳定与对巴蜀各地的直接控制不能视为同一层次。',
  'goguryeo-founded': '朱蒙建国传统与后续国内城中心形成属于不同历史层次；迁都线索只能说明王权中心承接，不能推出前37年已经完成后期疆域整合。',
  'tibetan-founded': '雅砻与逻些分别对应吐蕃形成期不同阶段的政治中心参照；中心承接不等于618年已经完成高原全域统一。',
  'silla-founded': '四世纪后期王权整合与对外关系变化只能作为新罗国家化的后续阶段，不能回填为前57年已经完成的统一国家。',
  'western-zhou-founded-eighth-batch': '王室册命、封国承接与后续地方治理属于连续过程；器物铭文可说明秩序形态，但不能直接推出西周早期连续行政边界。',
  'zhou-conquest': '牧野克商与周初东国秩序重组之间存在时间差；后续东征、分封和册命不能压缩为前1046年当天完成。',
} as const;

const targetParticipantNotes = {
  'cheng-han-founded': { personId: 'li-xiong', note: '李雄在成都一带建立成汉；304年政权形成与306年称帝是连续但可区分的节点，成都中心不等于当年已整合巴蜀全域。' },
  'goguryeo-founded': { personId: 'yuri-goguryeo', note: '琉璃明王属于建国后的王统承接和迁都阶段，不把其活动前推为前37年建国；迁都线索不等于前37年已完成后期疆域整合。' },
  'tibetan-founded': { personId: 'songtsen-gampo', note: '松赞干布对应618—629年形成阶段；吐蕃国家化是多阶段过程，雅砻核心整合与后续逻些政治中心承接不能合并为单一建政时点。' },
  'silla-founded': { personId: 'naemul-isageum', note: '内物王活动距前57年已有数百年，本条用于连接王权整合，不把其统治追溯为建国节点；其356—382年前后活动用于观察三国竞争中的后续整合，不追溯为前57年建国事实。' },
  'western-zhou-founded-eighth-batch': { personId: 'zhou-gong-dan', note: '周公旦主要参与建政后的制度建设，不能被简化为克商战场指挥者；封邦秩序是后续过程。' },
  'zhou-conquest': { personId: 'zhou-gong-dan', note: '周公旦属于克商后的东征、分封与王室秩序建设阶段，不把其写成前1046年牧野战场的统帅；封邦秩序是后续过程。' },
} as const;

describe('event details seventy-second batch', () => {
  it('adds source-backed continuity phases without upgrading approximate dating', () => {
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

  it('keeps the six additions bounded by existing narratives and uncertainty', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targetConsequences).forEach(([eventId, consequence]) => {
      expect(byId.get(eventId)?.consequences, eventId).toContain(consequence);
    });

    Object.entries(targetParticipantNotes).forEach(([eventId, expectedParticipant]) => {
      expect(byId.get(eventId)?.participants, eventId).toEqual(expect.arrayContaining([
        expect.objectContaining(expectedParticipant),
      ]));
    });
  });
});
