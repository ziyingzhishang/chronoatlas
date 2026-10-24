import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const eventParticipationGaps = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'], reasonCode: 'missing-participant', reason: '城市辅助事件已存在，但没有霍去病参与字段。' },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'], reasonCode: 'missing-participant', reason: '城市辅助事件已存在，但没有张骞参与字段。' },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'], reasonCode: 'missing-participant', reason: '城市辅助事件已存在，但没有班固参与字段，且班固属于东汉后期人物。' },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'], reasonCode: 'born-after-event', reason: '元宏出生于北魏建政之后，不能回填为建政参与者。' },
  { personId: 'chai-rong', eventIds: ['zhou-later-founded'], reasonCode: 'missing-participant', reason: '后周建立详情只记录郭威参与者，不能以柴荣的后续继承关系替代。' },
  { personId: 'ma-xiguang', eventIds: [], reasonCode: 'no-event-candidate', reason: '马希广属于马楚末期争位阶段，现有终结事件不把其作为长沙终局的直接参与者。' },
  { personId: 'ma-xie', eventIds: [], reasonCode: 'no-event-candidate', reason: '马希萼属于马楚末期衡山阶段，不能将其后续处置直接等同于长沙终结参与。' },
  { personId: 'qin-mugong', eventIds: [], reasonCode: 'no-direct-role', reason: '秦穆公晚于秦襄公列侯节点，当前仅作为秦国后续发展阶段的上下文人物。' },
  { personId: 'gao-baorong', eventIds: [], reasonCode: 'no-direct-role', reason: '高保融属于荆南建政后的继承阶段，现有事件未记录其直接参与字段。' },
  { personId: 'gao-baoxu', eventIds: [], reasonCode: 'no-direct-role', reason: '高保勖属于荆南建政后的继承阶段，现有事件未记录其直接参与字段。' },
  { personId: 'liu-sheng', eventIds: [], reasonCode: 'no-event-candidate', reason: '刘晟属于南汉建政后的继承阶段，现有事件没有其直接参与字段。' },
  { personId: 'seondeok-silla', eventIds: [], reasonCode: 'no-event-candidate', reason: '善德女王属于新罗中期统治阶段，当前目录没有可直接挂接的新罗建国事件参与字段。' },
  { personId: 'jindeok-silla', eventIds: [], reasonCode: 'no-event-candidate', reason: '真德女王属于新罗中期统治阶段，当前目录没有可直接挂接的新罗建国事件参与字段。' },
  { personId: 'sinmun-silla', eventIds: [], reasonCode: 'no-event-candidate', reason: '神文王属于统一新罗后续统治阶段，不能回填为新罗建国事件参与者。' },
  { personId: 'wang-yenxi', eventIds: [], reasonCode: 'no-event-candidate', reason: '王延羲属于闽末继承阶段，当前终结事件仅记录王延政与李璟，不能回填为945年终局参与者。' },
  { personId: 'yeon-gaesomun', eventIds: [], reasonCode: 'no-event-candidate', reason: '渊盖苏文属于高句丽终止前的权臣阶段，现有668年终止事件未记录其直接参与。' },
  { personId: 'yeon-namsaeng', eventIds: [], reasonCode: 'no-event-candidate', reason: '渊男生属于高句丽末期内部分裂阶段，不能回填为668年终止事件参与者。' },
] as const;

const eventCatalog = [...events, ...changanEvents];
const peopleById = new Map(people.map((person) => [person.id, person]));
const sourceIds = new Set(sourceNotes.map((source) => source.id));
const directKinship = new Set(['parent-of', 'child-of', 'grandparent-of', 'grandchild-of', 'sibling-of', 'spouse-of']);
const directAlliance = new Set(['ally-of', 'enemy-of']);

function pairClaimExists(left: string, right: string, predicates: Set<string>): boolean {
  return claims.some((claim) => predicates.has(claim.predicate)
    && ((claim.subjectId === left && claim.objectId === right)
      || (claim.subjectId === right && claim.objectId === left)));
}

