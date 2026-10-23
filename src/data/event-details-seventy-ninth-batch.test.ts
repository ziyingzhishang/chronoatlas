import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'qin-state-founded-eighth-batch': {
    label: '护送东迁后的列侯承接',
    startYear: -770,
    endYear: -770,
  },
  'shang-founded-eighth-batch': {
    label: '盘庚迁殷与晚商观察窗口',
    startYear: -1300,
    endYear: -1047,
  },
  'xia-early-founded-eighth-batch': {
    label: '早期王权叙事与考古证据分层',
    startYear: -2070,
    endYear: -1600,
  },
  'tuyuhun-founded': {
    label: '西迁传统与政权形成分层',
    startYear: 285,
    endYear: 313,
  },
  'southern-ming-founded': {
    label: '明统多中心承接',
    startYear: 1644,
    endYear: 1662,
  },
} as const;

const targetConsequences = {
  'qin-state-founded-eighth-batch': '秦襄公获列侯名义把周王室承认与秦国实际经营分开；不能以这一名义节点替代秦在关中后续的都邑、军政和地方整合。',
  'shang-founded-eighth-batch': '盘庚迁殷和武丁甲骨文材料让晚商王权更可观察，但晚商都邑与王权证据不能前推为约前1600年的建政事实或连续控制范围。',
  'xia-early-founded-eighth-batch': '夏代传统叙事与二里头考古参照应分别表达；二者都不能把约前2070年转换成已核实的单日建国或国家边界。',
  'tuyuhun-founded': '慕容吐谷浑的西迁传统只能说明形成前置背景，不能把其个人经历或后期王都参照扩展成313年前后已确定的单一政权疆域。',
  'southern-ming-founded': '南明各阶段的政治名义、军镇和地方中心分段承接明统，后世总称不应被当作1644年已经成立的单一政权或固定疆域。',
} as const;

const targetParticipantNotes = {
  'qin-state-founded-eighth-batch': {
    personId: 'qin-xiangong',
    note: '秦襄公是约前770年列侯节点的直接人物；该节点不等于秦国已完成关中整合。',
  },
  'shang-founded-eighth-batch': {
    personId: 'wu-ding',
    note: '限晚商甲骨文可观察窗口，不代表约前1600年的商代起点或盘庚迁殷的具体当事者。',
  },
  'xia-early-founded-eighth-batch': {
    personId: 'yu-the-great',
    note: '限传统建政叙事与早期王权记忆，不代表二里头遗址已被确认是禹的唯一都邑或夏代国界。',
  },
  'tuyuhun-founded': {
    personId: 'murong-tuyuhun',
    note: '限西迁与形成传统的连接，不代表后续吐谷浑各阶段的固定都城、全部统治者或疆域。',
  },
  'southern-ming-founded': {
    personId: 'zhu-yousong',
    note: '限弘光南京阶段，不代表后续隆武、绍武、永历政权或南明全期。',
  },
} as const;

describe('event details seventy-ninth batch', () => {
  it('adds source-backed stages without upgrading approximate dating', () => {
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

  it('keeps impacts and participant scopes bounded by existing evidence', () => {
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
