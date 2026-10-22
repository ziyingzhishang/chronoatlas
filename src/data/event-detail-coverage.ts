import type { HistoricalEvent, HistoricalEventDetail, SourceNote } from '../domain/types';
import {
  auditKnowledgeCoverage,
  type CoverageStatus,
  type KnowledgeCoverageCatalog,
} from './knowledge-coverage';
import { claims as defaultClaims } from './claims';
import { eventDetails as defaultEventDetails } from './event-details';
import { events as defaultEvents } from './events';
import { heritageAssets as defaultHeritageAssets } from './heritage';
import { heritageDetails as defaultHeritageDetails } from './heritage-details';
import { people as defaultPeople } from './people';
import { personDetails as defaultPersonDetails } from './person-details';
import { places as defaultPlaces } from './places';
import { polities as defaultPolities } from './polities';
import { polityDetails as defaultPolityDetails } from './polity-details';
import { sourceNotes as defaultSourceNotes } from './sources';

export type EventDetailCoverageStatus = 'covered' | 'needs-review' | 'unresolved';
export type EventDetailOrphanKind = 'city-history-auxiliary' | 'unclassified';
export type EventDetailCoverageCheck =
  | 'detail'
  | 'causes'
  | 'consequences'
  | 'phases'
  | 'participants'
  | 'locations'
  | 'polities'
  | 'relatedEvents'
  | 'sources'
  | 'time'
  | 'timePrecision'
  | 'uncertaintyNote';

export interface EventDetailUnresolvedReferences {
  people: string[];
  places: string[];
  polities: string[];
  relatedEvents: string[];
  sources: string[];
}

export interface EventDetailCoverageItem {
  eventId: string;
  title: string;
  status: EventDetailCoverageStatus;
  detailPresent: boolean;
  narrativeComplete: boolean;
  participantIds: string[];
  locationIds: string[];
  polityIds: string[];
  relatedEventIds: string[];
  sourceIds: string[];
  unknownSourceIds: string[];
  sourceComplete: boolean;
  timePrecision: HistoricalEvent['datePrecision'] | 'unknown';
  timePrecisionStatus: 'confirmed' | 'needs-review' | 'unresolved';
  uncertaintyPresent: boolean;
  missingChecks: EventDetailCoverageCheck[];
  needsReviewChecks: EventDetailCoverageCheck[];
  unresolvedReferenceIds: EventDetailUnresolvedReferences;
  knowledgeDetailStatus: CoverageStatus;
  knowledgeTaskCount: number;
}

export interface EventDetailCoverageReport {
  totalEvents: number;
  coveredEventIds: string[];
  needsReviewEventIds: string[];
  unresolvedEventIds: string[];
  coverageRate: number;
  statusCounts: Record<EventDetailCoverageStatus, number>;
  items: EventDetailCoverageItem[];
  orphanDetailEventIds: string[];
  orphanDetails: EventDetailOrphan[];
}

export interface EventDetailOrphan {
  eventId: string;
  kind: EventDetailOrphanKind;
  rationale: string;
}

export interface EventDetailCoverageOptions {
  catalog?: KnowledgeCoverageCatalog;
}