describe('round one hundred four person relationship boundary audit', () => {
  it('keeps every event-participation gap closed only when endpoint, participant field, and source all exist', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.eventParticipation).toEqual(
      eventParticipationGaps.map(({ personId }) => personId),
    );

    for (const { personId, eventIds, reasonCode, reason } of eventParticipationGaps) {
      const person = peopleById.get(personId);
      expect(person, `${personId}: person endpoint`).toBeDefined();
      expect(person?.sourceIds.length, `${personId}: person source list`).toBeGreaterThan(0);
      expect(person?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${personId}: person source refs`).toBe(true);
      expect(reason.length, `${personId}: audit rationale`).toBeGreaterThan(0);
      expect(claims.some((claim) => claim.subjectId === personId && claim.predicate === 'participated-in'), `${personId}: no participation claim`).toBe(false);

      for (const eventId of eventIds) {
        const event = eventCatalog.find((candidate) => candidate.id === eventId);
        const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
        const endpointSourceIds = [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])];

        expect(event, `${personId}:${eventId} event endpoint`).toBeDefined();
        expect(Number.isFinite(event?.year), `${personId}:${eventId} event year`).toBe(true);
        expect(endpointSourceIds.length, `${personId}:${eventId} source list`).toBeGreaterThan(0);
        expect(endpointSourceIds.every((sourceId) => sourceIds.has(sourceId)), `${personId}:${eventId} source refs`).toBe(true);
        expect(detail?.participants.some((participant) => participant.personId === personId) ?? false, `${personId}:${eventId} participant field`).toBe(false);

        if (reasonCode === 'born-after-event') {
          expect(person?.birthYear, `${personId}:${eventId} birth year`).toBeGreaterThan(event!.year);
          expect(detail, `${personId}:${eventId} detail endpoint`).toBeDefined();
          expect(detail!.sourceIds.some((sourceId) => event!.sourceIds.includes(sourceId)), `${personId}:${eventId} source intersection`).toBe(true);
        }
      }

      const coverage = report.byPersonId[personId].categories.eventParticipation;
      expect(coverage.status, `${personId}: coverage status`).toBe('missing');
      expect(coverage.evidence.every((item) => item.kind === 'role'), `${personId}: evidence`).toBe(true);
      expect(coverage.relatedIds, `${personId}: related events`).toEqual([]);
    }
  });

  it('classifies every unresolved gap by a concrete evidence boundary', () => {
    expect(eventParticipationGaps.map(({ personId, reasonCode }) => [personId, reasonCode])).toEqual([
      ['huo-qubing', 'missing-participant'],
      ['zhang-qian', 'missing-participant'],
      ['ban-gu', 'missing-participant'],
      ['yuan-hong', 'born-after-event'],
      ['chai-rong', 'missing-participant'],
      ['ma-xiguang', 'no-event-candidate'],
      ['ma-xie', 'no-event-candidate'],
      ['qin-mugong', 'no-direct-role'],
      ['gao-baorong', 'no-direct-role'],
      ['gao-baoxu', 'no-direct-role'],
      ['liu-sheng', 'no-event-candidate'],
      ['seondeok-silla', 'no-event-candidate'],
      ['jindeok-silla', 'no-event-candidate'],
      ['sinmun-silla', 'no-event-candidate'],
      ['wang-yenxi', 'no-event-candidate'],
      ['yeon-gaesomun', 'no-event-candidate'],
      ['yeon-namsaeng', 'no-event-candidate'],
    ]);

    for (const { personId, eventIds, reasonCode } of eventParticipationGaps) {
      if (reasonCode === 'no-event-candidate') {
        expect(eventIds, `${personId}: candidate events`).toEqual([]);
      }
      if (reasonCode === 'missing-participant') {
        expect(eventIds.length, `${personId}: candidate event count`).toBeGreaterThan(0);
        expect(eventIds.every((eventId) => eventDetails.some((detail) => detail.eventId === eventId)), `${personId}: detail exists`).toBe(true);
      }
      if (reasonCode === 'born-after-event') {
        expect(eventIds.length, `${personId}: candidate event count`).toBeGreaterThan(0);
        expect(eventIds.every((eventId) => eventDetails.some((detail) => detail.eventId === eventId)), `${personId}: temporal detail classification`).toBe(true);
      }
    }
  });

  it('rejects temporal backfilling from a later ruler into a founding event', () => {
    for (const [personId, eventId] of [
      ['yuan-hong', 'northern-wei-founded'],
      ['mongke', 'mongol-founded'],
    ] as const) {
      const person = peopleById.get(personId)!;
      const event = eventCatalog.find((candidate) => candidate.id === eventId)!;
      expect(person.birthYear, `${personId}: birth year`).toBeGreaterThan(event.year);
      expect(eventDetails.find((detail) => detail.eventId === eventId)?.participants.some((participant) => participant.personId === personId)).toBe(false);
    }
  });

  it('does not turn shared polity or cross-generation context into direct kinship or alliance edges', () => {
    const report = buildPersonRelationshipCoverageReport();
    const boundaryPairs = [
      ['yuan-hong', 'tuoba-tao', 'kinship'],
      ['wei-huanzi', 'wei-wenhou', 'kinship'],
      ['li-gang', 'zong-ze', 'allianceConflict'],
      ['liu-yan', 'liu-yin', 'allianceConflict'],
      ['zhao-wuling', 'qin-shi-huang', 'kinship'],
    ] as const;

    for (const [left, right, category] of boundaryPairs) {
      expect(pairClaimExists(left, right, category === 'kinship' ? directKinship : directAlliance), `${left}-${right}: direct edge`).toBe(false);
    }

    expect(report.byPersonId['yuan-hong'].categories.kinship.status).not.toBe('covered');
    expect(report.byPersonId['li-gang'].categories.allianceConflict.status).not.toBe('covered');
    expect(report.byPersonId['zong-ze'].categories.allianceConflict.status).not.toBe('covered');
  });

  it('retains the full unresolved relationship baseline after the audit', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.kinship).toHaveLength(164);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(103);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(17);
  });
});
