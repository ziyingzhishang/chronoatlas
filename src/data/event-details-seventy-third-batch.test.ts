import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'former-liang-founded': { label: '晋臣名义与张氏实控并存', startYear: 314, endYear: 320 },
  'tuyuhun-founded': { label: '部众、牧地与交通网络承接', startYear: 313, endYear: 350 },
  'xiongnu-founded': { label: '联盟与单于庭的移动承接', startYear: -209, endYear: -198 },
  'dali-founded': { label: '段氏王权与洱海联盟承接', startYear: 937, endYear: 950 },
  'southern-ming-founded': { label: '弘光至隆武的政治承接', startYear: 1645, endYear: 1646 },
} as const;

const targetConsequences = {
  'former-liang-founded': '前凉在河西保留西晋制度与交通网络的部分承接，同时依靠张氏军政集团维持地方实控；晋臣名义、地方割据与后期独立称号不能合并为同一建政节点。',
  'tuyuhun-founded': '吐谷浑的区域统治依托部众、牧地与交通网络；河湟核心承接不等于对青海全部地区有固定直接控制。',
  'xiongnu-founded': '匈奴联盟的形成依赖部众和单于庭的流动性；“联盟”“臣属”“直接控制”不是同一关系，不能用后期影响范围反推前209年。',
  'dali-founded': '大理早期以洱海核心和地方联盟承接南诏遗产；羊苴咩城政治中心与后期大理范围不是同一层次。',
  'southern-ming-founded': '南明的合法性与军事资源由不同政权、军镇和地方中心分段承接；共同延续明统不等于存在单一南明中央或连续疆域。',
} as const;

const targetParticipantNotes = {
  'former-liang-founded': { personId: 'zhang-gui', note: '本条仅把他列为前置军政基础人物，不作为314年前凉独立建政者。' },
  'tuyuhun-founded': { personId: 'murong-tuyuhun', note: '本条只用于连接西迁与形成传统，不代表313年后每一阶段的全部统治者或固定都城。' },
  'xiongnu-founded': { personId: 'modu-chanyu', note: '冒顿对应前209年前后形成节点；“形成”表示部众与权力中心重组，不表示固定首都；不把前209年形成简化为其个人完成全部部众统一。' },
  'dali-founded': { personId: 'duan-siping', note: '段思平代表南诏秩序瓦解后重组地方政治的核心人物；937年前后是形成约年，早期联盟与直接控制范围仍需分阶段理解；不代表南诏后各地势力或后续大理历代君主。' },
  'southern-ming-founded': { personId: 'zhu-yousong', note: '朱由崧代表1644—1645年弘光政权，是南明多阶段体系中的首个重要君主之一，不等同于全部南明政权；仅对应弘光阶段，不代表隆武、绍武、永历等后续政权。' },
} as const;

describe('event details seventy-third batch', () => {
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