const defaultCatalog: KnowledgeCoverageCatalog = {
  polities: defaultPolities,
  people: defaultPeople,
  events: defaultEvents,
  eventDetails: defaultEventDetails,
  heritageAssets: defaultHeritageAssets,
  heritageDetails: defaultHeritageDetails,
  personDetails: defaultPersonDetails,
  polityDetails: defaultPolityDetails,
  claims: defaultClaims,
  sourceNotes: defaultSourceNotes,
  places: defaultPlaces,
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function present(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function emptyUnresolved(): EventDetailUnresolvedReferences {
  return { people: [], places: [], polities: [], relatedEvents: [], sources: [] };
}

function emptyStatusCounts(): Record<EventDetailCoverageStatus, number> {
  return { covered: 0, 'needs-review': 0, unresolved: 0 };
}

const cityHistoryAuxiliaryOrphanIds = new Set([
  'dong-zhuo-changan',
  'eastern-han-restores-changan',
  'former-zhao-capital-changan',
  'gengshi-enters-changan',
  'han-changan-new-city',
  'han-wudi-expands-changan',
  'huang-chao-changan',
  'later-qin-falls-changan',
  'liu-yu-captures-changan',
  'northern-zhou-changan',
  'tang-changan-occupation',
  'western-jin-loses-changan',
  'western-wei-changan',
  'zhou-fenghao-capital',
]);

function sourceIdsFor(event: HistoricalEvent, detail: HistoricalEventDetail | undefined): string[] {
  return unique([...event.sourceIds, ...(detail?.sourceIds ?? [])]);
}

function buildItem(
  event: HistoricalEvent,
  detail: HistoricalEventDetail | undefined,
  catalog: KnowledgeCoverageCatalog,
  knowledgeDetailStatus: CoverageStatus,
  knowledgeTaskCount: number,
): EventDetailCoverageItem {
  const missingChecks: EventDetailCoverageCheck[] = [];
  const needsReviewChecks: EventDetailCoverageCheck[] = [];
  const unresolvedReferenceIds = emptyUnresolved();
  const detailPresent = Boolean(detail);
  const participantIds = unique(detail?.participants.map((participant) => participant.personId) ?? []);
  const locationIds = unique(detail?.locationIds ?? []);
  const polityIds = unique(detail?.polityIds ?? []);
  const relatedEventIds = unique(detail?.relatedEventIds ?? []);
  const sourceIds = sourceIdsFor(event, detail);
  const knownPeople = new Set(catalog.people.map((person) => person.id));
  const knownPlaces = new Set((catalog.places ?? []).map((place) => place.id));
  const knownPolities = new Set(catalog.polities.map((polity) => polity.id));
  const knownEvents = new Set(catalog.events.map((candidate) => candidate.id));
  const knownSources = new Set(catalog.sourceNotes.map((source) => source.id));

  if (!detail) {
    missingChecks.push('detail');
  } else {
    if (detail.causes.length === 0) missingChecks.push('causes');
    if (detail.consequences.length === 0) missingChecks.push('consequences');
    if ((detail.phases?.length ?? 0) === 0) missingChecks.push('phases');
    if (!present(detail.uncertaintyNote)) missingChecks.push('uncertaintyNote');

    if (participantIds.length === 0) needsReviewChecks.push('participants');
    if (locationIds.length === 0) needsReviewChecks.push('locations');
    if (polityIds.length === 0) needsReviewChecks.push('polities');
    if (relatedEventIds.length === 0) needsReviewChecks.push('relatedEvents');

    unresolvedReferenceIds.people = unique(participantIds.filter((id) => !knownPeople.has(id)));
    unresolvedReferenceIds.places = unique(locationIds.filter((id) => !knownPlaces.has(id)));
    unresolvedReferenceIds.polities = unique(polityIds.filter((id) => !knownPolities.has(id)));
    unresolvedReferenceIds.relatedEvents = unique(relatedEventIds.filter((id) => !knownEvents.has(id)));
  }

  const unknownSourceIds = sourceIds.filter((sourceId) => !knownSources.has(sourceId));
  unresolvedReferenceIds.sources = unique([
    ...unknownSourceIds,
    ...(sourceIds.length === 0 ? ['<missing-source>'] : []),
  ]);
  if (unresolvedReferenceIds.sources.length > 0) missingChecks.push('sources');

  const timePrecision = event.datePrecision ?? 'unknown';
  let timePrecisionStatus: EventDetailCoverageItem['timePrecisionStatus'] = 'confirmed';
  if (!Number.isFinite(event.year)) {
    timePrecisionStatus = 'unresolved';
    missingChecks.push('time');
  } else if (timePrecision === 'unknown') {
    timePrecisionStatus = 'unresolved';
    missingChecks.push('timePrecision');
  } else if (timePrecision === 'approximate' || timePrecision === 'range') {
    timePrecisionStatus = 'needs-review';
    needsReviewChecks.push('timePrecision');
  }

  if (event.verification === 'partial') needsReviewChecks.push('uncertaintyNote');

  if (detail) {
    if (unresolvedReferenceIds.people.length > 0) missingChecks.push('participants');
    if (unresolvedReferenceIds.places.length > 0) missingChecks.push('locations');
    if (unresolvedReferenceIds.polities.length > 0) missingChecks.push('polities');
    if (unresolvedReferenceIds.relatedEvents.length > 0) missingChecks.push('relatedEvents');
  }

  const deduplicatedMissingChecks = [...new Set(missingChecks)];
  const deduplicatedReviewChecks = [...new Set(needsReviewChecks)];
  const unresolved = !detailPresent
    || deduplicatedMissingChecks.length > 0;
  const status: EventDetailCoverageStatus = unresolved
    ? 'unresolved'
    : deduplicatedReviewChecks.length > 0
      ? 'needs-review'
      : 'covered';

  return {
    eventId: event.id,
    title: event.title,
    status,
    detailPresent,
    narrativeComplete: Boolean(detail)
      && detail!.causes.length > 0
      && detail!.consequences.length > 0
      && (detail!.phases?.length ?? 0) > 0,
    participantIds,
    locationIds,
    polityIds,
    relatedEventIds,
    sourceIds,
    unknownSourceIds,
    sourceComplete: sourceIds.length > 0 && unknownSourceIds.length === 0,
    timePrecision,
    timePrecisionStatus,
    uncertaintyPresent: present(detail?.uncertaintyNote),
    missingChecks: deduplicatedMissingChecks,
    needsReviewChecks: deduplicatedReviewChecks,
    unresolvedReferenceIds,
    knowledgeDetailStatus,
    knowledgeTaskCount,
  };
}

export function buildEventDetailCoverageReport(
  options: EventDetailCoverageOptions = {},
): EventDetailCoverageReport {
  const catalog = options.catalog ?? defaultCatalog;
  const knowledge = auditKnowledgeCoverage(catalog);
  const detailById = new Map(catalog.eventDetails.map((detail) => [detail.eventId, detail]));
  const items = catalog.events
    .map((event) => {
      const entity = knowledge.byKey[`event:${event.id}`];
      const detailCheck = entity?.checks.find((check) => check.dimension === 'detail');
      const knowledgeTaskCount = knowledge.tasks.filter((task) => (
        task.entityType === 'event' && task.entityId === event.id
      )).length;
      return buildItem(
        event,
        detailById.get(event.id),
        catalog,
        detailCheck?.status ?? 'data-missing',
        knowledgeTaskCount,
      );
    })
    .sort((left, right) => left.eventId.localeCompare(right.eventId));
  const statusCounts = emptyStatusCounts();
  items.forEach((item) => { statusCounts[item.status] += 1; });
  const coveredEventIds = items.filter((item) => item.status === 'covered').map((item) => item.eventId);
  const needsReviewEventIds = items.filter((item) => item.status === 'needs-review').map((item) => item.eventId);
  const unresolvedEventIds = items.filter((item) => item.status === 'unresolved').map((item) => item.eventId);
  const eventIds = new Set(catalog.events.map((event) => event.id));
  const orphanDetailEventIds = unique(catalog.eventDetails
    .map((detail) => detail.eventId)
    .filter((eventId) => !eventIds.has(eventId)));
  const orphanDetails: EventDetailOrphan[] = orphanDetailEventIds.map((eventId) => (
    cityHistoryAuxiliaryOrphanIds.has(eventId)
      ? {
        eventId,
        kind: 'city-history-auxiliary',
        rationale: '该详情描述城市、都城或城市阶段变化，作为城市史辅助节点保留，不冒充主事件目录中的独立历史事件。',
      }
      : {
        eventId,
        kind: 'unclassified',
        rationale: '该孤立详情尚未完成与主事件目录的证据绑定，暂不进入主事件覆盖率。',
      }
  ));

  return {
    totalEvents: items.length,
    coveredEventIds,
    needsReviewEventIds,
    unresolvedEventIds,
    coverageRate: items.length === 0 ? 0 : coveredEventIds.length / items.length,
    statusCounts,
    items,
    orphanDetailEventIds,
    orphanDetails,
  };
}

export function getEventDetailSourceNotes(sourceIds: readonly string[], sourceNotes: readonly SourceNote[] = defaultSourceNotes): SourceNote[] {
  const sourceSet = new Set(sourceIds);
  return sourceNotes.filter((source) => sourceSet.has(source.id));
}
