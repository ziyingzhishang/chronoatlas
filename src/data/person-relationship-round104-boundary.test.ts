import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const eventParticipationGaps = [
  { personId: 'fu-jian', eventIds: ['former-qin-founded'], reasonCode: 'missing-participant', reason: '苻坚是357年后前秦君主，不能沿用苻健的建国参与边；需保留为阶段性待核实缺口。' },
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'], reasonCode: 'missing-participant', reason: '城市辅助事件已存在，但没有霍去病参与字段。' },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'], reasonCode: 'missing-participant', reason: '城市辅助事件已存在，但没有张骞参与字段。' },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'], reasonCode: 'missing-participant', reason: '城市辅助事件已存在，但没有班固参与字段，且班固属于东汉后期人物。' },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'], reasonCode: 'missing-participant', reason: '城市营建事件已存在，但没有李治参与字段，且现有来源仅支持城市建设层。' },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'], reasonCode: 'born-after-event', reason: '元宏出生于北魏建政之后，不能回填为建政参与者。' },
  { personId: 'tuoba-tao', eventIds: ['northern-wei-founded'], reasonCode: 'born-after-event', reason: '拓跋焘出生于北魏建政之后，不能以继承统治关系替代参与字段。' },
  { personId: 'yuwen-yong', eventIds: [], reasonCode: 'no-event-candidate', reason: '当前事件目录没有同时具备宇文邕参与字段和来源的事件节点。' },
  { personId: 'qin-mugong', eventIds: [], reasonCode: 'no-direct-role', reason: '秦穆公晚于秦襄公列侯节点，当前仅作为秦国后续发展阶段的上下文人物。' },
  { personId: 'seondeok-silla', eventIds: [], reasonCode: 'no-event-candidate', reason: '善德女王属于新罗中期统治阶段，当前目录没有可直接挂接的新罗建国事件参与字段。' },
  { personId: 'jindeok-silla', eventIds: [], reasonCode: 'no-event-candidate', reason: '真德女王属于新罗中期统治阶段，当前目录没有可直接挂接的新罗建国事件参与字段。' },
  { personId: 'sinmun-silla', eventIds: [], reasonCode: 'no-event-candidate', reason: '神文王属于统一新罗后续统治阶段，不能回填为新罗建国事件参与者。' },
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
      ['fu-jian', 'missing-participant'],
      ['huo-qubing', 'missing-participant'],
      ['zhang-qian', 'missing-participant'],
      ['ban-gu', 'missing-participant'],
      ['li-zhi', 'missing-participant'],
      ['yuan-hong', 'born-after-event'],
      ['tuoba-tao', 'born-after-event'],
      ['yuwen-yong', 'no-event-candidate'],
      ['qin-mugong', 'no-direct-role'],
      ['seondeok-silla', 'no-event-candidate'],
      ['jindeok-silla', 'no-event-candidate'],
      ['sinmun-silla', 'no-event-candidate'],
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
      ['tuoba-tao', 'northern-wei-founded'],
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
    expect(report.requiredMissingByCategory.kinship).toHaveLength(121);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(85);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(12);
  });
});
