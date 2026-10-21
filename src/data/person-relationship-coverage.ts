import type {
  HistoricalClaim,
  HistoricalEvent,
  HistoricalEventDetail,
  Person,
  Polity,
} from '../domain/types';
import {
  auditKnowledgeCoverage,
  type CoverageStatus,
  type KnowledgeCoverageCatalog,
} from './knowledge-coverage';
import { claims as defaultClaims } from './claims';
import { eventDetails as defaultEventDetails } from './event-details';
import { events as defaultEvents } from './events';
import { people as defaultPeople } from './people';
import { polities as defaultPolities } from './polities';
import { heritageAssets as defaultHeritageAssets } from './heritage';
import { heritageDetails as defaultHeritageDetails, type HeritageDetail } from './heritage-details';
import { personDetails as defaultPersonDetails } from './person-details';
import { polityDetails as defaultPolityDetails } from './polity-details';
import { sourceNotes as defaultSourceNotes } from './sources';

export const personRelationshipCategoryKeys = [
  'governance',
  'kinship',
  'allianceConflict',
  'eventParticipation',
] as const;

export type PersonRelationshipCategory = typeof personRelationshipCategoryKeys[number];
export type PersonRelationshipCategoryStatus = 'covered' | 'missing' | 'not-applicable';

export interface PersonRelationshipCategoryCoverage {
  status: PersonRelationshipCategoryStatus;
  evidenceIds: string[];
  relatedIds: string[];
  note: string;
}

export interface PersonRelationshipCoverageCatalog extends KnowledgeCoverageCatalog {
  polities: Polity[];
  people: Person[];
  events: HistoricalEvent[];
  eventDetails: HistoricalEventDetail[];
  heritageAssets: KnowledgeCoverageCatalog['heritageAssets'];
  heritageDetails: HeritageDetail[];
}

export interface PersonRelationshipCoverageOptions {
  catalog?: PersonRelationshipCoverageCatalog;
  notApplicableByPersonId?: Partial<Record<string, readonly PersonRelationshipCategory[]>>;
}

export interface PersonRelationshipCoverageRecord {
  personId: string;
  personName: string;
  reachable: boolean;
  complete: boolean;
  genericOnly: boolean;
  relationshipClaimIds: string[];
  genericRelationClaimIds: string[];
  categories: Record<PersonRelationshipCategory, PersonRelationshipCategoryCoverage>;
  missingCategoryKeys: PersonRelationshipCategory[];
  notApplicableCategoryKeys: PersonRelationshipCategory[];
  knowledgeRelationshipStatus: CoverageStatus;
  knowledgeTask: boolean;
}

export interface PersonRelationshipCoverageReport {
  totalPeople: number;
  records: PersonRelationshipCoverageRecord[];
  byPersonId: Record<string, PersonRelationshipCoverageRecord>;
  reachablePersonIds: string[];
  unreachablePersonIds: string[];
  completePersonIds: string[];
  incompletePersonIds: string[];
  genericOnlyPersonIds: string[];
  missingByCategory: Record<PersonRelationshipCategory, string[]>;
  notApplicableByCategory: Record<PersonRelationshipCategory, string[]>;
  needsSupplementPersonIds: string[];
  knowledgeTaskPersonIds: string[];
  knowledgeRelationshipCoveredButIncompletePersonIds: string[];
  knowledgeStatusMismatches: string[];
}

const governancePredicates = new Set(['served', 'appointed', 'succeeded', 'ruled']);
const kinshipPredicates = new Set(['parent-of', 'child-of', 'sibling-of', 'spouse-of']);
const allianceConflictPredicates = new Set(['ally-of', 'enemy-of']);
const genericPredicates = new Set(['related-to']);
const personPersonPredicates = new Set([
  ...kinshipPredicates,
  ...allianceConflictPredicates,
  'served',
  'appointed',
  'related-to',
]);

