import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const currentGaps = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'], reason: '事件节点是长安城市辅助研究，未记录霍去病参与者。' },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'], reason: '事件节点是长安城市辅助研究，未记录张骞参与者。' },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'], reason: '事件节点是长安城市辅助研究，未记录班固参与者。' },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'], reason: '事件节点是大明宫营建，未记录李治参与者。' },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'], reason: '北魏建政详情只记录拓跋珪参与者，不能以同一政权继承关系替代。' },
  { personId: 'chai-rong', eventIds: ['zhou-later-founded'], reason: '后周建立详情只记录郭威参与者，不能以柴荣的后续继承关系替代。' },
  { personId: 'yuwen-yong', eventIds: [], reason: '当前目录没有可直接挂接且包含宇文邕参与者字段的事件节点。' },
  { personId: 'qin-mugong', eventIds: [], reason: '秦穆公晚于秦襄公列侯节点，当前仅作为秦国后续发展阶段的上下文人物。' },
  { personId: 'seondeok-silla', eventIds: [], reason: '善德女王属于新罗统一战争前的统治阶段，当前建国事件不记录其参与。' },
  { personId: 'jindeok-silla', eventIds: [], reason: '真德女王属于新罗统一战争前的统治阶段，当前建国事件不记录其参与。' },
  { personId: 'sinmun-silla', eventIds: [], reason: '神文王属于统一新罗后续统治阶段，不能回填为新罗建国事件参与者。' },
] as const;

const eventCatalog = [...events, ...changanEvents];
const peopleIds = new Set(people.map((person) => person.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('ninety-eighth batch event-participation boundary audit', () => {
  it('audits every current gap before adding an event participation edge', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.eventParticipation).toEqual(
      currentGaps.map(({ personId }) => personId),
    );

    for (const { personId, eventIds, reason } of currentGaps) {
      expect(peopleIds.has(personId), `${personId}: person endpoint`).toBe(true);

      const participantClaims = claims.filter((claim) => (
        claim.subjectId === personId && claim.predicate === 'participated-in'
      ));
      expect(participantClaims, `${personId}: participation claim`).toEqual([]);

      for (const eventId of eventIds) {
        const event = eventCatalog.find((candidate) => candidate.id === eventId);
        const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
        const participant = detail?.participants.find((candidate) => candidate.personId === personId);
        const endpointSourceIds = [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])];

        expect(event, `${personId}:${eventId} event endpoint`).toBeDefined();
        expect(Number.isFinite(event?.year), `${personId}:${eventId} event year`).toBe(true);
        if (event?.datePrecision !== undefined) {
          expect(['year', 'approximate', 'range'], `${personId}:${eventId} date precision`)
            .toContain(event.datePrecision);
        }
        expect(endpointSourceIds.length, `${personId}:${eventId} source list`).toBeGreaterThan(0);
        expect(endpointSourceIds.every((sourceId) => sourceIds.has(sourceId)), `${personId}:${eventId} source refs`).toBe(true);
        expect(participant, `${personId}:${eventId} participant field`).toBeUndefined();
      }

      const coverage = report.byPersonId[personId].categories.eventParticipation;
      expect(coverage.status, `${personId}: coverage status`).toBe('missing');
      expect(coverage.evidence.every((item) => item.kind === 'role'), `${personId}: evidence`).toBe(true);
      expect(coverage.relatedIds, `${personId}: related events`).toEqual([]);
      expect(reason.length, `${personId}: audit reason`).toBeGreaterThan(0);
    }
  });

  it('does not infer participation from a person, polity, or later-stage relation', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    expect(claims.some((claim) => claim.predicate === 'participated-in' && currentGaps.some(({ personId }) => claim.subjectId === personId)))
      .toBe(false);
    expect(eventDetails.some((detail) => detail.participants.some((participant) => (
      participant.relationType !== 'contextual'
      && currentGaps.some(({ personId }) => participant.personId === personId)
    )))).toBe(false);
  });
});
