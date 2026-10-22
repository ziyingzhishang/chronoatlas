import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'cheng-han-founded': {
    label: '成汉草创期与后续断面分离',
    startYear: 304,
    endYear: 305,
  },
  'xiongnu-founded': {
    label: '冒顿重组与早期断面分离',
    startYear: -209,
    endYear: -208,
  },
  'goguryeo-founded': {
    label: '传统建国与次年断面分离',
    startYear: -37,
    endYear: -36,
  },
  'tibetan-founded': {
    label: '早期整合与唐建国分离',
    startYear: 618,
    endYear: 622,
  },
  'western-liao-founded': {
    label: '迁徙建政与次年断面分离',
    startYear: 1124,
    endYear: 1125,
  },
  'eastern-zhou-founded-eighth-batch': {
    label: '王室终结年与前一年断面分离',
    startYear: -256,
    endYear: -256,
  },
} as const;

const targetConsequences = {
  'cheng-han-founded': '304—305年成汉处于草创期，306年后的控制断面不能直接回填为政权形成当年的范围。',
  'xiongnu-founded': '前209年前后的冒顿权力重组不能由前208年断面反推为联盟形成当年的完整范围。',
  'goguryeo-founded': '前37年传统建国纪年与次年可见断面应分开；次年材料不足以证明建国当年疆域。',
  'tibetan-founded': '前618—622年吐蕃处于早期整合阶段；同期唐建国事件不构成吐蕃边界证据。',
  'western-liao-founded': '1124—1125年西辽处于建立与向中亚迁移扩张阶段，1126年断面不能回填建政初期控制范围。',
  'eastern-zhou-founded-eighth-batch': '前256年东周王室终结，王畿终结年的范围不能由前257年前记录直接平移。',
} as const;

const targetParticipantScopes = {
  'cheng-han-founded': { personId: 'li-xiong', role: '本轮聚焦304—305年草创期，不以306年后的控制断面回推形成当年范围' },
  'xiongnu-founded': { personId: 'modu-chanyu', role: '本轮限前209年前后权力重组，不以前208年后的断面回推联盟形成当年范围' },
  'goguryeo-founded': { personId: 'jumong', role: '本轮限前37年传统建国节点，不以次年断面回推建国当年疆域' },
  'tibetan-founded': { personId: 'songtsen-gampo', role: '本轮限618—622年吐蕃早期整合，不把同期唐建国或后续盛期范围当作建政当年参与边界' },
  'western-liao-founded': { personId: 'yelu-dashi', role: '本轮聚焦1124—1125年早期迁移，不以1126年后的断面回推建政初期控制范围' },
  'eastern-zhou-founded-eighth-batch': { personId: 'ji-yijiu', role: '本轮不代表前256年终结年的王畿范围或诸侯直接控制' },
} as const;

describe('event details eightieth batch', () => {
  it('adds audited boundary stages without upgrading approximate dating', () => {
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
