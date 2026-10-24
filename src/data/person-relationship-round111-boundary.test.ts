import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const requiredGovernanceGaps = [
  'liu-zhuang', 'fu-jian-founder', 'zhang-qian', 'ban-gu', 'du-fu', 'yelu-deguang', 'shengzong-liao', 'xingzong-liao', 'shi-zhi', 'huan-wen', 'ma-xiguang', 'ma-xie', 'yu-the-great', 'ogedei', 'jamukha', 'chiang-kai-shek', 'deng-ai', 'zhong-hui', 'han-kangzi',
  'zhao-xiangzi', 'wei-huanzi', 'seondeok-silla', 'jindeok-silla', 'kim-yushin', 'istemi', 'zhang-gui', 'wang-sengbian', 'li-gang',
  'zong-ze', 'helian-ding', 'zheng-maisi', 'octavian', 'mark-antony', 'constantine-xi', 'mehmed-ii',
  'guacanagari', 'oxenstierna', 'trauttmansdorff', 'chigi', 'franklin-roosevelt', 'wang-yenxi',
] as const;

const eventParticipationGaps = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'] },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'] },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'] },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'] },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'] },
  { personId: 'chai-rong', eventIds: ['zhou-later-founded'] },
  { personId: 'ma-xiguang', eventIds: [] },
  { personId: 'ma-xie', eventIds: [] },
  { personId: 'qin-mugong', eventIds: [] },
  { personId: 'gao-baorong', eventIds: [] },
  { personId: 'gao-baoxu', eventIds: [] },
  { personId: 'liu-sheng', eventIds: [] },
  { personId: 'seondeok-silla', eventIds: [] },
  { personId: 'jindeok-silla', eventIds: [] },
  { personId: 'sinmun-silla', eventIds: [] },
  { personId: 'wang-yenxi', eventIds: [] },
] as const;

const explicitRulerTitle = /皇帝|君主|国王|可汗|大汗|单于|汗|赞普|南诏王|苏丹|诸侯/;
const eventCatalog = [...events, ...changanEvents];
const eventById = new Map(eventCatalog.map((event) => [event.id, event]));
const peopleById = new Map(people.map((person) => [person.id, person]));
const polityIds = new Set(polities.map((polity) => polity.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));
const eventGapPersonIds = new Set<string>(eventParticipationGaps.map(({ personId }) => personId));
function overlapsLife(personId: string, eventId: string): boolean {
  const person = peopleById.get(personId);
  const event = eventById.get(eventId);
  if (!person || !event) return false;
  if (person.birthYear !== undefined && (event.endYear ?? event.year) < person.birthYear) return false;
  if (person.deathYear !== undefined && event.year > person.deathYear) return false;
  return true;
}

function governanceCandidates() {
  return requiredGovernanceGaps.flatMap((personId) => (
    personDetails.find((detail) => detail.personId === personId)?.offices
      .filter((office) => (
        explicitRulerTitle.test(office.title)
        && office.polityId !== undefined
        && polityIds.has(office.polityId)
        && office.validFrom !== undefined
        && office.validTo !== undefined
        && office.validFrom <= office.validTo
        && office.sourceIds.length > 0
        && office.sourceIds.every((sourceId) => sourceIds.has(sourceId))
      ))
      .map((office) => ({ personId, office })) ?? []
  ));
}

function eventParticipationCandidates() {
  return eventDetails.flatMap((detail) => {
    const event = eventById.get(detail.eventId);
    if (!event) return [];

    return detail.participants.flatMap((participant) => {
      if (!eventGapPersonIds.has(participant.personId) || participant.relationType === 'contextual') return [];
      if (!overlapsLife(participant.personId, event.id)) return [];

      const person = peopleById.get(participant.personId);
      const sharedSourceIds = person?.sourceIds.filter((sourceId) => (
        event.sourceIds.includes(sourceId)
        && detail.sourceIds.includes(sourceId)
        && sourceIds.has(sourceId)
      )) ?? [];
      return sharedSourceIds.length > 0
        ? [{ personId: participant.personId, eventId: event.id, sharedSourceIds }]
        : [];
    });
  });
}

describe('round one hundred eleven person relationship boundary audit', () => {
  it('keeps the current governance and event-participation gap sets closed', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toEqual(requiredGovernanceGaps);
    expect(report.requiredMissingByCategory.eventParticipation).toEqual(
      eventParticipationGaps.map(({ personId }) => personId),
    );
    expect(governanceCandidates().map(({ personId }) => personId)).toEqual(['liu-zhuang', 'fu-jian-founder', 'yelu-deguang', 'shengzong-liao', 'xingzong-liao', 'shi-zhi', 'ogedei', 'helian-ding']);
    expect(eventParticipationCandidates()).toEqual([]);
  });

  it('keeps contextual, temporally invalid, and missing-detail records outside the candidate set', () => {
    const liZhiRecords = eventDetails.flatMap((detail) => detail.participants
      .filter((participant) => participant.personId === 'li-zhi')
      .map((participant) => ({ eventId: detail.eventId, relationType: participant.relationType })));

    expect(liZhiRecords).toEqual([
      { eventId: 'ximing-temple-built', relationType: 'contextual' },
      { eventId: 'shangyang-palace-built', relationType: 'contextual' },
      { eventId: 'shangyang-palace-completed-679', relationType: 'contextual' },
    ]);

    for (const [personId, eventId] of [
      ['yuan-hong', 'northern-wei-founded'],
      ['mongke', 'mongol-founded'],
    ] as const) {
      expect(peopleById.get(personId)?.birthYear, `${personId}: birth year`)
        .toBeGreaterThan(eventById.get(eventId)!.year);
    }

  });
});
