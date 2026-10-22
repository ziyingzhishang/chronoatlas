import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'former-liang-founded': {
    label: '前凉约年与张氏继承分层',
    startYear: 314,
    endYear: 320,
  },
  'goguryeo-founded': {
    label: '传统纪年与早期王权观察窗口',
    startYear: -37,
    endYear: 18,
  },
  'silla-founded': {
    label: '传统起点与三国竞争前置分层',
    startYear: -57,
    endYear: 356,
  },
  'tibetan-founded': {
    label: '吐蕃早期整合与对外关系分层',
    startYear: 618,
    endYear: 641,
  },
  'western-zhou-founded-eighth-batch': {
    label: '克商约年与封邦秩序分层',
    startYear: -1046,
    endYear: -1000,
  },
  'xia-early-founded-eighth-batch': {
    label: '传统夏代起点与考古观察分层',
    startYear: -2070,
    endYear: -1600,
  },
} as const;

const targetImpacts = {
  'former-liang-founded': '前凉的晋臣名义、张氏实控与河西节点承接分阶段展开，不能把314年约年写成统一直接管辖。',
  'goguryeo-founded': '高句丽传统建国纪年、早期王统与后续区域竞争属于不同证据层次，不能由后续中心或范围反推前37年边界。',
  'silla-founded': '新罗从传统起点到三国竞争中的王权整合持续展开，前57年不能被解释为已经完成辰韩地区的统一直接控制。',
  'tibetan-founded': '吐蕃早期高原整合与唐蕃交涉分属连续阶段，618年约年不能代表后续高原范围已经稳定形成。',
  'western-zhou-founded-eighth-batch': '克商、册命与封国秩序在不同阶段展开，约前1046年不能直接等同于西周王室已完成对东国的连续控制。',
  'xia-early-founded-eighth-batch': '夏代传统纪年、早期王权叙事与考古文化只能并列观察，约前2070年不能推出已核实的单日建国或国家边界。',
} as const;

const targetParticipantScopes = {
  'former-liang-founded': { personId: 'zhang-shi', note: '限314年后的张氏继承与河西政权延续，不代表前凉约年起点或全部凉州军镇。' },
  'goguryeo-founded': { personId: 'yuri-goguryeo', role: '限前37年后的王统承接与早期中心调整，不代表传统建国现场或后期疆域' },
  'silla-founded': { personId: 'naemul-isageum', role: '限356—382年三国竞争中的王权整合，不代表前57年传统起点或统一新罗全期' },
  'tibetan-founded': { personId: 'tridu-songtsen', note: '限形成后的制度成熟阶段，不代表618年前后的建政现场或早期高原整合全部参与者。' },
  'western-zhou-founded-eighth-batch': { personId: 'zhou-gong-dan', role: '限克商后的东征、册命与秩序建设，不代表前1046年牧野战场或西周全部地方控制' },
  'xia-early-founded-eighth-batch': { personId: 'yu-the-great', role: '本轮保留约前2070年传统纪年的不确定性' },
} as const;

describe('event details eighty-first batch', () => {
  it('adds source-backed stages without upgrading approximate dating', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));

    Object.entries(targetPhases).forEach(([eventId, expectedPhase]) => {
      const event = eventsById.get(eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      const item = report.items.find((candidate) => candidate.eventId === eventId);

      expect(event, eventId).toBeDefined();
      expect(event?.datePrecision, eventId).toBe('approximate');
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

  it('keeps audited impacts and participant scopes bounded by existing evidence', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targetImpacts).forEach(([eventId, impact]) => {
      expect(byId.get(eventId)?.consequences, eventId).toContain(impact);
    });

    Object.entries(targetParticipantScopes).forEach(([eventId, expectedParticipant]) => {
      const participant = byId.get(eventId)?.participants.find((candidate) => (
        candidate.personId === expectedParticipant.personId
      ));

      expect(participant, eventId).toBeDefined();
      if ('note' in expectedParticipant) {
        expect(participant?.note, eventId).toContain(expectedParticipant.note);
      } else {
        expect(participant?.role, eventId).toContain(expectedParticipant.role);
      }
    });
  });
});
