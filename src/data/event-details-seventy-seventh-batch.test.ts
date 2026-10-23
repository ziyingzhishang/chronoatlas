import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'cheng-han-founded': { label: '成都核心与李氏继承分界', startYear: 334, endYear: 347 },
  'dali-founded': { label: '段思平之后的段氏承接', startYear: 944, endYear: 960 },
  'former-liang-founded': { label: '张氏继承与河西节点分层', startYear: 320, endYear: 324 },
  'western-liang-state-founded': { label: '迁治酒泉', startYear: 405, endYear: 405 },
  'western-liao-founded': { label: '耶律夷列承接阶段', startYear: 1143, endYear: 1163 },
  'eastern-zhou-founded-eighth-batch': { label: '东周王室终结', startYear: -256, endYear: -256 },
} as const;

const targetConsequences = {
  'cheng-han-founded': '李雄去世后的成汉继承阶段与304—334年的形成、早期统治需要分开，成都核心延续不等于巴蜀各地直接控制始终不变。',
  'dali-founded': '段思平去世后的段氏承接仍需依靠地方联盟，不能把937年前后的建政约年或段思平个人活动延伸为后续大理全域的直接控制。',
  'former-liang-founded': '张氏继承链的延续不等于凉州各军镇和河西交通节点在同一时间接受单一直接管理。',
  'western-liang-state-founded': '李暠的建政与敦煌、酒泉节点治理只能说明西凉早期阶段，不能替代后续河西诸凉关系变化。',
  'western-liao-founded': '耶律大石之后的西辽继承与行政延续属于新的阶段，不能把1124年前后的迁徙建政约年扩展为整个西辽时期的单一形成节点。',
  'eastern-zhou-founded-eighth-batch': '东周王室在前256年终结，说明东迁后的王统延续与后续诸侯秩序并非重新建立统一帝国。',
} as const;

const targetParticipantScopes = {
  'cheng-han-founded': { personId: 'li-xiong', role: '304年形成节点、306年称帝与334年前后的早期统治' },
  'dali-founded': { personId: 'duan-siping', role: '限937年前后的建政与早期洱海整合' },
  'former-liang-founded': { personId: 'zhang-mao', role: '限320—324年前后的继承与延续' },
  'western-liang-state-founded': { personId: 'li-hao', role: '400年被推为凉公并建立西凉、405年迁治酒泉' },
  'western-liao-founded': { personId: 'yelu-dashi', role: '限1124年前后西行建政' },
  'eastern-zhou-founded-eighth-batch': { personId: 'ji-yijiu', role: '限约前770年东迁节点' },
} as const;

describe('event details seventy-seventh batch', () => {
  it('adds source-backed boundary phases while preserving the exact Cheng Han node', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));

    Object.entries(targetPhases).forEach(([eventId, expectedPhase]) => {
      const event = eventsById.get(eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      const item = report.items.find((candidate) => candidate.eventId === eventId);

      expect(event, eventId).toBeDefined();
      if (eventId === 'cheng-han-founded' || eventId === 'western-liang-state-founded') {
        expect(event?.datePrecision, eventId).toBe('year');
        expect(event?.verification, eventId).toBe('checked');
        expect(report.coveredEventIds, eventId).toContain(eventId);
      } else {
        expect(event?.datePrecision, eventId).toBe('approximate');
        expect(event?.verification, eventId).toBe('partial');
        expect(report.needsReviewEventIds, eventId).toContain(eventId);
      }
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

    Object.entries(targetParticipantScopes).forEach(([eventId, expectedParticipant]) => {
      expect(byId.get(eventId)?.participants, eventId).toEqual(expect.arrayContaining([
        expect.objectContaining({
          personId: expectedParticipant.personId,
          role: expect.stringContaining(expectedParticipant.role),
        }),
      ]));
    });
  });
});
