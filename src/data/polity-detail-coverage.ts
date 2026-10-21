import type {
  CapitalTerm,
  HistoricalClaim,
  HistoricalEvent,
  HistoricalEventDetail,
  HeritageAsset,
  Person,
  Polity,
  PolityDetail,
  SourceNote,
} from '../domain/types';
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
import { polities as defaultPolities } from './polities';
import { polityDetails as defaultPolityDetails } from './polity-details';
import { sourceNotes as defaultSourceNotes } from './sources';
import { capitalHistory as defaultCapitalHistory } from './capital-history';

export type PolityDetailAssociationType = 'people' | 'events' | 'heritage' | 'capital' | 'claims';

export interface PolityDetailCoverageCatalog extends KnowledgeCoverageCatalog {
  capitalHistory: readonly CapitalTerm[];
}

export interface PolityDetailCoverageOptions {
  catalog?: PolityDetailCoverageCatalog;
}

export interface PolityDetailUnresolvedReferences {
  people: string[];
  events: string[];
  heritage: string[];
  capital: string[];
  claims: string[];
}

export interface PolityDetailCoverageItem {
  polityId: string;
  name: string;
  detailPresent: boolean;
  detailStatus: 'covered' | 'data-missing';
  knowledgeDetailStatus: CoverageStatus;
  missingFields: string[];
  missingAssociationTypes: PolityDetailAssociationType[];
  unresolvedReferenceIds: PolityDetailUnresolvedReferences;
  sourceIds: string[];
  unknownSourceIds: string[];
  sourceComplete: boolean;
}

export interface PolityDetailCoverageReport {
  totalPolities: number;
  coveredPolityIds: string[];
  uncoveredPolityIds: string[];
  detailCoverageRate: number;
  sourceCompletePolityIds: string[];
  sourceCoverageRate: number;
  knowledgeStatusMismatches: string[];
  items: PolityDetailCoverageItem[];
}

const defaultCatalog: PolityDetailCoverageCatalog = {
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
  capitalHistory: defaultCapitalHistory,
};

