import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'chu-han-contention': { label: '项羽败亡后的诸侯承接', startYear: -202, endYear: -202 },
  'eastern-jin': { label: '两次即位与南方承接分层', startYear: 317, endYear: 318 },
  'an-lushan-rebellion': { label: '叛军首领更替', startYear: 757, endYear: 763 },
  'goguryeo-founded': { label: '传统建国与王统承接分层', startYear: -37, endYear: 18 },
  'silla-founded': { label: '传统建国与早期王统承接分层', startYear: -57, endYear: 24 },
  'zhou-conquest': { label: '克商与册命秩序分层', startYear: -1046, endYear: -1000 },
} as const;

const targetConsequences = {
  'chu-han-contention': '项羽败亡后的汉方主导仍需通过诸侯分封承接，不能把前202年胜利直接写成西汉已完成统一。',
  'eastern-jin': '317—318年的晋室重建保留的是江南政治承接，不能由建康即位节点推出北方旧晋空间已经恢复统一。',
  'an-lushan-rebellion': '安禄山死后叛军领导转移，主要叛乱结束与唐廷重新取得各地直接控制不是同一结果。',
  'goguryeo-founded': '前37年传统建国节点与朱蒙之后的王统承接属于不同历史层次，不能用后续国内城体系回填建国当年范围。',
  'silla-founded': '前57年传统起点与南解时期的王统承接属于连续但分层的过程，不能据此推出当年已完成统一新罗式国家。',
  'zhou-conquest': '克商完成王朝更替，但册命、封国与地方治理的展开仍在后续阶段，不能把约前1046年写成周王室已完成连续直接控制。',
} as const;

const targetParticipantScopes = {
  'chu-han-contention': { personId: 'han-xin', note: '限楚汉战争中后期军事行动，不代表汉初全部将领或地方军政承接。' },
  'eastern-jin': { personId: 'sima-rui', note: '限317—318年晋室重建，不代表北方旧晋地区或东晋后续北伐。' },
  'an-lushan-rebellion': { personId: 'an-lushan', note: '限755年范阳起兵及前期叛军主线，不代表其死后史思明、史朝义等后续阶段。' },
  'goguryeo-founded': { personId: 'jumong', note: '限前37年传统建国叙事，不代表后续国内城体系或后期疆域。' },
  'silla-founded': { personId: 'park-hyeokgeose', note: '限前57年传统起始节点，不代表后续王统、辰韩整合或统一新罗。' },
  'zhou-conquest': { personId: 'zhou-wu', note: '限约前1046年牧野克商与建政节点，不代表后续东征、册命和全部地方承接。' },
} as const;

describe('event details seventy-eighth batch', () => {
  it('adds source-backed stages without upgrading approximate or range dating', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));

    Object.entries(targetPhases).forEach(([eventId, expectedPhase]) => {
      const event = eventsById.get(eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      const item = report.items.find((candidate) => candidate.eventId === eventId);

      expect(event, eventId).toBeDefined();
      expect(event?.datePrecision, eventId).toMatch(/^(approximate|range)$/);
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

    Object.entries(targetParticipantScopes).forEach(([eventId, expectedParticipant]) => {
      expect(byId.get(eventId)?.participants, eventId).toEqual(expect.arrayContaining([
        expect.objectContaining({
          personId: expectedParticipant.personId,
          note: expect.stringContaining(expectedParticipant.note),
        }),
      ]));
    });
  });
});
