import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'goguryeo-founded': { label: '王统承接与早期中心调整', startYear: -19, endYear: 18 },
  'silla-founded': { label: '金城阶段与辰韩网络整合', startYear: 4, endYear: 100 },
  'tibetan-founded': { label: '高原核心与对外交涉并行', startYear: 629, endYear: 641 },
  'xiongnu-founded': { label: '草原联盟与边疆交涉并行', startYear: -209, endYear: -198 },
  'western-zhou-founded-eighth-batch': { label: '封邦秩序与王畿承接', startYear: -1046, endYear: -1000 },
  'zhou-conquest': { label: '克商后周初承接', startYear: -1046, endYear: -1043 },
} as const;

const targetConsequences = {
  'goguryeo-founded': '高句丽早期王统、中心迁移与区域竞争是连续过程；五女山和国内城的遗址参照不能推出前37年已完成后期范围。',
  'silla-founded': '金城及王权整合只能作为新罗早期国家化参照，不等于前57年已有统一的半岛政权。',
  'tibetan-founded': '雅砻、逻些与唐蕃交涉对应不同阶段；中心承接和对外关系变化不能合并为618年已经完成的高原统一。',
  'xiongnu-founded': '单于庭移动与汉匈交涉说明关系网络变化，不证明前209年已有固定都城或连续边界。',
  'western-zhou-founded-eighth-batch': '王畿、封国和地方治理的证据层次不同，早期册命不能直接换算为连续行政边界。',
  'zhou-conquest': '牧野胜利确定王朝更替节点，但周初政权承接仍依赖后续东征、册命和分封。',
} as const;

const targetParticipantNotes = {
  'goguryeo-founded': { personId: 'daemusin', note: '仅代表建国后的早期王权扩展阶段，不代表前37年建国现场或后期疆域。' },
  'silla-founded': { personId: 'namhae-chachaung', note: '仅代表传统建国后的早期王统承接，不代表前57年建国节点或后续统一新罗。' },
  'tibetan-founded': { personId: 'tridu-songtsen', note: '仅代表形成后的制度成熟阶段，不代表618年前后的建政现场或早期高原整合全部参与者。' },
  'xiongnu-founded': { personId: 'huhanye', note: '仅用于连接匈奴形成后的分裂与重组阶段，不代表前209年联盟形成或固定政治中心。' },
  'western-zhou-founded-eighth-batch': { personId: 'ji-chang', note: '仅代表克商前的周人政治资源整合，不代表前1046年克商战场或周初全部地方控制。' },
  'zhou-conquest': { personId: 'ji-chang', note: '仅代表克商前的周人政治资源整合，不代表前1046年牧野战场统帅。' },
} as const;

describe('event details seventy-sixth batch', () => {
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