const associationTypes: PolityDetailAssociationType[] = ['capital', 'claims', 'events', 'heritage', 'people'];

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function isPresent(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function unresolvedReferences(): PolityDetailUnresolvedReferences {
  return { people: [], events: [], heritage: [], capital: [], claims: [] };
}

function matchingCapitalPhase(detail: PolityDetail, phaseIndex: number, capitalHistory: readonly CapitalTerm[]): boolean {
  const phase = detail.capitalPhases[phaseIndex];
  return capitalHistory.some((term) => (
    term.polityId === detail.polityId
    && term.placeId === phase.placeId
    && term.validFrom === phase.validFrom
    && term.validTo === phase.validTo
  ));
}

function buildItem(
  polity: Polity,
  detail: PolityDetail | undefined,
  catalog: PolityDetailCoverageCatalog,
  knowledgeDetailStatus: CoverageStatus,
): PolityDetailCoverageItem {
  const missingFields: string[] = [];
  const unresolved = unresolvedReferences();
  const detailPresent = Boolean(detail);
  const sourceIds = unique([
    ...polity.sourceIds,
    ...(detail?.sourceIds ?? []),
  ]);
  const knownSourceIds = new Set(catalog.sourceNotes.map((source) => source.id));
  const unknownSourceIds = sourceIds.filter((sourceId) => !knownSourceIds.has(sourceId));

  if (!detail) {
    missingFields.push('detail');
  } else {
    if (!isPresent(detail.perspectiveSummary)) missingFields.push('perspectiveSummary');
    if (detail.foundationProcess.length === 0) missingFields.push('foundationProcess');
    if (detail.turningPoints.length === 0) missingFields.push('turningPoints');
    if (detail.principalFigureIds.length === 0) missingFields.push('principalFigureIds');
    if (detail.capitalPhases.length === 0) missingFields.push('capitalPhases');
    if (detail.eventIds.length === 0) missingFields.push('eventIds');
    if (!isPresent(detail.uncertaintyNote)) missingFields.push('uncertaintyNote');

    const peopleById = new Set(catalog.people.map((person) => person.id));
    unresolved.people = unique(detail.principalFigureIds.filter((id) => !peopleById.has(id)));

    const eventIds = new Set(catalog.events.map((event) => event.id));
    const eventDetailIds = new Set(catalog.eventDetails.map((eventDetail) => eventDetail.eventId));
    unresolved.events = unique(detail.eventIds.filter((id) => !eventIds.has(id) || !eventDetailIds.has(id)));

    const heritageIds = new Set(catalog.heritageAssets.map((heritage) => heritage.id));
    unresolved.heritage = unique(detail.heritageIds.filter((id) => !heritageIds.has(id)));

    unresolved.capital = unique(detail.capitalPhases
      .map((_, index) => matchingCapitalPhase(detail, index, catalog.capitalHistory) ? undefined : detail.capitalPhases[index].placeId)
      .filter((id): id is string => Boolean(id)));

    const claimIds = new Set(catalog.claims.map((claim) => claim.id));
    unresolved.claims = unique(detail.claimIds.filter((id) => !claimIds.has(id)));
  }

  const associationValues: Record<PolityDetailAssociationType, string[]> = {
    people: detail?.principalFigureIds ?? [],
    events: detail?.eventIds ?? [],
    heritage: detail?.heritageIds ?? [],
    capital: detail?.capitalPhases.map((phase) => phase.placeId) ?? [],
    claims: detail?.claimIds ?? [],
  };
  const missingAssociationTypes = associationTypes.filter((type) => (
    associationValues[type].length === 0 || unresolved[type].length > 0
  ));
  const detailStatus: PolityDetailCoverageItem['detailStatus'] = missingFields.length === 0 ? 'covered' : 'data-missing';

  return {
    polityId: polity.id,
    name: polity.name,
    detailPresent,
    detailStatus,
    knowledgeDetailStatus,
    missingFields,
    missingAssociationTypes,
    unresolvedReferenceIds: unresolved,
    sourceIds,
    unknownSourceIds,
    sourceComplete: sourceIds.length > 0 && unknownSourceIds.length === 0,
  };
}

export function buildPolityDetailCoverageReport(
  options: PolityDetailCoverageOptions = {},
): PolityDetailCoverageReport {
  const catalog = options.catalog ?? defaultCatalog;
  const knowledge = auditKnowledgeCoverage(catalog);
  const detailsById = new Map((catalog.polityDetails ?? []).map((detail) => [detail.polityId, detail]));
  const items = catalog.polities
    .map((polity) => {
      const entity = knowledge.byKey[`polity:${polity.id}`];
      const detailCheck = entity?.checks.find((check) => check.dimension === 'detail');
      return buildItem(polity, detailsById.get(polity.id), catalog, detailCheck?.status ?? 'data-missing');
    })
    .sort((left, right) => left.polityId.localeCompare(right.polityId));
  const coveredPolityIds = items.filter((item) => item.detailStatus === 'covered').map((item) => item.polityId);
  const uncoveredPolityIds = items.filter((item) => item.detailStatus !== 'covered').map((item) => item.polityId);
  const sourceCompletePolityIds = items.filter((item) => item.sourceComplete).map((item) => item.polityId);
  const knowledgeStatusMismatches = items
    .filter((item) => item.detailStatus !== item.knowledgeDetailStatus)
    .map((item) => item.polityId);
  const totalPolities = items.length;

  return {
    totalPolities,
    coveredPolityIds,
    uncoveredPolityIds,
    detailCoverageRate: totalPolities === 0 ? 0 : coveredPolityIds.length / totalPolities,
    sourceCompletePolityIds,
    sourceCoverageRate: totalPolities === 0 ? 0 : sourceCompletePolityIds.length / totalPolities,
    knowledgeStatusMismatches,
    items,
  };
}
