import type { HistoricalClaim, HistoricalEvent, HistoricalEventDetail, Person, Polity } from '../domain/types';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

export type PolityCoverageGapCode =
  | 'missing-establishment-event'
  | 'missing-associated-person'
  | 'missing-source'
  | 'missing-explicit-relationship'
  | 'unresolved-event-reference'
  | 'unresolved-person-reference'
  | 'unresolved-source-reference';

export interface PolityCoverageGap {
  code: PolityCoverageGapCode;
  message: string;
  ids?: string[];
}

export interface PolityCoverageRelationship {
  claimId: string;
  predicate: string;
  personId?: string;
  subjectId: string;
  objectId?: string;
  sourceIds: string[];
}

export interface PolityCoverageItem {
  polityId: string;
  name: string;
  hasEstablishmentNode: boolean;
  establishmentEventIds: string[];
  eventIds: string[];
  personIds: string[];
  sourceIds: string[];
  relationships: PolityCoverageRelationship[];
  gaps: PolityCoverageGap[];
}

export interface PolityCoverageReport {
  totalPolities: number;
  polities: PolityCoverageItem[];
  establishmentCoverageRate: number;
  gapCounts: Record<PolityCoverageGapCode, number>;
  byPolity: (polityId: string) => PolityCoverageItem;
}

const establishmentText = /建立|建国|建朝|建政|政权建立|改国号|称帝|称王|即位|受禅|代汉|统一六国|三国开始|五代开始|完成建国|形成独立格局/;

function eventText(detail: HistoricalEventDetail): string {
  return [
    detail.eventId,
    ...detail.phases?.flatMap((phase) => [phase.label, phase.summary]) ?? [],
  ].join(' ');
}