const defaultCatalog: PersonRelationshipCoverageCatalog = {
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
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function emptyCategories(): Record<PersonRelationshipCategory, PersonRelationshipCategoryCoverage> {
  return {
    governance: { status: 'missing', evidenceIds: [], relatedIds: [], note: '未找到 served、appointed、succeeded 或 ruled 关系。' },
    kinship: { status: 'missing', evidenceIds: [], relatedIds: [], note: '未找到 parent、child、sibling 或 spouse 关系。' },
    allianceConflict: { status: 'missing', evidenceIds: [], relatedIds: [], note: '未找到 ally 或 enemy 关系。' },
    eventParticipation: { status: 'missing', evidenceIds: [], relatedIds: [], note: '未找到参与事件 claim 或事件详情参与记录。' },
  };
}

function categoryForPredicate(predicate: string): PersonRelationshipCategory | undefined {
  if (governancePredicates.has(predicate)) return 'governance';
  if (kinshipPredicates.has(predicate)) return 'kinship';
  if (allianceConflictPredicates.has(predicate)) return 'allianceConflict';
  if (predicate === 'participated-in') return 'eventParticipation';
  return undefined;
}

function knownEndpoint(
  claim: HistoricalClaim,
  personId: string,
  people: Set<string>,
  polities: Set<string>,
  events: Set<string>,
): boolean {
  const otherEndpointId = claim.subjectId === personId ? claim.objectId : claim.subjectId;
  if (!otherEndpointId) return false;
  const otherEndpointIsPerson = people.has(otherEndpointId);
  if (personPersonPredicates.has(claim.predicate)) return otherEndpointIsPerson;
  if (governancePredicates.has(claim.predicate)) {
    return claim.predicate === 'served' || claim.predicate === 'appointed'
      ? otherEndpointIsPerson || polities.has(otherEndpointId)
      : polities.has(otherEndpointId);
  }
  if (claim.predicate === 'participated-in') return events.has(otherEndpointId);
  return otherEndpointIsPerson;
}

function categoryCoverage(
  person: Person,
  claims: HistoricalClaim[],
  eventDetails: HistoricalEventDetail[],
  people: Set<string>,
  polities: Set<string>,
  events: Set<string>,
  notApplicable: Set<PersonRelationshipCategory>,
): { categories: Record<PersonRelationshipCategory, PersonRelationshipCategoryCoverage>; relationshipClaimIds: string[]; genericRelationClaimIds: string[]; reachable: boolean } {
  const categories = emptyCategories();
  const relationshipClaims = claims.filter((claim) => (
    (claim.subjectId === person.id || claim.objectId === person.id)
    && knownEndpoint(claim, person.id, people, polities, events)
  ));
  const genericRelationClaimIds = relationshipClaims
    .filter((claim) => genericPredicates.has(claim.predicate))
    .map((claim) => claim.id);

  relationshipClaims.forEach((claim) => {
    const category = categoryForPredicate(claim.predicate);
    if (!category) return;
    const entry = categories[category];
    entry.evidenceIds.push(`claim:${claim.id}`);
    if (claim.subjectId === person.id && claim.objectId) entry.relatedIds.push(claim.objectId);
    if (claim.objectId === person.id) entry.relatedIds.push(claim.subjectId);
  });

  eventDetails
    .filter((detail) => events.has(detail.eventId) && detail.participants.some((participant) => participant.personId === person.id))
    .forEach((detail) => {
      categories.eventParticipation.evidenceIds.push(`event-detail:${detail.eventId}`);
      categories.eventParticipation.relatedIds.push(detail.eventId);
    });

  personRelationshipCategoryKeys.forEach((category) => {
    const entry = categories[category];
    entry.evidenceIds = unique(entry.evidenceIds);
    entry.relatedIds = unique(entry.relatedIds);
    if (notApplicable.has(category)) {
      entry.status = 'not-applicable';
      entry.note = '该类别由调用方明确标记为当前人物不适用，不能等同于已补齐。';
    } else if (entry.evidenceIds.length > 0) {
      entry.status = 'covered';
      entry.note = '至少存在一条可解析且属于该类别的关系证据。';
    }
  });

  return {
    categories,
    relationshipClaimIds: unique(relationshipClaims.map((claim) => claim.id)),
    genericRelationClaimIds: unique(genericRelationClaimIds),
    reachable: relationshipClaims.length > 0 || categories.eventParticipation.evidenceIds.length > 0,
  };
}

function buildRecord(
  person: Person,
  catalog: PersonRelationshipCoverageCatalog,
  knowledge: ReturnType<typeof auditKnowledgeCoverage>,
  notApplicable: Set<PersonRelationshipCategory>,
): PersonRelationshipCoverageRecord {
  const people = new Set(catalog.people.map((item) => item.id));
  const polities = new Set(catalog.polities.map((item) => item.id));
  const events = new Set(catalog.events.map((item) => item.id));
  const coverage = categoryCoverage(person, catalog.claims, catalog.eventDetails, people, polities, events, notApplicable);
  const categories = coverage.categories;
  const missingCategoryKeys = personRelationshipCategoryKeys.filter((key) => categories[key].status === 'missing');
  const notApplicableCategoryKeys = personRelationshipCategoryKeys.filter((key) => categories[key].status === 'not-applicable');
  const complete = missingCategoryKeys.length === 0;
  const knowledgeEntity = knowledge.byKey[`person:${person.id}`];
  const knowledgeRelationshipStatus = knowledgeEntity?.checks.find((check) => check.dimension === 'relationship')?.status ?? 'relationship-missing';
  const knowledgeTask = knowledge.tasks.some((task) => task.entityType === 'person' && task.entityId === person.id && task.taskKind === 'person-person-relationship-missing');
  return {
    personId: person.id,
    personName: person.name,
    reachable: coverage.reachable,
    complete,
    genericOnly: coverage.genericRelationClaimIds.length > 0 && !personRelationshipCategoryKeys.some((key) => categories[key].status === 'covered'),
    relationshipClaimIds: coverage.relationshipClaimIds,
    genericRelationClaimIds: coverage.genericRelationClaimIds,
    categories,
    missingCategoryKeys,
    notApplicableCategoryKeys,
    knowledgeRelationshipStatus,
    knowledgeTask,
  };
}

export function buildPersonRelationshipCoverageReport(
  options: PersonRelationshipCoverageOptions = {},
): PersonRelationshipCoverageReport {
  const catalog = options.catalog ?? defaultCatalog;
  const knowledge = auditKnowledgeCoverage(catalog);
  const records = catalog.people.map((person) => buildRecord(
    person,
    catalog,
    knowledge,
    new Set(options.notApplicableByPersonId?.[person.id] ?? []),
  ));
  const byPersonId = Object.fromEntries(records.map((record) => [record.personId, record]));
  const missingByCategory = Object.fromEntries(personRelationshipCategoryKeys.map((key) => [
    key,
    records.filter((record) => record.missingCategoryKeys.includes(key)).map((record) => record.personId),
  ])) as Record<PersonRelationshipCategory, string[]>;
  const notApplicableByCategory = Object.fromEntries(personRelationshipCategoryKeys.map((key) => [
    key,
    records.filter((record) => record.notApplicableCategoryKeys.includes(key)).map((record) => record.personId),
  ])) as Record<PersonRelationshipCategory, string[]>;
  const incompletePersonIds = records.filter((record) => !record.complete).map((record) => record.personId);
  return {
    totalPeople: records.length,
    records,
    byPersonId,
    reachablePersonIds: records.filter((record) => record.reachable).map((record) => record.personId),
    unreachablePersonIds: records.filter((record) => !record.reachable).map((record) => record.personId),
    completePersonIds: records.filter((record) => record.complete).map((record) => record.personId),
    incompletePersonIds,
    genericOnlyPersonIds: records.filter((record) => record.genericOnly).map((record) => record.personId),
    missingByCategory,
    notApplicableByCategory,
    needsSupplementPersonIds: incompletePersonIds,
    knowledgeTaskPersonIds: records.filter((record) => record.knowledgeTask).map((record) => record.personId),
    knowledgeRelationshipCoveredButIncompletePersonIds: records
      .filter((record) => record.knowledgeRelationshipStatus === 'covered' && !record.complete)
      .map((record) => record.personId),
    knowledgeStatusMismatches: records
      .filter((record) => {
        if (record.knowledgeRelationshipStatus === 'not-applicable') return false;
        const reachabilityStatus = record.reachable ? 'covered' : 'relationship-missing';
        return record.knowledgeRelationshipStatus !== reachabilityStatus;
      })
      .map((record) => record.personId),
  };
}