function isEstablishmentDetailForPolity(
  polity: Polity,
  detail: HistoricalEventDetail,
  eventTitle?: string,
  eventSummary?: string,
  eventCategory?: string,
): boolean {
  if (eventCategory === '称帝／政权制度化' || eventCategory === '权力继承／政权形成') return false;
  const text = [eventTitle, eventSummary, eventText(detail)].filter(Boolean).join(' ');
  if (!establishmentText.test(text)) return false;
  if (/建立.*政治条件|建国.*条件/.test(text)) return false;
  if (/建立(?:新政权|大齐政权)/.test(text)) return false;
  if (/统一六国|建立秦帝国/.test(text) && polity.name !== '秦') return false;
  if (/唐建立/.test(text) && polity.name !== '唐') return false;
  if (/后梁建立/.test(text) && polity.id !== 'liang_later') return false;
  return true;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function relationshipForPolity(claim: HistoricalClaim, personIds: Set<string>): PolityCoverageRelationship {
  return {
    claimId: claim.id,
    predicate: claim.predicate,
    subjectId: claim.subjectId,
    objectId: claim.objectId,
    personId: personIds.has(claim.subjectId) ? claim.subjectId : undefined,
    sourceIds: claim.sourceIds,
  };
}

function buildItem(
  polity: Polity,
  detailById: Map<string, HistoricalEventDetail>,
  eventTitles: Map<string, { title: string; summary: string; category?: string }>,
  peopleById: Map<string, Person>,
  sourceIds: Set<string>,
): PolityCoverageItem {
  const linkedDetails = eventDetails.filter((detail) => detail.polityIds.includes(polity.id));
  const eventIds = unique(linkedDetails.map((detail) => detail.eventId));
  const establishmentEventIds = linkedDetails
    .filter((detail) => {
      const event = eventTitles.get(detail.eventId);
      return isEstablishmentDetailForPolity(polity, detail, event?.title, event?.summary, event?.category);
    })
    .map((detail) => detail.eventId);

  const directPersonIds = people
    .filter((person) => person.polityIds?.includes(polity.id))
    .map((person) => person.id);
  const participantIds = linkedDetails.flatMap((detail) => detail.participants.map((participant) => participant.personId));
  const personIds = unique(directPersonIds.filter((personId) => peopleById.has(personId)));

  const polityClaims = claims.filter((claim) => claim.objectId === polity.id);
  const relationships = polityClaims
    .map((claim) => relationshipForPolity(claim, new Set(personIds)))
    .sort((left, right) => left.claimId.localeCompare(right.claimId));

  const allSourceIds = unique([
    ...polity.sourceIds,
    ...linkedDetails.flatMap((detail) => detail.sourceIds),
    ...personIds.flatMap((personId) => peopleById.get(personId)?.sourceIds ?? []),
    ...polityClaims.flatMap((claim) => claim.sourceIds),
  ]);
  const knownSourceIds = allSourceIds.filter((sourceId) => sourceIds.has(sourceId));
  const unknownEventIds = linkedDetails.flatMap((detail) =>
    detail.relatedEventIds.filter((eventId) => !detailById.has(eventId)));
  const unknownPersonIds = unique(participantIds.filter((personId) => !peopleById.has(personId)));
  const unknownSourceIds = allSourceIds.filter((sourceId) => !sourceIds.has(sourceId));
  const gaps: PolityCoverageGap[] = [];

  if (establishmentEventIds.length === 0) {
    gaps.push({ code: 'missing-establishment-event', message: '目录中没有可由现有事件详情明确支持的建政或政权成立节点。' });
  }
  if (personIds.length === 0) {
    gaps.push({ code: 'missing-associated-person', message: '目录中没有通过人物目录或事件参与者明确关联的人物。' });
  }
  if (knownSourceIds.length === 0) {
    gaps.push({ code: 'missing-source', message: '当前关联记录没有可用的来源 ID。' });
  }
  if (relationships.length === 0) {
    gaps.push({ code: 'missing-explicit-relationship', message: '当前 claims 中没有明确连接到该政权的关系记录。' });
  }
  if (unknownEventIds.length > 0) {
    gaps.push({ code: 'unresolved-event-reference', message: '事件详情引用了目录外的关联事件。', ids: unique(unknownEventIds) });
  }
  if (unknownPersonIds.length > 0) {
    gaps.push({ code: 'unresolved-person-reference', message: '事件参与者引用了人物目录外的人物。', ids: unknownPersonIds });
  }
  if (unknownSourceIds.length > 0) {
    gaps.push({ code: 'unresolved-source-reference', message: '关联记录引用了来源目录外的来源。', ids: unique(unknownSourceIds) });
  }

  return {
    polityId: polity.id,
    name: polity.name,
    hasEstablishmentNode: establishmentEventIds.length > 0,
    establishmentEventIds: unique(establishmentEventIds),
    eventIds,
    personIds,
    sourceIds: knownSourceIds,
    relationships,
    gaps,
  };
}

export function auditPolityCoverage(
  catalog: { polities: Polity[]; events: HistoricalEvent[]; eventDetails: HistoricalEventDetail[]; people: Person[]; claims: HistoricalClaim[]; sourceNotes: typeof sourceNotes } = {
    polities, events, eventDetails, people, claims, sourceNotes,
  },
): PolityCoverageReport {
  const detailById = new Map(catalog.eventDetails.map((detail) => [detail.eventId, detail]));
  const eventTitles = new Map(catalog.events.map((event) => [event.id, { title: event.title, summary: event.summary, category: event.category }]));
  const peopleById = new Map(catalog.people.map((person) => [person.id, person]));
  const sourceIds = new Set(catalog.sourceNotes.map((source) => source.id));
  const items = catalog.polities.map((polity) => buildItem(polity, detailById, eventTitles, peopleById, sourceIds));
  const gapCounts = {} as Record<PolityCoverageGapCode, number>;
  for (const item of items) {
    for (const gap of item.gaps) gapCounts[gap.code] = (gapCounts[gap.code] ?? 0) + 1;
  }

  return {
    totalPolities: items.length,
    polities: items,
    establishmentCoverageRate: items.length === 0 ? 0 : items.filter((item) => item.hasEstablishmentNode).length / items.length,
    gapCounts,
    byPolity: (polityId) => {
      const item = items.find((candidate) => candidate.polityId === polityId);
      if (!item) throw new Error(`Unknown polity: ${polityId}`);
      return item;
    },
  };
}
